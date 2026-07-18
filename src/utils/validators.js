// src/utils/validators.js — small, dependency-free form validators.

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password) => password.length >= 6;

export const isNonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

export const isValidInviteCode = (code) => /^[A-Z0-9]{6}$/.test(code.trim().toUpperCase());
