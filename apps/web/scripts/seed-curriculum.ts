import { fetchAirtableRecord, findAirtableRecords, patchAirtableRecord } from '../lib/airtable';

async function seedCurriculum() {
  console.log('Iniciando auditoría y llenado del Curriculum...');
  try {
    const topics = await findAirtableRecords('CurriculumTopics', 'NOT({Order} = "")');
    console.log(`Encontrados ${topics.length} temas.`);

    let updatedCount = 0;

    for (const topic of topics) {
      const fields = topic.fields;
      let needsUpdate = false;
      const patchData: any = {};

      if (!fields['LDSFormula']) {
        patchData['LDSFormula'] = `Formula para ${fields['Title'] || 'este tema'}`;
        needsUpdate = true;
      }
      
      if (!fields['AIContext']) {
        patchData['AIContext'] = `Contexto IA para que Gemini genere retos sobre ${fields['Title'] || 'este tema'}. Regla principal: ...`;
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log(`Actualizando tema ${topic.id} - ${fields['Title']}...`);
        await patchAirtableRecord('CurriculumTopics', topic.id, patchData);
        updatedCount++;
        await new Promise(r => setTimeout(r, 500)); // Rate limit
      }
    }

    console.log(`Auditoría finalizada. Se actualizaron ${updatedCount} temas.`);
  } catch (error) {
    console.error('Error durante el seed:', error);
  }
}

seedCurriculum();
