const fs = require('fs');
const path = require('path');

// Helper to escape CSV cell content
function escapeCsv(str) {
  if (str === undefined || str === null) return '""';
  const val = String(str).replace(/"/g, '""');
  return `"${val}"`;
}

// Import pack data directly
const { BUILTIN_FLASHCARD_PACKS } = require('../lib/flashcards');

// CSV Headers
const headers = [
  'Pack ID',
  'Pack Title',
  'Pack Category',
  'Pack Level',
  'Card ID',
  'Word / Expression',
  'IPA Pronunciation',
  'English Definition',
  'Spanish Translation',
  'Spanish Definition Translation',
  'Image Path',
  'Hotspot X',
  'Hotspot Y',
  'AI Image Generation Prompt (LLM / Midjourney / DALL-E)'
];

const rows = [headers.map(escapeCsv).join(',')];

BUILTIN_FLASHCARD_PACKS.forEach(pack => {
  pack.cards.forEach(card => {
    const row = [
      pack.id,
      pack.title,
      pack.category,
      pack.level,
      card.id,
      card.word,
      card.ipa || '',
      card.definitionEn,
      card.translationEs,
      card.definitionTranslationEs,
      card.imageSrc,
      card.hotspotCoordinates ? card.hotspotCoordinates.x : '',
      card.hotspotCoordinates ? card.hotspotCoordinates.y : '',
      card.imagePrompt || ''
    ];
    rows.push(row.map(escapeCsv).join(','));
  });
});

const csvContent = rows.join('\n');

const targets = [
  path.join(__dirname, '../public/flashcards_vocabulary.csv'),
  path.join(__dirname, '../../flashcards_vocabulary.csv')
];

targets.forEach(target => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, csvContent, 'utf8');
  console.log(`Successfully generated CSV at: ${target}`);
});
