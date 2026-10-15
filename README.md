# Catatan Keuangan
Aplikasi web responsif pencatatan keuangan pribadi berbasis Supabase.

## Fitur yang disiapkan
- Autentikasi email/password melalui Supabase Auth.
- Pemasukan, pengeluaran, transfer, edit dan hapus transaksi.
- Akun tunai, bank, dompet digital, investasi dan lainnya.
- Ringkasan saldo, statistik bulanan, kalender, pencarian transaksi.
- Kategori personal dan kategori bawaan yang dipakai transaksi, pengaturan profil, ekspor ringkasan CSV, backup JSON dan backup/pemulihan SQLite `.mmbak`.
- Pemulihan `.mmbak` memvalidasi struktur akun/kategori/transaksi dan pasangan transfer terlebih dahulu; baris transfer masuk/keluar yang berpasangan digabung menjadi satu transfer di aplikasi. Tipe pemasukan/pengeluaran lama dipetakan sesuai tipe sumber.
- Row Level Security agar pengguna hanya mengakses data miliknya.

## Konfigurasi Supabase
Project ref: `fjusrzhginkrxxitjjqk`, region Mumbai.
1. Buka Supabase SQL Editor dan terapkan `supabase/schema.sql` jika tabel belum tersedia.
2. Pastikan Email provider di Authentication aktif.
3. `config.js` menggunakan URL proyek dan publishable browser key; jangan masukkan service-role key ke frontend.

## Hosting GitHub Pages
1. Buka Settings → Pages.
2. Pilih Deploy from a branch, branch `main`, folder `/(root)`, lalu Save.
3. Tunggu deployment selesai dan gunakan URL HTTPS yang ditampilkan GitHub.

## Catatan kesiapan
Pemulihan JSON dan SQLite harus diuji pada salinan data terlebih dahulu. File SQLite lama dapat berisi tipe transaksi atau metadata yang tidak memiliki padanan langsung di aplikasi; cocokkan jumlah akun, kategori, transaksi, saldo, dan transfer sebelum mengandalkan hasil impor. Uji signup, konfirmasi email (jika diwajibkan), login, transaksi, transfer, sinkronisasi, dan pemulihan di situs yang dideploy. Pemeriksaan sintaks bukan pengganti uji end-to-end.