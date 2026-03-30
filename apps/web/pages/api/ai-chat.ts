import type { NextApiRequest, NextApiResponse } from 'next'

// Mock implementation or use an actual Gemini SDK if available in the project.
// The user specified "Gemini 2.5 Flash". I'll use a standard OpenAI-compatible fetch or similar.
// Since I don't see a Gemini SDK in the project, I'll use a generic API call to a provider or a mock for now.
// Actually, I should check if there's an existing AI util.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, context } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' })
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(200).json({ 
        message: "¡Hola! Soy tu Copilot. No tengo configurada una API Key aún, pero estoy listo para ayudarte en cuanto la agregues al archivo .env." 
      })
    }

    // Filter messages to ensure they start with 'user' role (Gemini requirement)
    let contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift() // Remove the initial greeting from the assistant for the API context
    }

    // Actual Gemini call - Using Gemini 2.5 Flash Lite as requested
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: `Eres un experto asistente pedagógico para profesores de inglés de LinguaLife. 
          Tu objetivo es ayudar al profesor durante la clase proporcionando ejemplos, ejercicios o lecturas rápidas.
          Contexto de la clase:
          - Alumno: ${context?.studentName || 'N/A'}
          - Nivel: ${studentLevelMap[context?.level] || context?.level || 'N/A'}
          - Tema de hoy: ${context?.topic || 'N/A'}
          
          Responde siempre en español, pero los fragmentos o ejemplos de inglés deben ser naturales y pedagógicamente útiles.` }]
        }
      })
    })

    const data = await response.json()
    
    if (data.error) {
      console.error('Gemini Error Object:', data.error)
      return res.status(200).json({ message: `Error de la IA: ${data.error.message}` })
    }

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text 
      || (data.promptFeedback?.blockReason ? `Respuesta bloqueada por filtros de seguridad: ${data.promptFeedback.blockReason}` : "No pude generar una respuesta satisfactoria. Intenta reformular.")

    return res.status(200).json({ message: aiMessage })
  } catch (err: any) {
    console.error('AI Chat Catch Error:', err)
    return res.status(200).json({ message: "Error crítico al conectar con la IA: " + err.message })
  }
}

const studentLevelMap: Record<string, string> = {
    'A1': 'Principiante',
    'A2': 'Pre-Intermedio',
    'B1': 'Intermedio',
    'B2': 'Intermedio-Alto',
    'C1': 'Avanzado',
    'Easy': 'Básico/Fácil',
    'Medium': 'Intermedio',
    'Hard': 'Avanzado/Difícil'
}
