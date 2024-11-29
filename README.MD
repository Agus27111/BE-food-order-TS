BE-food-order-TS

BE-food-order-TS

# Food Order Monolith

## Deskripsi Proyek

Food Order Monolith adalah aplikasi backend monolitik yang dibangun menggunakan **Express** dan **TypeScript** untuk memfasilitasi sistem pemesanan makanan. Aplikasi ini mencakup fungsionalitas CRUD untuk menu makanan, pesanan, dan pengguna, serta menangani proses otentikasi dan otorisasi.

## Fitur

- **Manajemen Pengguna** : Daftar, login, dan manajemen profil pengguna.
- **Manajemen Menu Makanan** : CRUD untuk item makanan yang tersedia untuk dipesan.
- **Manajemen Pesanan** : Membuat, mengelola, dan melacak status pesanan.
- **Otentikasi & Otorisasi** : Sistem login untuk memastikan hanya pengguna yang berwenang yang dapat mengakses fitur tertentu.
- **Validasi & Error Handling** : Validasi data dan penanganan kesalahan yang konsisten.
- **Environment Configurations** : Menggunakan variabel lingkungan untuk informasi sensitif.

## Instalasi

1. **Clone repository** :

   git clone https://github.com/Agus27111/BE-food-order-TS
   cd be-food-order-ts

2. **Install dependensi** :

   npm install

3. **Konfigurasi environment** :

   Buat file `.env` di root proyek.

4. **Setup Database** :
5. **Jalankan aplikasi** :

   npm run dev

## Teknologi yang Digunakan

- **Express.js** : Kerangka kerja server HTTP untuk Node.js.
- **TypeScript** : Bahasa pemrograman yang disuperset dari JavaScript, dengan dukungan tipe statis.
- **MongoDB**: Database untuk menyimpan data pengguna, menu, dan pesanan.

## Lisensi

Proyek ini menggunakan lisensi [MIT]().
