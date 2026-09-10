/**
 * Cliente HTTP tipado para interactuar con Evolution API v2
 * Blindado con simulación humana (jitter y delay de escritura dinámico)
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'PocketCoach';

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
   * Sanitiza el número telefónico asegurando sólo dígitos y removiendo prefijos/sufijos
   */
  sanitizePhone(phone: string): string {
    const rawDigits = phone.split('@')[0].split(':')[0];
    return rawDigits.replace(/[^0-9]/g, '');
  },

  /**
   * Calcula un tiempo de escritura 'composing' humanizado basado en longitud del texto
   */
  calculateHumanTypingDelay(text: string): number {
    // Estimación: entre 30 y 45 ms por carácter, con piso de 1800ms y tope de 5500ms + jitter aleatorio
    const base = Math.min(5000, Math.max(1800, Math.floor(text.length * 28)));
    const jitter = Math.floor(Math.random() * 800) - 300;
    return Math.max(1500, base + jitter);
  },

  /**
   * Envía un mensaje de texto a un número de WhatsApp con simulación de presencia humana
   * @param phone Número de teléfono con código de país (ej. 573001234567)
   * @param text Contenido del mensaje
   */
  async sendText(phone: string, text: string, customDelayMs?: number): Promise<any> {
    const cleanPhone = this.sanitizePhone(phone);
    if (!cleanPhone) {
      console.error('[EvolutionAPI] Error: Número de teléfono inválido o vacío');
      return { success: false, error: 'Número de teléfono inválido' };
    }

    const typingDelay = customDelayMs ?? this.calculateHumanTypingDelay(text);

    try {
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
            delay: typingDelay,
            presence: 'composing',
            linkPreview: false
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[EvolutionAPI] Error enviando a ${cleanPhone}:`, errorText);
        return { success: false, error: errorText };
      }

      return await response.json();
    } catch (err: any) {
      console.error(`[EvolutionAPI] Excepción de red enviando a ${cleanPhone}:`, err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Consulta el estado de conexión de la instancia
   */
  async checkConnectionStatus(): Promise<{ connected: boolean; state: string; details?: any }> {
    try {
      const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`, {
        headers: { 'apikey': EVOLUTION_API_KEY }
      });
      if (!res.ok) return { connected: false, state: 'unknown' };
      const data = await res.json();
      const state = data?.instance?.state || data?.state || 'close';
      return { connected: state === 'open', state, details: data };
    } catch (e: any) {
      return { connected: false, state: 'error', details: e.message };
    }
  }
};
