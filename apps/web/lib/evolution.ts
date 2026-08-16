/**
 * Cliente HTTP tipado para interactuar con Evolution API v2
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'Pocket_Coach';

export interface SendMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  pushName: string;
  status: string;
  message: any;
}

export const EvolutionAPI = {
  /**
   * Envía un mensaje de texto a un número de WhatsApp
   * @param phone Número de teléfono con código de país (ej. 573001234567)
   * @param text Contenido del mensaje
   */
  async sendText(phone: string, text: string): Promise<any> {
    // Sanitizar el número de teléfono: remover espacios, signos + y asegurar que tenga sufijo
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const remoteJid = `${cleanPhone}@s.whatsapp.net`;

    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
      },
      body: JSON.stringify({
        number: cleanPhone,
        text: text,
        options: {
          delay: 1200,
          presence: 'composing',
          linkPreview: false
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error enviando mensaje via Evolution API:', errorText);
      throw new Error(`Evolution API error: ${response.statusText}`);
    }

    return await response.json();
  }
};
