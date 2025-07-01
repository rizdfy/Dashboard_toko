// perbaikan.js
const fs = require('fs');
const readline = require('readline');

const configPath = './maintenance-config.json';
let config = { maintenance: false };

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("\nStatus maintenance saat ini:", config.maintenance ? "ON" : "OFF");

rl.question("Ingin mengubah ke (on/off)? ", (jawaban) => {
  const input = jawaban.toLowerCase();
  if (input === "on" || input === "off") {
    config.maintenance = input === "on";
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\n✅ Maintenance sekarang: ${config.maintenance ? 'ON' : 'OFF'}`);
  } else {
    console.log("❌ Input tidak dikenali. Gunakan 'on' atau 'off'.");
  }
  rl.close();
});
