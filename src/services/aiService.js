// src/services/aiService.js
//
// Owned by Developer 2. Wraps the Gemini API for "AI Quick Add":
// user types "Add milk, bread and toothpaste" -> we get back a
// structured list of { name, category, quantity } the UI can render
// and hand to shoppingService.addItems().
//
// Uses the plain REST endpoint (no SDK dependency) so it's easy to
// swap models or move this call into a Cloud Function later without
// touching the UI at all.

import { ITEM_CATEGORIES } from '../models/ShoppingItem';

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `You are a grocery list parser for a shopping app. Extract each distinct
item from the user's message. For each item return: "name" (singular, capitalized,
no quantity words), "quantity" (a number, default 1), and "category" — pick the closest
match from this fixed list: ${ITEM_CATEGORIES.join(', ')}.

Respond with ONLY a JSON array, no markdown fences, no commentary. Example:
[{"name":"Milk","quantity":1,"category":"Dairy"},{"name":"Bread","quantity":1,"category":"Bakery"}]`;

/**
 * Sends free-text like "Add milk, bread and toothpaste" to Gemini and
 * returns a parsed array of { name, quantity, category }.
 * Throws a friendly error if the API fails or returns unparseable output.
 */
export const extractItemsFromText = async (text) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('AI Quick Add is not configured (missing Gemini API key).');

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    throw new Error('AI Quick Add failed to reach Gemini. Please try again.');
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Couldn't understand that. Try rephrasing, e.g. 'Add milk and bread'.");

  return parseAndValidate(raw);
};

/** Parses Gemini's JSON output defensively and normalizes each item. */
const parseAndValidate = (raw) => {
  let parsed;
  try {
    // Strip accidental markdown fences just in case the model adds them.
    const cleaned = raw.trim().replace(/^```json\s*|\s*```$/g, '');
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Couldn't parse the AI response. Please try again.");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('No items were recognized in that text.');
  }

  return parsed
    .filter((item) => item?.name)
    .map((item) => ({
      name: String(item.name).trim(),
      quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
      category: ITEM_CATEGORIES.includes(item.category) ? item.category : 'Other',
    }));
};
