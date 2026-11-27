import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync(path.resolve('apps/web/.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > -1) {
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[k] = v;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://swmklobpnrkjpfackboc.supabase.co';
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function seedFromJsonFiles() {
  const dataDir = path.resolve('apps/web/data/vocabulary');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).sort();
  console.log(`--- POBLANDO BANCO MAESTRO (${files.length} archivos JSON) EN SUPABASE ---`);

  for (const file of files) {
    const items = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    console.log(`\nArchivo ${file}: ${items.length} registros...`);

    for (const item of items) {
      const { data: wordRec, error: wErr } = await supabase
        .from('vocabulary_words')
        .upsert({
          word: item.word,
          category: item.category || 'cefr_general',
          cefr_level: item.cefrLevel,
          part_of_speech: item.partOfSpeech,
          ipa: item.ipa || null,
          thematic_cluster: item.thematicCluster || null
        }, { onConflict: 'word,category,cefr_level' })
        .select('id')
        .single();

      if (wErr || !wordRec) {
        console.error(`Error with word "${item.word}":`, wErr?.message);
        if (wErr?.message?.includes('Could not find the table')) {
          console.error('Ejecuta primero apps/web/scripts/vocabulary_schema.sql en el SQL Editor de Supabase.');
          return;
        }
        continue;
      }

      const wordId = wordRec.id;
      for (const s of (item.senses || [])) {
        const { data: senseRec, error: sErr } = await supabase
          .from('vocabulary_senses')
          .upsert({
            word_id: wordId,
            sense_index: s.senseIndex || 1,
            cefr_level_target: s.cefrLevelTarget || item.cefrLevel,
            definition_en: s.definitionEn,
            definition_es: s.definitionEs,
            example_sentence_en: s.exampleSentenceEn,
            example_sentence_es: s.exampleSentenceEs,
            collocations: s.collocations || [],
            notes: s.notes || null
          }, { onConflict: 'word_id,sense_index' })
          .select('id')
          .single();

        if (!sErr && senseRec && s.senseIndex === 1 && Array.isArray(item.relations)) {
          for (const rel of item.relations) {
            await supabase
              .from('vocabulary_relations')
              .upsert({
                source_sense_id: senseRec.id,
                target_word: rel.targetWord,
                target_definition_es: rel.targetDefinitionEs || null,
                relation_type: rel.relationType
              }, { onConflict: 'source_sense_id,target_word,relation_type' });
          }
        }
      }
    }
    console.log(`✓ ${file} procesado.`);
  }

  console.log('--- SEED COMPLETO FINALIZADO ---');
}

seedFromJsonFiles().catch(console.error);
