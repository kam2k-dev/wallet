# 💳 Financial Wallet Analysis App

![App Status](https://img.shields.io/badge/status-active-brightgreen)
![UI/UX](https://img.shields.io/badge/UI%2FUX-Clean%20Mobile%20Design-blue)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)
![License](https://img.shields.io/badge/license-MIT-orange)

Aplikasi ini dirancang untuk membantu Anda mengelola keuangan pribadi, memantau pengeluaran per kategori, serta menganalisis tren belanja harian dengan mudah. Aplikasi ini menggunakan **Rupiah (IDR)** sebagai mata uang default dan mendukung **Dark Mode**.

---

## 🚀 Cara Penggunaan Aplikasi

### 1. Mengelola Saldo & Navigasi Utama (Dashboard)
- **Melihat / Menyembunyikan Saldo:** Tekan ikon mata di samping `Main balance` untuk menyembunyikan atau menampilkan nominal saldo Anda.
- **Memantau Kategori Dompet:** Tekan salah satu kartu kategori (*Groceries, Transport, Entertainment, Rent & Utilities*) untuk langsung masuk ke rincian kategori tersebut.
- **Melihat Transaksi Terbaru:** Daftar transaksi terakhir yang Anda lakukan akan muncul di bagian bawah halaman utama.

### 2. Menambah Transaksi Baru
- Tekan tombol **+ (Add Transaction)** di menu navigasi bawah.
- Pilih jenis transaksi: **Expense (-)** untuk pengeluaran atau **Income (+)** untuk pemasukan.
- Isi nama merchant/judul transaksi, nominal, pilih kategori, dan tentukan tanggal.
- Tekan **Save Transaction** untuk menyimpan. Saldo utama dan saldo kategori akan otomatis diperbarui.

### 3. Memantau Detail Dompet per Kategori (Wallet Details)
- **Mengubah Periode Waktu:** Gunakan navigasi panah di bagian atas untuk melihat pengeluaran pada bulan yang diinginkan.
- **Pencarian Riwayat Transaksi:** Gunakan kolom pencarian di bagian bawah grafik untuk menemukan transaksi spesifik berdasarkan nama merchant atau produk.

### 4. Menganalisis Pengeluaran (Spend Analysis)
- **Melihat Distribusi Belanja:** Cek bar warna-warni di halaman *Spend Analysis* untuk mengetahui kategori mana yang memakan porsi pengeluaran terbesar.
- **Detail Persentase:** Tekan ikon *Pie Chart* di sebelah total pengeluaran untuk melihat rincian persentase tiap kategori.

### 5. Pengaturan Profil & Tampilan (Profile)
- **Konversi Mata Uang:** Ubah mata uang utama Anda (IDR, USD, EUR, dll) dan aplikasi akan otomatis mengonversi seluruh saldo menggunakan kurs *real-time*.
- **Dark Mode:** Aktifkan atau nonaktifkan mode gelap melalui *toggle* Dark Mode di menu Preferences.

---

## 🗄️ Database

Aplikasi mendukung dua mode database yang dipilih lewat variabel `DB_MODE`:

| Mode | Kapan | Penyimpanan |
|------|-------|-------------|
| `dummy` (default) | Development | File JSON lokal di `server/db/data.json` |
| `supabase` | Production | Supabase Postgres |

### Setup Development (Dummy DB)
Tidak perlu konfigurasi apa pun — data otomatis disimpan ke `server/db/data.json` dan bertahan antar restart server. File ini sudah dimasukkan ke `.gitignore` sehingga aman dan tidak akan terekspos ke GitHub.

### Setup Production (Supabase)
1. Buat project di [Supabase](https://supabase.com).
2. Jalankan skrip `server/db/schema.sql` di SQL Editor untuk membuat tabel `categories` & `transactions`.
3. Salin `.env.example` menjadi `.env` dan isi:
   ```env
   DB_MODE="supabase"
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

---

## 🛠️ Scripts

```bash
npm run dev      # Jalankan dev server (Vite + Express) di :3000
npm run build    # Build frontend + bundle server
npm run start    # Jalankan production build
npm run lint     # Type-check (tsc --noEmit)
```
