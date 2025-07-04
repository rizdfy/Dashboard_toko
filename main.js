import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy
  } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
  
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";




// ✅ Versi stabil: restore semua elemen halaman saat maintenance OFF

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("maintenance-config.json?_=" + new Date().getTime(), {
      cache: "no-store",
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const config = await res.json();

    const overlay = document.getElementById("maintenance-overlay");
    const allVisibleIds = [
      "login-form", "signup-form", "dashboard-container", "stock-opname-container",
      "riwayat-container", "custom-showAlert", "price-diff-container"
    ];

    if (config.maintenance) {
      if (overlay) overlay.style.display = "flex";
      allVisibleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });
    } else {
      if (overlay) overlay.style.display = "none";
      // Jangan paksa semua display = block, biarkan program utama yang atur
      // Tapi pastikan overlay tidak aktif
    }
  } catch (err) {
    console.error("❌ Gagal membaca konfigurasi maintenance:", err);
  }
});

  





// 🔧 Fungsi untuk ambil nama dari email
function getUserNameFromEmail(email) {
    return email.split('@')[0];
}

// 🔥 Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCEng2Zpss0ATs3wkGs_vgy1YViSzkf07E",
    authDomain: "toko-eaa04.firebaseapp.com",
    projectId: "toko-eaa04",
    storageBucket: "toko-eaa04.appspot.com",
    messagingSenderId: "761393852069",
    appId: "1:761393852069:web:c9250f50038028d255e74c"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
let editId = null;


// Login dengan Google
document.getElementById("google-login-btn").addEventListener("click", () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;

            document.getElementById("user-email").textContent = getUserNameFromEmail(user.email);

            const userPhoto = document.getElementById("user-photo");
            if (user.photoURL) {
                userPhoto.src = user.photoURL;
                userPhoto.style.display = "block";
            }

            document.getElementById("login-form").style.display = "none";
            document.getElementById("dashboard-container").style.display = "block";
        });
});

// Status login
onAuthStateChanged(auth, (user) => {
    if (user) {
        const username = getUserNameFromEmail(user.email);
        document.getElementById("user-email").textContent = username;

        const userPhoto = document.getElementById("user-photo");
        const photoUrl = user.photoURL || "https://i.postimg.cc/Prtd1GD9/635bd3ab46e8e675e7a840481d0eef50.jpg";
        userPhoto.src = photoUrl;
        userPhoto.style.display = "block";

        document.getElementById("login-form").style.display = "none";
        document.getElementById("signup-form").style.display = "none";
        document.getElementById("dashboard-container").style.display = "block";
    } else {
        document.getElementById("user-photo").style.display = "block";
        document.getElementById("user-photo").src = "https://i.postimg.cc/Prtd1GD9/635bd3ab46e8e675e7a840481d0eef50.jpg";
        document.getElementById("dashboard-container").style.display = "none";
        document.getElementById("login-form").style.display = "block";
        document.getElementById("signup-form").style.display = "none";
    }

    toggleView(user);
});

function toggleView(user) {
    if (user) {
        document.getElementById("login-form").style.display = "none";
        document.getElementById("signup-form").style.display = "none";
        document.getElementById("dashboard-container").style.display = "block";
        document.getElementById("user-email").innerText = getUserNameFromEmail(user.email);
        loadBarang();
    } else {
        document.getElementById("login-form").style.display = "block";
        document.getElementById("signup-form").style.display = "none";
        document.getElementById("dashboard-container").style.display = "none";
    }
}


function showAlert(message, type = "success") {
    const showAlertBox = document.getElementById("custom-showAlert");
    showAlertBox.innerHTML = ""; // bersihkan isi sebelumnya

    // Tambahkan emoji berdasarkan tipe
    const emojis = {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️"
    };
    const emoji = emojis[type] || "";

    showAlertBox.innerHTML = `${emoji} ${message}`;
    showAlertBox.className = `showAlert ${type} show`;

    setTimeout(() => {
        showAlertBox.classList.remove("show");
    }, 4000);
}


// Tombol SignUp
document.getElementById("signup-btn").addEventListener("click", async () => {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    if (!email || !password) {
        showAlert("Email dan password harus diisi!","info");
        return;
    }
    try {
        await signOut(auth);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        showAlert("Pendaftaran berhasil!","success");

        document.getElementById("user-email").textContent = getUserNameFromEmail(user.email);
        const userPhoto = document.getElementById("user-photo");
        userPhoto.src = "https://i.pinimg.com/564x/13/3b/26/133b26f2b5f64b63fd35cfe1e09d6e08.jpg";
        userPhoto.style.display = "block";

        document.getElementById("signup-form").style.display = "none";
        document.getElementById("dashboard-container").style.display = "block";
    } catch (error) {
        showAlert("Pendaftaran gagal: " + error.message, "error","error");
    }
});

// Tombol Login
document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => showAlert("Login berhasil!","success"))
        .catch(error => showAlert("Login gagal: " + error.message, "error","error"));
});

// Tombol Logout
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth);
});

// Fungsi load data barang
async function loadBarang() {
    const querySnapshot = await getDocs(collection(db, "barang"));
    const table = document.getElementById("barangList");
    const searchInput = document.getElementById("searchBarang");
    const searchValue = searchInput?.value.trim().toLowerCase() || "";
    table.innerHTML = "";

    const dataList = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        editedAt: docSnap.data().editedAt ? new Date(docSnap.data().editedAt.toDate()).toLocaleDateString("id-ID") : "-"
    }));

    // Filter data berdasarkan searchValue (search input)
    const filtered = dataList.filter(item =>
        item.nama?.toLowerCase().includes(searchValue)
    );

    // Sortir berdasarkan seluruh nama barang
    filtered.sort((a, b) => {
        const namaA = a.nama.toLowerCase();
        const namaB = b.nama.toLowerCase();
        return namaA.localeCompare(namaB); // Urutkan berdasarkan seluruh nama barang
    });

    if (filtered.length === 0) {
        table.innerHTML = "<tr><td colspan='5'>Barang tidak ditemukan</td></tr>";
    } else {
        filtered.forEach((item, index) => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.nama}</td>
                <td>Rp ${item.harga}</td>
                <td>${item.editedAt}</td>
                <td>
                    <button onclick="editBarang('${item.id}', '${item.nama}', '${item.harga}')">Edit</button>
                    <button onclick="hapusBarang('${item.id}')">Hapus</button>
                </td>`;
        });
    }
}
window.loadBarang = loadBarang;



async function loadSidebarBarang() {
    const querySnapshot = await getDocs(collection(db, "barang"));
    const table = document.getElementById("sidebarBarangList");
    const searchInput = document.getElementById("searchSidebarBarang");
    const searchValue = searchInput?.value.trim().toLowerCase() || "";
    table.innerHTML = "";

    const dataList = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
    }));

    const filtered = dataList.filter(item =>
        item.nama?.toLowerCase().includes(searchValue)
    );

    filtered.sort((a, b) => a.nama.toLowerCase().localeCompare(b.nama.toLowerCase()));

    if (filtered.length === 0) {
        table.innerHTML = "<tr><td colspan='4'>Barang tidak ditemukan</td></tr>";
    } else {
        filtered.forEach((item, index) => {
            const row = table.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.nama}</td>
                <td>Rp ${item.harga}</td>
                <td>
                    <button onclick="tambahKeLembar('kurang', '${item.nama}', ${item.harga})">Kurang</button>
                    <button onclick="tambahKeLembar('lebih', '${item.nama}', ${item.harga})">Lebih</button>
                </td>
            `;
        });
    }
}

window.loadSidebarBarang = loadSidebarBarang;
document.getElementById("btn-stock-opname").addEventListener("click", () => {
    document.getElementById("dashboard-container").style.display = "none";
    document.getElementById("stock-opname-container").style.display = "block";
    loadSidebarBarang();
});


let daftarKurang = [];
let daftarLebih = [];

//kurang lebih

// Fungsi untuk menambah barang ke lembar kurang/lebih
function tambahKeLembar(tipe, nama, harga) {
    // Meminta input qty dari pengguna
    const qtyInput = prompt("Masukkan jumlah (qty) untuk " + nama + ":", "1");

    // Kalau user cancel atau tidak mengisi nilai valid, batal
    if (qtyInput === null || isNaN(qtyInput) || parseInt(qtyInput) <= 0) {
        return; // Tidak lanjut menambahkan
    }

    const qty = parseInt(qtyInput);

    const total = harga * qty;

    const tbodyId = tipe === 'kurang' ? 'lembarKurang' : 'lembarLebih';
    const tbody = document.getElementById(tbodyId);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="qty">${qty}</td>
        <td>${nama}</td>
        <td>Rp ${total.toLocaleString('id-ID')}</td>
        <td>
            <button class="edit-btn">Edit</button>
            <button class="hapus-btn">Hapus</button>
        </td>
    `;
    tbody.appendChild(row);

    // Menambahkan event listener untuk tombol Edit dan Hapus
    row.querySelector('.edit-btn').addEventListener('click', function() {
        editItem(this, tipe, nama, harga);
    });
    row.querySelector('.hapus-btn').addEventListener('click', function() {
        hapusItem(this, tipe);
    });

    const data = { nama, harga, qty, total };
    if (tipe === 'kurang') {
        daftarKurang.push(data);
    } else {
        daftarLebih.push(data);
    }

    console.log("Kurang:", daftarKurang);
    console.log("Lebih:", daftarLebih);
}

// Fungsi untuk mengedit qty barang di lembar kurang/lebih
function editItem(button, tipe, nama, harga) {
    // Menemukan baris yang terkait dengan tombol yang diklik
    const row = button.parentElement.parentElement;
    const qtyCell = row.querySelector('.qty');
    
    // Meminta input qty baru
    const qtyInput = prompt("Masukkan jumlah (qty) baru untuk " + nama + ":", qtyCell.textContent);
    
    // Pastikan qty valid
    const qty = qtyInput && !isNaN(qtyInput) && parseInt(qtyInput) > 0 ? parseInt(qtyInput) : qtyCell.textContent;
    const total = harga * qty;

    // Update qty dan total di baris
    qtyCell.textContent = qty;
    row.cells[2].textContent = `Rp ${total.toLocaleString('id-ID')}`;

    // Update data di daftar (kurang atau lebih)
    const data = { nama, harga, qty, total };
    if (tipe === 'kurang') {
        const index = daftarKurang.findIndex(item => item.nama === nama);
        daftarKurang[index] = data;
    } else {
        const index = daftarLebih.findIndex(item => item.nama === nama);
        daftarLebih[index] = data;
    }

    console.log("Kurang:", daftarKurang);
    console.log("Lebih:", daftarLebih);
}

// Fungsi untuk menghapus barang dari lembar kurang/lebih
function hapusItem(button, tipe) {
    // Menampilkan konfirmasi sebelum menghapus
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus item ini?");
    
    if (confirmDelete) {
        // Menemukan baris yang terkait dengan tombol yang diklik
        const row = button.parentElement.parentElement;
        
        // Menghapus baris dari tabel
        row.remove();

        // Menghapus data dari daftar (kurang atau lebih)
        const nama = row.cells[1].textContent;
        if (tipe === 'kurang') {
            const index = daftarKurang.findIndex(item => item.nama === nama);
            daftarKurang.splice(index, 1);
        } else {
            const index = daftarLebih.findIndex(item => item.nama === nama);
            daftarLebih.splice(index, 1);
        }

        console.log("Kurang:", daftarKurang);
        console.log("Lebih:", daftarLebih);
    } else {
        console.log("Penghapusan dibatalkan");
    }
}


window.tambahKeLembar = tambahKeLembar;




// Menampilkan perbedaan harga
let priceDiffTimeout;
function updatePriceDiff(nama, hargaLama, hargaBaru) {
    console.log("📢 Menampilkan notifikasi perubahan harga");
    const container = document.getElementById("price-diff-container");
    container.style.display = "block";

    document.getElementById("diff-nama").textContent = nama;
    document.getElementById("harga-lama").textContent = hargaLama;
    document.getElementById("harga-baru").textContent = hargaBaru;
    document.getElementById("selisih-harga").textContent = hargaBaru - hargaLama;

    clearTimeout(priceDiffTimeout);
    priceDiffTimeout = setTimeout(() => {
        container.style.display = "none";
    }, 3000);
}
document.addEventListener("keydown", (e) => {
    if (e.key === "d") {
        updatePriceDiff("Test Item", 1000, 2000);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.close-price-diff');
    const priceDiffContainer = document.getElementById('price-diff-container');
    closeBtn.addEventListener('click', () => {
        priceDiffContainer.style.display = 'none';
        clearTimeout(priceDiffTimeout);
    });

    // Tombol Stock Opname
    const btnStockOpname = document.getElementById("btn-stock-opname");
    const btnBackToDashboard = document.getElementById("btnBackToDashboard");
    const dashboardContainer = document.getElementById("dashboard-container");
    const stockOpnameContainer = document.getElementById("stock-opname-container");

    btnStockOpname.addEventListener("click", () => {
        dashboardContainer.style.display = "none";
        stockOpnameContainer.style.display = "block";
        dashboardContainer.style.display = "none";
    });

    btnBackToDashboard.addEventListener("click", () => {
        stockOpnameContainer.style.display = "none";
        dashboardContainer.style.display = "block";
    });
});



window.editBarang = function(id, nama, harga) {
    document.getElementById("namaBarang").value = nama;
    document.getElementById("hargaBarang").value = harga;
    editId = id;
    document.getElementById("hargaBarang").setAttribute("data-old-harga", harga);
    const btn = document.getElementById("btnTambah");
    btn.textContent = "Simpan Perubahan";
};

window.hapusBarang = async function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus barang ini?")) {
        await deleteDoc(doc(db, "barang", id));
        showAlert("Barang berhasil dihapus!","success");
        loadBarang();
    }
};

document.getElementById("btnTambah").addEventListener("click", async () => {
    const nama = document.getElementById("namaBarang").value;
    const harga = document.getElementById("hargaBarang").value;

    if (!nama || !harga) {
        showAlert("Nama dan harga barang harus diisi!","info");
        return;
    }

    const btn = document.getElementById("btnTambah");

    if (editId) {
    const oldHarga = document.getElementById("hargaBarang").getAttribute("data-old-harga");

    // Ambil data lama sebelum diubah (nama & harga)
    const querySnapshot = await getDoc(doc(db, "barang", editId));
    const dataLama = querySnapshot.data();
    const namaLama = dataLama.nama;

    if (parseInt(oldHarga) !== parseInt(harga)) {
        updatePriceDiff(nama, parseInt(oldHarga), parseInt(harga));
    }

    await updateDoc(doc(db, "barang", editId), {
        nama,
        harga,
        editedAt: new Date()
    });

    // Update juga riwayat yang menggunakan barang ini
    await updateBarangDanRiwayat(editId, nama, harga, namaLama);
        
        //updated//

        showAlert("Barang berhasil diperbarui!","success");
        
        btn.textContent = "Tambah Barang";
        document.getElementById("hargaBarang").removeAttribute("data-old-harga");
    } else {
        await addDoc(collection(db, "barang"), { nama, harga });
        showAlert(`${nama} berhasil ditambahkan!`,"success");

    }

    document.getElementById("namaBarang").value = "";
    document.getElementById("hargaBarang").value = "";
    loadBarang();
});

// Tampilkan login/signup
function showLogin() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("signup-form").style.display = "none";
}

function showSignup() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
}

document.getElementById("show-signup").addEventListener("click", (e) => {
    e.preventDefault();
    showSignup();
});

document.getElementById("show-login").addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
});

showLogin();



document.getElementById("btnSimpanOpname").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
        showAlert("Anda harus login terlebih dahulu.", "error");
        return;
    }

    // Validasi jika daftarKurang atau daftarLebih kosong
    if (daftarKurang.length === 0 && daftarLebih.length === 0) {
        showAlert("Data stock opname tidak dapat disimpan, karena tidak ada barang yang kurang atau lebih.", "error");
        return;
    }

    try {
        // Membuat data untuk disimpan
        const inputJudul = document.getElementById("judulDokumen");
        const judul = inputJudul ? inputJudul.value.trim() : "Tanpa Judul";

        const data = {
            judul,
            kurang: daftarKurang,
            lebih: daftarLebih,
            timestamp: new Date(),
            uid: user.uid
};


        console.log("Data yang akan disimpan:", data);  // Cek data sebelum disimpan

        // Menyimpan data ke Firestore
        await addDoc(collection(db, "stock_opname"), data);
        showAlert("Data stock opname berhasil disimpan!","success");

        // Reset data setelah disimpan
        daftarKurang = [];
        daftarLebih = [];
        document.getElementById("lembarKurang").innerHTML = "";
        document.getElementById("lembarLebih").innerHTML = "";
        document.getElementById("judulDokumen").value = "";
        document.getElementById("judul-dokumen-terpilih").textContent = "";
    } catch (error) {
        console.error("Gagal menyimpan data:", error);
        showAlert("Gagal menyimpan data: " + error.message, "error");
    }
});






////////////////////////////////////////////////////////////
document.getElementById("btn-riwayat-stock-opname").addEventListener("click", async () => {
    console.log("Tombol Riwayat diklik");
    const currentUserUid = auth.currentUser.uid;
    const user = auth.currentUser;
    if (!user) {
        showAlert("Anda belum login.");
        return;
    }

    const uid = user.uid;

    const riwayatContainer = document.getElementById("riwayat-container");
    const riwayatList = document.getElementById("riwayat-list");
    riwayatList.innerHTML = "";

    const q = query(
        collection(db, "stock_opname"),
        where("uid", "==", uid),
        orderBy("timestamp", "desc")
    );

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            riwayatList.innerHTML = "<p>Tidak ada riwayat stock opname.</p>";
        } else {
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const div = document.createElement("div");
                div.classList.add("riwayat-item");
                div.innerHTML = `
                    <p style="margin: 2px 0;"><strong>Nama Dokumen:</strong> ${data.judul || doc.id}</p>
                    <p style="font-size: 0.60em; margin: 2px 0;"><strong>Tanggal:</strong> ${new Date(data.timestamp?.toDate()).toLocaleString()}</p>
                    <button onclick="loadRiwayat('${doc.id}')">Lihat / Edit</button>
                    <button onclick="hapusRiwayat('${doc.id}')">Hapus</button>
                    <button onclick="exportRiwayatToExcel('${doc.id}')">Export</button>
                `;
                riwayatList.appendChild(div);
            });
        }

        // Tampilkan halaman riwayat
        document.getElementById("dashboard-container").style.display = "none";
        document.getElementById("stock-opname-container").style.display = "none";
        riwayatContainer.style.display = "block";

    } catch (error) {
        console.error("Gagal mengambil riwayat:", error);
        showAlert("Gagal mengambil riwayat stock opname.");
    }
});
let currentRiwayatId = null;
window.loadRiwayat = async function(docId) {
    console.log("loadRiwayat dipanggil untuk:", docId);
    const docRef = doc(db, "stock_opname", docId);

    try {
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            showAlert("Riwayat tidak ditemukan.");
            return;
        }

        const data = docSnap.data();
        daftarKurang = data.kurang || [];
        daftarLebih = data.lebih || [];
        // Isi input nama dokumen dengan judul dari data lama
        document.getElementById("judulDokumen").value = data.judul || "";
        document.getElementById("judul-dokumen-terpilih").textContent = `Nama Dokumen: ${data.judul || "(Tanpa Judul)"}`;

        renderLembar('kurang', daftarKurang);
        renderLembar('lebih', daftarLebih);

        // Menyimpan currentRiwayatId untuk digunakan saat update
        currentRiwayatId = docId;

        // Tampilkan form untuk update
        document.getElementById("riwayat-container").style.display = "none";
        document.getElementById("stock-opname-container").style.display = "block";
        document.getElementById("btnSimpanOpname").textContent = "Update riwayat stock opname";
        document.getElementById("btnSimpanOpname").onclick = updateRiwayatStockOpname; // Update data yang ada

        const btn = document.getElementById("btnSimpanOpname");
        const newBtnClone = btn.cloneNode(true); // Clone tombol
        btn.parentNode.replaceChild(newBtnClone, btn); // Ganti tombol lama (hapus semua listener)

        newBtnClone.textContent = "Update riwayat stock opname";
        newBtnClone.onclick = updateRiwayatStockOpname;
        console.log("simpanHasilStockOpname terpanggil!");


    } catch (error) {
        console.error("Error loading document:", error);
    }
}




function renderLembar(tipe, data) {
    const tbodyId = tipe === 'kurang' ? 'lembarKurang' : 'lembarLebih';
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "";

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="qty">${item.qty}</td>
            <td>${item.nama}</td>
            <td>Rp ${item.total.toLocaleString('id-ID')}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="hapus-btn">Hapus</button>
            </td>
        `;

        // Tambahkan event handler Edit dan Hapus
        row.querySelector('.edit-btn').addEventListener('click', function() {
            editItem(this, tipe, item.nama, item.harga); // Pastikan item punya "harga"
        });

        row.querySelector('.hapus-btn').addEventListener('click', function() {
            hapusItem(this, tipe);
        });

        tbody.appendChild(row);
    });
}



// Capitalize first letter of a string (for "kurang" and "lebih")
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function showReviewDashboard(docData) {
    document.getElementById('riwayat-container').style.display = 'none';
    document.getElementById('dashboard-review-container').style.display = 'flex';

    // Kosongkan dulu
    document.getElementById('reviewLembarKurang').innerHTML = '';
    document.getElementById('reviewLembarLebih').innerHTML = '';

    // Tampilkan data kurang
    (docData.kurang || []).forEach(item => {
        document.getElementById('reviewLembarKurang').innerHTML += `
            <tr>
                <td>${item.qty}</td>
                <td>${item.nama}</td>
                <td>${item.total}</td>
            </tr>
        `;
    });

    // Tampilkan data lebih
    (docData.lebih || []).forEach(item => {
        document.getElementById('reviewLembarLebih').innerHTML += `
            <tr>
                <td>${item.qty}</td>
                <td>${item.nama}</td>
                <td>${item.total}</td>
            </tr>
        `;
    });
}

function kembaliKeRiwayat() {
    document.getElementById('dashboard-review-container').style.display = 'none';
    document.getElementById('riwayat-container').style.display = 'block';
}
function kembaliKeDashboard() {
    // Sembunyikan tampilan riwayat
    document.getElementById("riwayat-container").style.display = "none";

    // Tampilkan kembali stock opname
    const container = document.getElementById("stock-opname-container");
    container.style.display = "block";

    // Kosongkan lembar lebih dan kurang
    document.getElementById("lembarKurang").innerHTML = "";
    document.getElementById("lembarLebih").innerHTML = "";
    daftarKurang = [];
    daftarLebih = [];
    

    // Kosongkan input nama dokumen
    document.getElementById("judulDokumen").value = "";

    // Kosongkan tampilan nama dokumen di bawah H2
    document.getElementById("judul-dokumen-terpilih").textContent = "";

    // Reset tombol simpan ke fungsi awal tanpa listener ganda
    const btnOld = document.getElementById("btnSimpanOpname");
    const btnNew = btnOld.cloneNode(true);
    btnNew.textContent = "Simpan Hasil Stock Opname";
    btnNew.onclick = simpanHasilStockOpname;
    btnOld.parentNode.replaceChild(btnNew, btnOld);


    // Reset ID riwayat
    currentRiwayatId = null;

    // Reload daftar barang sidebar (jika ada)
    if (typeof loadSidebarBarang === "function") {
        loadSidebarBarang();
    }
}


// Update dokumen yang sudah ada dengan ID `currentRiwayatId`
async function updateRiwayatStockOpname() {
    if (!currentRiwayatId) return showAlert("Riwayat tidak ditemukan!");

    const user = auth.currentUser;
    if (!user) {
        showAlert("Anda belum login.");
        return;
    }
    
    const currentUserUid = user.uid;

    try {
        // Step 1: Membuat dokumen baru dengan data yang diperbarui
        const inputJudul = document.getElementById("judulDokumen");
        const judul = inputJudul ? inputJudul.value.trim() : "Tanpa Judul";


        const newDocRef = await addDoc(collection(db, "stock_opname"), {
            judul, // <--- Tambahkan ini!
            kurang: daftarKurang,
            lebih: daftarLebih,
            timestamp: new Date(),
            uid: currentUserUid
        });
        

        console.log("Dokumen baru berhasil dibuat dengan ID:", newDocRef.id);

        // Step 2: Menghapus dokumen lama yang tidak lagi digunakan
        const oldDocRef = doc(db, "stock_opname", currentRiwayatId);

        await deleteDoc(oldDocRef);
        console.log("Dokumen lama berhasil dihapus.");

        showAlert("Riwayat berhasil diperbarui dan dokumen lama telah dihapus!");

        // Reset currentRiwayatId
        currentRiwayatId = null;

                // Ubah tombol kembali ke fungsi awal
        const btn = document.getElementById("btnSimpanOpname");
        btn.textContent = "Simpan Hasil Stock Opname";
        btn.onclick = null;
        btn.addEventListener("click", simpanHasilStockOpname);

        // Kembali ke dashboard setelah update
        kembaliKeDashboard();

    } catch (e) {
        console.error("Gagal memperbarui riwayat:", e);
        showAlert("Terjadi kesalahan saat memperbarui riwayat.");
    }
}


///////////////
async function updateBarangDanRiwayat(barangId, namaBaru, hargaBaru, namaLama) {
    const q = query(collection(db, "stock_opname"));
    const snapshot = await getDocs(q);

    snapshot.forEach(async (docSnap) => {
        const data = docSnap.data();
        let updated = false;

        const kurangBaru = (data.kurang || []).map(item => {
            if (item.nama === namaLama) {
                updated = true;
                return { ...item, nama: namaBaru, harga: parseInt(hargaBaru), total: item.qty * parseInt(hargaBaru) };
            }
            return item;
        });

        const lebihBaru = (data.lebih || []).map(item => {
            if (item.nama === namaLama) {
                updated = true;
                return { ...item, nama: namaBaru, harga: parseInt(hargaBaru), total: item.qty * parseInt(hargaBaru) };
            }
            return item;
        });

        if (updated) {
            await updateDoc(doc(db, "stock_opname", docSnap.id), {
                kurang: kurangBaru,
                lebih: lebihBaru
            });
        }
    });
}

//////

async function simpanHasilStockOpname() {
    const user = auth.currentUser;
    if (!user) {
        showAlert("Anda harus login terlebih dahulu.", "error");
        return;
    }

    if (daftarKurang.length === 0 && daftarLebih.length === 0) {
        showAlert("Data stock opname tidak dapat disimpan, karena tidak ada barang yang kurang atau lebih.", "error");
        return;
    }

    const inputJudul = document.getElementById("judulDokumen");
    const judul = inputJudul ? inputJudul.value.trim() : "Tanpa Judul";

    try {
        await addDoc(collection(db, "stock_opname"), {
            judul,
            kurang: daftarKurang,
            lebih: daftarLebih,
            timestamp: new Date(),
            uid: user.uid
        });

        showAlert("✅ Data stock opname berhasil disimpan!");

        // Reset semua setelah simpan
        daftarKurang = [];
        daftarLebih = [];
        document.getElementById("lembarKurang").innerHTML = "";
        document.getElementById("lembarLebih").innerHTML = "";
        document.getElementById("judulDokumen").value = "";
        document.getElementById("judul-dokumen-terpilih").textContent = "";

    } catch (error) {
        console.error("Gagal menyimpan data:", error);
        showAlert("Gagal menyimpan data: " + error.message, "error");
    }
}


window.loadRiwayat = loadRiwayat;
window.kembaliKeDashboard = kembaliKeDashboard;
window.simpanHasilStockOpname = simpanHasilStockOpname;



window.hapusRiwayat = async function(docId) {
    const konfirmasi = confirm("Yakin ingin menghapus riwayat ini? Data akan hilang permanen.");
    if (!konfirmasi) return;

    try {
        await deleteDoc(doc(db, "stock_opname", docId));
        showAlert("Riwayat berhasil dihapus.");

        // Refresh daftar riwayat
        document.getElementById("btn-riwayat-stock-opname").click();
    } catch (error) {
        console.error("Gagal menghapus riwayat:", error);
        showAlert("Terjadi kesalahan saat menghapus riwayat.");
    }
}
window.hapusSemuaRiwayat = async function () {
    const konfirmasi = confirm("Yakin ingin menghapus semua riwayat stock opname? Ini tidak bisa dibatalkan.");
    if (!konfirmasi) return;

    const user = auth.currentUser;
    if (!user) {
        showAlert("Anda belum login.", "error");
        return;
    }

    try {
        const q = query(
            collection(db, "stock_opname"),
            where("uid", "==", user.uid)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            showAlert("Tidak ada riwayat yang bisa dihapus.", "warning");
            return;
        }

        const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, "stock_opname", docSnap.id)));
        await Promise.all(deletePromises);

        showAlert("✅ Semua riwayat berhasil dihapus!");
        document.getElementById("btn-riwayat-stock-opname").click(); // Refresh tampilan

    } catch (error) {
        console.error("Gagal menghapus semua riwayat:", error);
        showAlert("Terjadi kesalahan saat menghapus semua riwayat.", "error");
    }
};


///////////////////

window.exportRiwayatToExcel = async function (docId) {
    try {
        const docRef = doc(db, "stock_opname", docId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            showAlert("Riwayat tidak ditemukan.");
            return;
        }

        const data = docSnap.data();
        const lebih = data.lebih || [];
        const kurang = data.kurang || [];
        // Isi input nama dokumen dengan judul dari data lama
        document.getElementById("judulDokumen").value = data.judul || "";
        document.getElementById("judul-dokumen-terpilih").textContent = `Nama Dokumen: ${data.judul || "(Tanpa Judul)"}`;


        const formatData = (items) => {
            const formatted = items.map(item => ({
                qty: item.qty,
                'nama barang': item.nama,
                'total dalam Rupiah': `Rp. ${item.total.toLocaleString('id-ID')}`
            }));

            const totalSemua = items.reduce((acc, item) => acc + item.total, 0);
            formatted.push({
                qty: '',
                'nama barang': 'Jumlah Total',
                'total dalam Rupiah': `Rp. ${totalSemua.toLocaleString('id-ID')}`
            });

            return formatted;
        };

        const applyBoldToLastRow = (sheet, dataLength) => {
            const rowNum = dataLength + 1; // Header + data rows
            const boldStyle = { font: { bold: true } };

            const namaCell = `B${rowNum}`;
            const totalCell = `C${rowNum}`;

            if (sheet[namaCell]) sheet[namaCell].s = boldStyle;
            if (sheet[totalCell]) sheet[totalCell].s = boldStyle;
        };

        // Siapkan workbook
        const workbook = XLSX.utils.book_new();

        // Sheet LEBIH
        const lebihData = formatData(lebih);
        const sheetLebih = XLSX.utils.json_to_sheet(lebihData, { skipHeader: false });
        sheetLebih['!cols'] = [
            { wch: 5 },
            { wch: 25 },
            { wch: 25 }
        ];
        applyBoldToLastRow(sheetLebih, lebih.length);
        XLSX.utils.book_append_sheet(workbook, sheetLebih, "Lembar Lebih");

        // Sheet KURANG
        const kurangData = formatData(kurang);
        const sheetKurang = XLSX.utils.json_to_sheet(kurangData, { skipHeader: false });
        sheetKurang['!cols'] = [
            { wch: 5 },
            { wch: 25 },
            { wch: 25 }
        ];
        applyBoldToLastRow(sheetKurang, kurang.length);
        XLSX.utils.book_append_sheet(workbook, sheetKurang, "Lembar Kurang");

        // Simpan file
        XLSX.writeFile(workbook, `Stock_Opname_${docId}.xlsx`);
        showAlert("File berhasil diekspor!");

    } catch (error) {
        console.error("Gagal export ke Excel:", error);
        showAlert("Terjadi kesalahan saat export.");
    }
};



////////////////////////////////////////////////////

let stopUpload = false;

async function uploadExcelToFirestore() {
    const fileInput = document.getElementById("excelUpload");
    const file = fileInput.files[0];
    const uploadLog = document.getElementById("upload-log");
    const stopButton = document.getElementById("stopUploadBtn");
    stopUpload = false;

    if (!file) {
        showAlert("Pilih file terlebih dahulu.", "warning");
        return;
    }

    const loadingEl = document.getElementById("loading-upload");

    uploadLog.innerHTML = "<strong>📤 Log Upload:</strong>";
    uploadLog.style.display = "block";
    stopButton.style.display = "inline-block";
    loadingEl.style.display = "block";

    const reader = new FileReader();
    reader.onload = async function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let berhasil = 0, gagal = 0;

        try {
            for (const row of jsonData) {
                if (stopUpload) {
                    uploadLog.innerHTML = `<strong>📤 Log Upload:</strong> ⚠️ Upload dihentikan oleh pengguna.`;
                    showAlert(`⛔ Upload dihentikan. ${berhasil} berhasil, ${gagal} gagal.`, "warning");
                    break;
                }

                const nama = row["Nama Barang"] || row["nama"] || row["Nama"];
                const harga = row["Harga"] || row["harga"];

                if (nama && harga) {
                    uploadLog.innerHTML = `<strong>📤 Log Upload:</strong> 🚀 Mengunggah: ${nama} - Rp${harga}`;
                    await addDoc(collection(db, "barang"), {
                        nama,
                        harga: parseInt(harga),
                        editedAt: new Date()
                    });
                    berhasil++;
                } else {
                    gagal++;
                }
            }

            if (!stopUpload) {
                showAlert(`✅ ${berhasil} data berhasil diunggah. ${gagal > 0 ? gagal + ' baris dilewati.' : ''}`, "success");
                if (typeof loadBarang === "function") loadBarang();
                uploadLog.innerHTML = `<strong>📤 Log Upload:</strong> ✅ Upload selesai!`;
            }
        } catch (error) {
            showAlert("Gagal mengunggah data: " + error.message, "error");
        } finally {
            loadingEl.style.display = "none";
            stopButton.style.display = "none";
            fileInput.value = ""; // 👉 Bersihkan file input

            setTimeout(() => {
                uploadLog.style.display = "none";
            }, 1000);
        }

    };

    reader.readAsArrayBuffer(file);
    fileInput.value = ""; // Bersihkan file input

}

window.uploadExcelToFirestore = uploadExcelToFirestore;

// 🔴 Tombol Stop Upload
document.getElementById("stopUploadBtn").addEventListener("click", () => {
    stopUpload = true;
});












document.getElementById("convert-btn").addEventListener("click", () => {
    const rows = document.querySelectorAll("#barangList tr");
    if (rows.length === 0) {
        showAlert("Tidak ada data barang untuk diexport!", "warning");
        return;
    }

    const data = [];

    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 4) {
            data.push({
                No: cells[0].innerText,
                Nama: cells[1].innerText,
                Harga: cells[2].innerText,
                "Terakhir Diedit": cells[3].innerText
            });
        }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Barang");

    XLSX.writeFile(workbook, "Daftar_Barang.xlsx");
});

