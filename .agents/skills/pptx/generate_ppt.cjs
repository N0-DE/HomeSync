const pptxgen = require('pptxgenjs');
const pres = new pptxgen();

pres.layout = 'LAYOUT_16x9';

// Define master slide for consistent branding
pres.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: 'FFFFFF' },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.2, fill: { color: '028090' } } }
  ]
});

// Slide 1: Title
const slide1 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide1.background = { color: '028090' };
slide1.addText('HomeSync', {
  x: '10%', y: '35%', w: '80%', h: 1,
  fontSize: 54, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Calibri'
});
slide1.addText('The Ultimate Family Organization App', {
  x: '10%', y: '50%', w: '80%', h: 0.5,
  fontSize: 24, color: 'E0F7FA', align: 'center', fontFace: 'Calibri'
});

// Slide 2: The Problem
const slide2 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide2.addText('The Challenge of Modern Family Life', {
  x: 0.5, y: 0.5, w: '90%', h: 1,
  fontSize: 36, bold: true, color: '028090', fontFace: 'Calibri'
});
slide2.addText([
  { text: 'Schedules are chaotic and constantly changing', options: { breakLine: true, bullet: true } },
  { text: 'Groceries are forgotten or bought twice', options: { breakLine: true, bullet: true } },
  { text: 'Communication gets lost in endless group chats', options: { breakLine: true, bullet: true } },
  { text: 'It\'s hard to know where everyone is or what they need', options: { bullet: true } }
], {
  x: 0.5, y: 2.0, w: '80%', h: 3,
  fontSize: 20, color: '36454F', fontFace: 'Calibri', paraSpaceAfter: 12
});

// Slide 3: The Solution - HomeSync
const slide3 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide3.addText('Meet HomeSync', {
  x: 0.5, y: 0.5, w: '90%', h: 1,
  fontSize: 36, bold: true, color: '028090', fontFace: 'Calibri'
});
slide3.addText('One central hub designed to keep your family perfectly in sync. With features tailored for household management, HomeSync replaces fragmented tools with a single, elegant solution.', {
  x: 0.5, y: 1.8, w: '80%', h: 2,
  fontSize: 20, color: '36454F', fontFace: 'Calibri'
});

// Slide 4: Key Features
const slide4 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide4.addText('Core Features', {
  x: 0.5, y: 0.5, w: '90%', h: 1,
  fontSize: 36, bold: true, color: '028090', fontFace: 'Calibri'
});

// Feature 1
slide4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.5, y: 1.5, w: 4.2, h: 1.5, fill: { color: 'F2F2F2' }, rectRadius: 0.1
});
slide4.addText('Smart Shopping List', { x: 0.7, y: 1.6, w: 3.8, h: 0.4, fontSize: 18, bold: true, color: '028090' });
slide4.addText('Add items via AI voice commands. Syncs instantly with everyone.', { x: 0.7, y: 2.0, w: 3.8, h: 0.8, fontSize: 14, color: '36454F', margin: 0 });

// Feature 2
slide4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 5.3, y: 1.5, w: 4.2, h: 1.5, fill: { color: 'F2F2F2' }, rectRadius: 0.1
});
slide4.addText('Family Activity Feed', { x: 5.5, y: 1.6, w: 3.8, h: 0.4, fontSize: 18, bold: true, color: '028090' });
slide4.addText('See updates on member statuses, list changes, and family events in real-time.', { x: 5.5, y: 2.0, w: 3.8, h: 0.8, fontSize: 14, color: '36454F', margin: 0 });

// Feature 3
slide4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.5, y: 3.5, w: 4.2, h: 1.5, fill: { color: 'F2F2F2' }, rectRadius: 0.1
});
slide4.addText('Location Geofencing', { x: 0.7, y: 3.6, w: 3.8, h: 0.4, fontSize: 18, bold: true, color: '028090' });
slide4.addText('Get notified when a family member is near a store while items are pending.', { x: 0.7, y: 4.0, w: 3.8, h: 0.8, fontSize: 14, color: '36454F', margin: 0 });

// Feature 4
slide4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 5.3, y: 3.5, w: 4.2, h: 1.5, fill: { color: 'F2F2F2' }, rectRadius: 0.1
});
slide4.addText('Custom Map Pins', { x: 5.5, y: 3.6, w: 3.8, h: 0.4, fontSize: 18, bold: true, color: '028090' });
slide4.addText('Drop your own pins on the map for local shops missing from public databases.', { x: 5.5, y: 4.0, w: 3.8, h: 0.8, fontSize: 14, color: '36454F', margin: 0 });

// Slide 5: Conclusion
const slide5 = pres.addSlide({ masterName: 'MASTER_SLIDE' });
slide5.background = { color: '028090' };
slide5.addText('Ready to Sync Your Home?', {
  x: '10%', y: '40%', w: '80%', h: 1,
  fontSize: 44, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Calibri'
});
slide5.addText('Download HomeSync today.', {
  x: '10%', y: '60%', w: '80%', h: 0.5,
  fontSize: 24, color: 'E0F7FA', align: 'center', fontFace: 'Calibri'
});

const outputPath = 'c:\\Users\\JOSE ANOOB\\.gemini\\antigravity\\brain\\64be305d-07d3-4e76-8c8c-ab1efce17801\\HomeSync_Pitch.pptx';
pres.writeFile({ fileName: outputPath })
  .then(fileName => console.log('created file: ' + fileName))
  .catch(err => console.error(err));
