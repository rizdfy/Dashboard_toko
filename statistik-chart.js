// statistik-chart.js
// Script Chart.js terpisah

import { getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

let statistikChart = null;

export async function loadStatistikChart() {
  const chartContainer = document.getElementById("statistik-chart");
  if (!chartContainer) return;

  if (!window.db) {
    console.error("Firestore db tidak ditemukan. Pastikan window.db sudah diset di main.js");
    chartContainer.innerHTML = "<p style='color:red;text-align:center;'>Database Firestore tidak ditemukan.</p>";
    return;
  }

  const querySnapshot = await getDocs(collection(window.db, "barang"));
  let dataChart = [];

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.harga && data.editedAt) {
      dataChart.push({
        nama: data.nama,
        harga: data.harga,
        editedAt: data.editedAt.toDate ? data.editedAt.toDate() : new Date(data.editedAt)
      });
    }
  });

  if (dataChart.length === 0) {
    chartContainer.innerHTML = "<p style='text-align:center;'>Tidak ada data untuk ditampilkan.</p>";
    return;
  }

  dataChart.sort((a, b) => a.editedAt - b.editedAt);

  const labels = dataChart.map(item => `${item.nama} (${item.editedAt.toLocaleDateString('id-ID')})`);
  const values = dataChart.map(item => item.harga);

  chartContainer.innerHTML = '<canvas id="hargaChart"></canvas>';
  const ctx = document.getElementById("hargaChart").getContext("2d");

  if (statistikChart) {
    statistikChart.destroy();
  }

  statistikChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Perubahan Harga Barang',
        data: values,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.2,
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Grafik Kenaikan Harga dari Waktu ke Waktu' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// expose ke global agar bisa dipanggil dari main.js
window.loadStatistikChart = loadStatistikChart;