# Catatan Keuangan
Aplikasi web responsif pencatatan keuangan pribadi berbasis Supabase.

## Fitur yang disiapkan
- Autentikasi email/password melalui Supabase Auth.
- Pemasukan, pengeluaran, transfer, edit dan hapus transaksi.
- Akun tunai, bank, dompet digital, investasi dan lainnya.
- Ringkasan saldo, statistik bulanan, kalender, pencarian transaksi.
- Kategori personal, pengaturan profil, backup dan restore JSON.
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
Uji signup, konfirmasi email (jika diwajibkan), login, pembuatan transaksi, transfer, sinkronisasi antarsesi, dan backup/restore sebelum memakai aplikasi untuk catatan keuangan penting. Jangan mengklaim aplikasi sudah diuji end-to-end sampai pengujian tersebut benar-benar dilakukan.