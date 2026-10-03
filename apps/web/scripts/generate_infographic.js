const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///C:/Users/Usuario/Documents/Antigravity/LinguaLife/apps/web/public/docs/semana_1_laura_b2_c1.html?clean=true';
const outPath = path.resolve('C:/Users/Usuario/Documents/Antigravity/LinguaLife/docs/SEMANA_1_LAURA_B2_C1.png');

console.log('Capturing long screenshot via Chrome headless...');

const args = [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=2',
  '--window-size=900,4300',
  `--screenshot=${outPath}`,
  htmlPath
];

const res = spawnSync(chromePath, args, { stdio: 'inherit' });
if (fs.existsSync(outPath)) {
  const stat = fs.statSync(outPath);
  console.log(`Success! Created: ${outPath} (${(stat.size / 1024).toFixed(1)} KB)`);
} else {
  console.error('Failed to create screenshot, exit code:', res.status);
}
