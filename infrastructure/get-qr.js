const fs = require('fs');

async function getQR() {
  const apikey = 'TuSuperSecretaGlobalApiKeyDeEvolution';
  const url = 'https://evolution-api-production-0971.up.railway.app';

  console.log("🧹 1. Eliminando sesión atascada anterior...");
  try {
    await fetch(`${url}/instance/delete/PocketCoach`, {
      method: 'DELETE',
      headers: { 'apikey': apikey }
    });
  } catch (e) {}

  console.log("⏳ 2. Esperando 5 segundos para purgar la caché...");
  await new Promise(r => setTimeout(r, 5000));

  console.log("🌱 3. Generando una instancia completamente nueva...");
  try {
    const response = await fetch(`${url}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': apikey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: "PocketCoach",
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      })
    });

    const data = await response.json();

    if (data.qrcode && data.qrcode.base64) {
      const htmlContent = `
        <html>
          <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #111; color: white; font-family: sans-serif;">
            <h1>Escanear QR (Sesión Limpia)</h1>
            <p>Abre tu WhatsApp Business -> Dispositivos Vinculados -> Vincular un dispositivo</p>
            <img src="${data.qrcode.base64}" alt="WhatsApp QR Code" style="border: 10px solid white; border-radius: 10px; width: 300px; height: 300px;" />
            <p style="color: #888;">Nota: Si falla de nuevo, verifica la conexión a internet en tu celular.</p>
          </body>
        </html>
      `;
      
      fs.writeFileSync('./qr-pocket-coach.html', htmlContent);
      console.log("✅ ¡QR Nuevo y Limpio generado exitosamente!");
      console.log("📂 Recarga el archivo 'qr-pocket-coach.html' en tu navegador e intenta escanear INMEDIATAMENTE.");
    } else {
      console.error("❌ Falló la generación. Respuesta del servidor:");
      console.log(data);
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
  }
}

getQR();
