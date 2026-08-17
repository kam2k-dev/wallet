<div align="center">

# 💳 DompetKu — Smart Financial Wallet & Analytics

<p align="center">
  <strong>Aplikasi Pengelola Keuangan Pribadi Modern dengan Desain Swiss-Finance, Visual Analytics, & Multi-Currency Realtime.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Heroicons-SVG-4F46E5?style=for-the-badge&logo=heroicons&logoColor=white" alt="Heroicons" />
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" alt="License MIT" />
</p>

</div>

---

## ✨ Fitur Unggulan

- **📊 Swiss-Finance Clean Dashboard**: Ringkasan Total Saldo, Pemasukan (*Income*), dan Pengeluaran (*Expense*) yang presisi dan minimalis.
- **✋ Hold & Drag Category Customization**: Kustomisasi urutan kategori semudah *drag & drop* langsung di beranda.
- **🎨 28+ Scarlab & Heroicons Preset**: Koleksi ikon kategori standar Notion/Scarlab berbasis 100% SVG React (anti-glitch font).
- **📈 Spend Analysis & Flow Trends**: Grafik distribusi pengeluaran, visual segmented progress bar, dan *Smart Insight* pengeluaran terbesar.
- **💱 Multi-Currency & Live Conversion**: Dukungan mata uang IDR, USD, EUR, GBP, JPY, SGD, MYR dengan konversi kurs *real-time*.
- **🌓 Adaptive Dark / Light Mode**: Transisi tema gelap-terang halus dengan efek *iOS Liquid Glass*.
- **🔐 Google OAuth 2.0 & Quick Dev Login**: Autentikasi Google Cloud resmi dan dev-bypass mode untuk pengujian lokal instan.
- **🚀 Dual Database Architecture**: Mode file JSON lokal untuk dev cepat & PostgreSQL database untuk lingkungan production.

---

## 📱 Panduan Penggunaan

### 1. Dashboard & Kategori
* **Visibilitas Saldo**: Tekan ikon mata pada kartu utama untuk menampilkan atau menyembunyikan nominal saldo.
* **Ubah Urutan Kategori**: Tekan ikon pensil untuk masuk ke mode edit, lalu **tahan & geser (hold & drag)** kartu kategori ke posisi yang diinginkan.
* **Ganti Tampilan**: Pilih mode *Grid* (kotak 2 kolom) atau *List* (daftar horizontal) sesuai kenyamanan.

### 2. Transaksi & Analytics
* **Tambah Transaksi**: Tekan tombol **+** di navigasi bawah untuk mencatat pengeluaran (*Expense*) atau pemasukan (*Income*).
* **Spend Analysis**: Masuk ke menu Analytics untuk melihat *net flow*, grafik proporsi belanja, serta memfilter transaksi berdasarkan waktu (*This Month, Last Month, This Year*).
* **Riwayat per Kategori**: Ketuk kategori tertentu untuk melihat rincian riwayat khusus kategori tersebut.

---

## 🗄️ Arsitektur Database

Aplikasi mendukung dua mode database yang ditentukan melalui variabel lingkungan `DB_MODE`:

| Mode | Lingkungan | Mekanisme Penyimpanan |
| :--- | :--- | :--- |
| `dummy` | Development / Lokal | Tersimpan otomatis di file JSON lokal `server/db/data.json` |
| `postgres` | Production / VPS | PostgreSQL Container / Cloud Database dengan relasi tabel |

---

## 🚀 Menjalankan Project

### A. Menjalankan dengan Node.js Lokal

```bash
# 1. Install dependencies
npm ci

# 2. Jalankan development server
npm run dev

# 3. Build untuk production
npm run build && npm start
```

### B. Menjalankan dengan Docker Compose

```bash
# Environment Development (Port 5001)
docker compose -f docker-compose.dev.yml up -d --build

# Environment Production (Port 5000)
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Heroicons React
* **Backend**: Node.js, Express, Google Auth Library, SQLite3 / PG (PostgreSQL)
* **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD, Nginx Reverse Proxy, Let's Encrypt SSL

---

<div align="center">
  <sub>Dibuat dengan ❤️ untuk kemudahan pengelolaan finansial harian Anda.</sub>
</div>
