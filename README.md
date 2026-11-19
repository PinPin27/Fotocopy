# Smart Photocopy System — Web-Based Printing Order & Queue Management

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Smart Photocopy System** adalah aplikasi berbasis web *full-stack* yang mendigitalisasi proses pemesanan cetak dokumen, perhitungan biaya cetak secara otomatis (*dynamic pricing*), manajemen antrean pengerjaan secara *real-time*, hingga pencatatan transaksi untuk bisnis fotocopy dan percetakan.

---

<!-- Ganti link gambar di bawah dengan screenshot/GIF mockup aplikasi Anda -->
<img width="1280" height="720" alt="Smart Photocopy Overview" src="https://via.placeholder.com/1280x720?text=Smart+Photocopy+System+Dashboard+Overview" />

---

## 📌 Fitur Utama

- **Dual-Role Authentication & Access Control**: Tampilan dan hak akses terisolasi untuk **Customer** (pemesanan & pelacakan status) dan **Admin/Operator** (manajemen pesanan, konfirmasi pembayaran, serta monitoring antrean).
- **Dynamic Price Calculator**: Kalkulasi otomatis estimasi harga cetak secara akurat berdasarkan jumlah halaman, format warna (Color / Black & White), jenis kertas, kuantitas rangkap, dan opsi jilid (Tanpa Jilid, Soft Cover, Hard Cover).
- **Automated Queue Management**: Algoritma normalisasi antrean dinamis yang otomatis mengurutkan nomor antrean aktif dan memperbarui status antrean secara sinkron saat pesanan selesai atau dibatalkan.
- **Order & Payment Lifecycle**: Pelacakan transparan alur pesanan dari status *Waiting Payment*, *Processing*, hingga *Completed*.
- **In-App Notification Center**: Pemberitahuan berkala kepada pelanggan secara langsung di dalam aplikasi terkait perubahan status pengerjaan dokumen.
- **Cloud Database Connection Pooling**: Terintegrasi langsung dengan Supabase PostgreSQL melalui Transaction/Session Pooler untuk performa koneksi yang stabil dan andal.

---

## 🛠️ Tech Stack & Arsitektur

### 1. Frontend
- **Framework & Runtime**: React 19, TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Animation & Utilities**: Motion (Framer Motion), `clsx`, `tailwind-merge`
- **Build Tool**: Vite 6 (HMR & Fast Bundling)

### 2. Backend & Server
- **Runtime**: Node.js (dengan native experimental strip-types & tsx)
- **Framework**: Express.js 4.x
- **Authentication**: JSON Web Token (JWT) dengan Role-Based Access Control (RBAC)
- **Bundler Production**: esbuild (`dist/server.cjs`)

### 3. Database & Deployment
- **Database**: PostgreSQL di hosting Supabase Cloud via driver `pg` (`Pool`)
- **Deployment**: Backend & API di Render, database di Supabase Pooler

---

## 🗂️ Struktur Direktori

```text
PROJEK_FOTOCOPY_RPL/
│
├── server/                     # Backend Source Code
│   ├── api.ts                  # REST API routes (Auth, Orders, Payments, Queue, Notifications)
│   └── db.ts                   # Koneksi database Supabase Pooler & migrasi skema tabel
│
├── src/                        # Frontend Source Code
│   ├── components/             # Reusable UI components (Sidebar, DashboardLayout, ErrorBoundary)
│   ├── lib/                    # Helper utilities & API client configuration
│   ├── pages/                  # Halaman aplikasi (Landing, Auth, OrderPrint, Admin/Customer Dashboard)
│   ├── App.tsx                 # Root component & route definitions
│   ├── main.tsx                # Entry point React
│   └── types.ts                # TypeScript type definitions (User, Order, Service, dll.)
│
├── .env.example                # Template konfigurasi environment variable
├── .gitignore                  # Git ignore rules
├── esbuild.server.js           # Konfigurasi bundling server untuk production
├── index.html                  # HTML template utama
├── package.json                # Daftar dependensi & npm scripts
├── server.ts                   # Unified dev/prod HTTP & API server
├── tsconfig.json               # Konfigurasi TypeScript frontend
├── tsconfig.server.json        # Konfigurasi TypeScript backend
└── vite.config.js              # Konfigurasi Vite & Tailwind CSS plugin
```

---

## 🚀 Cara Menjalankan Projek Secara Lokal

### 1. Prasyarat Sistem
- **Node.js** v20.x atau lebih baru
- Akun **Supabase** (PostgreSQL)

### 2. Konfigurasi Environment Variable
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka berkas `.env` dan sesuaikan nilainya:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=rahasia-jwt-anda-yang-aman
PORT=3000
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Menjalankan Mode Development
Jalankan server aplikasi (otomatis menginisialisasi tabel database dan menyalakan Vite HMR):
```bash
npm run dev
```
Buka browser Anda di `http://localhost:3000`.

---

## ☁️ Deploy Backend di Render

Jika melakukan *deploy* backend ke Render:
1. Masukkan *environment variables* `DATABASE_URL` dan `JWT_SECRET` pada dashboard Environment Render.
2. Gunakan connection string **Transaction Pooler** / **Session Pooler** dari Supabase (`pooler.supabase.com`) dengan SSL mode aktif.
3. Jalankan build command: `npm run build` dan start command: `npm start`.
4. Pastikan status database sehat dengan memanggil endpoint health check:
   ```txt
   GET https://your-backend-app.onrender.com/api/health
   ```
   *Response yang diharapkan:*
   ```json
   { "status": "ok", "database": "ok" }
   ```

---

## 🧑‍💻 Author
- **Alfananda Devin Yuwono** - [@PinPin27](https://github.com/PinPin27)
