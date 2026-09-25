import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Cargar env
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k) envVars[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '')
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Activando Pocket Coach para todos los estudiantes activos...')
  
  // Buscar todos los activos
  const { data: students, error } = await supabase
    .from('students')
    .select('id, "Full Name"')
    .eq('Status', 'Active')
    
  if (error) {
    console.error('Error buscando estudiantes:', error)
    process.exit(1)
  }
  
  console.log(`Encontrados ${students.length} estudiantes activos.`)
  
  // Actualizar
  const { data: updated, error: updateError } = await supabase
    .from('students')
    .update({ 'Pocket Coach Status': 'Active' })
    .eq('Status', 'Active')
    .select('id, "Full Name", "Pocket Coach Status"')
    
  if (updateError) {
    console.error('Error actualizando estudiantes:', updateError)
    process.exit(1)
  }
  
  console.log(`✅ ¡Pocket Coach activado exitosamente para ${updated.length} estudiantes!`)
  console.log(updated.map(s => `- ${s['Full Name']}: ${s['Pocket Coach Status']}`).join('\n'))
}

run()
