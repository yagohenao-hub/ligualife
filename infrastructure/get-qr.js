const fs = require('fs');
const path = require('path');

async function getCleanQR() {
  const apikey = 'TuSuperSecretaGlobalApiKeyDeEvolution';
  const url = 'https://evolution-api-production-0971.up.railway.app';
  const instance = 'PocketCoach';

  console.log("🧹 1. Eliminando instancia atascada y purgando caché de Baileys...");
  try {
    await fetch(`${url}/instance/delete/${instance}`, {
      method: 'DELETE',
      headers: { apikey }
    });
  } catch (e) {}

  console.log("⏳ 2. Esperando 5 segundos para limpiar llaves en servidor...");
  await new Promise(r => setTimeout(r, 5000));

  console.log("🌱 3. Creando instancia 100% limpia para vincular...");
  try {
    const response = await fetch(`${url}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': apikey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: instance,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        webhook: {
          enabled: true,
          url: "https://lingualife.vercel.app/api/pocket-coach/incoming-message",
          byEvents: false,
          events: ["MESSAGES_UPSERT"]
        }
      })
    });

    const data = await response.json();
    const base64Qr = data.qrcode?.base64 || data.base64;

    if (base64Qr) {
      const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Vincular Pocket Coach WhatsApp</title>
  <style>
    body {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0; background: radial-gradient(circle at top, #1e1e38, #0b0c16);
      color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 20px;
    }
    .card {
      background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); max-width: 420px; width: 100%;
    }
    h1 { font-size: 1.5rem; margin-bottom: 8px; color: #38bdf8; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
    .qr-container { margin: 20px 0; padding: 15px; background: white; border-radius: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    .qr-container img { width: 260px; height: 260px; display: block; }
    .steps { text-align: left; background: rgba(255, 255, 255, 0.03); padding: 15px 20px; border-radius: 12px; margin-top: 15px; font-size: 0.85rem; color: #cbd5e1; }
    .steps ol { margin: 0; padding-left: 20px; }
    .steps li { margin-bottom: 6px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✨ Sesión 100% Limpia Generada</div>
    <h1>Vincular Pocket Coach</h1>
    <p>Escanea este código con el WhatsApp de la academia.</p>
    <div class="qr-container"><img src="${base64Qr}" alt="WhatsApp QR Code" /></div>
    <div class="steps">
      <ol>
        <li>Abre <b>WhatsApp</b> en tu celular.</li>
        <li>Toca en <b>Dispositivos vinculados</b>.</li>
        <li>Selecciona <b>Vincular un dispositivo</b> y apunta la cámara a este código.</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

      const targetPath = path.join(__dirname, 'qr-pocket-coach.html');
      fs.writeFileSync(targetPath, htmlContent);
      console.log(`✅ ¡Código QR Limpio listo en: ${targetPath}`);
    } else {
      console.error("❌ No se recibió imagen QR. Respuesta:", data);
    }
  } catch (error) {
    console.error("❌ Error generando QR:", error.message);
  }
}

getCleanQR();
