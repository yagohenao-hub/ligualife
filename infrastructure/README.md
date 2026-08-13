# Guía de Despliegue en Oracle Cloud (Ubuntu 22.04 / 24.04 ARM)

Esta guía detalla los comandos exactos que debes ejecutar en tu instancia de Oracle Cloud (Ampere A1) una vez te hayas conectado por SSH.

## 1. Conectarse a la máquina por SSH
Abre tu terminal (Linux Mint) y ejecuta:
\`\`\`bash
# Cambia los permisos de la llave privada
chmod 400 ruta/a/tu/clave-privada.key

# Conéctate al servidor (reemplaza IP_PUBLICA por la IP de Oracle)
ssh -i ruta/a/tu/clave-privada.key ubuntu@IP_PUBLICA
\`\`\`

## 2. Instalar Docker y Docker Compose
Una vez dentro del servidor de Oracle Cloud, ejecuta estos comandos uno por uno:

\`\`\`bash
# 1. Actualizar repositorios
sudo apt-get update
sudo apt-get upgrade -y

# 2. Instalar certificados y utilidades
sudo apt-get install ca-certificates curl gnupg lsb-release -y

# 3. Agregar la llave oficial de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. Configurar el repositorio de Docker para ARM
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Instalar Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# 6. Permitir ejecutar docker sin 'sudo'
sudo usermod -aG docker ubuntu
newgrp docker
\`\`\`

## 3. Subir el proyecto y levantar los contenedores

1. Crea una carpeta para la infraestructura:
\`\`\`bash
mkdir -p ~/lingualife/infrastructure
cd ~/lingualife/infrastructure
\`\`\`
2. Copia el archivo `docker-compose.oracle.yml` (puedes usar `nano docker-compose.yml` y pegar el contenido).
3. Levanta los servicios de Evolution API, Postgres y Redis:
\`\`\`bash
docker compose -f docker-compose.oracle.yml up -d
\`\`\`
4. Verifica que estén corriendo:
\`\`\`bash
docker ps
\`\`\`

## 4. Configurar Cloudflare Tunnel (Gratis, seguro y sin exponer puertos)

En lugar de abrir puertos en el firewall de Oracle (que es complejo), instalaremos **cloudflared** para exponer Evolution API de forma segura.

1. Instalar \`cloudflared\` para arquitectura ARM64:
\`\`\`bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb
\`\`\`

2. (Opcional - Si usas túneles temporales rápidos para pruebas):
\`\`\`bash
cloudflared tunnel --url http://localhost:8080
\`\`\`
Esto generará una URL pública tipo \`https://algo.trycloudflare.com\` que usarás como \`EVOLUTION_API_URL\` en Vercel.

3. (Recomendado - Túnel permanente con dominio propio):
Ingresa a [Cloudflare Zero Trust](https://one.dash.cloudflare.com/), crea un túnel y pega el comando de instalación que te dará la plataforma en el servidor de Oracle.
