// perbaikan.js versi upload ke GitHub
const readline = require('readline');
const fetch = require('node-fetch');
const btoa = require('btoa');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const GITHUB_REPO = "rizdfy/Dashboard_toko";
const FILE_PATH = "maintenance-config.json";
const BRANCH = "main";

rl.question("Masukkan token GitHub Anda: ", (token) => {
  if (!token) return rl.close();

  rl.question("Ingin mengubah maintenance ke (on/off)? ", async (input) => {
    const lower = input.toLowerCase();
    if (lower !== 'on' && lower !== 'off') {
      console.log("❌ Input harus 'on' atau 'off'");
      rl.close();
      return;
    }

    try {
      const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

      const getRes = await fetch(apiUrl, {
        headers: { Authorization: `token ${token}` }
      });
      const file = await getRes.json();

      const newContent = btoa(JSON.stringify({ maintenance: lower === 'on' }));

      const updateRes = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `update maintenance to ${lower}`,
          content: newContent,
          sha: file.sha,
          branch: BRANCH
        })
      });

      if (updateRes.ok) {
        console.log(`\n✅ Maintenance sekarang: ${lower.toUpperCase()}`);
      } else {
        throw new Error("Gagal menyimpan ke GitHub");
      }
    } catch (err) {
      console.error("❌ Terjadi kesalahan:", err.message);
    } finally {
      rl.close();
    }
  });
});
