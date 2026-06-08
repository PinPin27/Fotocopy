Sebuah aplikasi berbasis web untuk memanajemen pesanan, pembayaran, dan antrean layanan fotocopy secara digital.

## ✨ Fitur Utama
* **Dashboard Terpisah:** Tampilan khusus untuk Admin dan Customer.
* **Manajemen Antrean:** Pemantauan status antrean fotocopy secara *real-time*.
* **Manajemen Pesanan & Pembayaran:** Pencatatan detail pesanan secara terstruktur.
* **Database Realtime:** Menggunakan Supabase untuk sinkronisasi data yang cepat dan aman.

## Deploy Backend di Render

Backend membutuhkan environment variable berikut di Render:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=isi-dengan-secret-yang-kuat
```

Untuk Supabase, gunakan connection string dari menu **Connect** di dashboard Supabase. Jika direct connection `db.<project-ref>.supabase.co:5432` gagal di Render, gunakan connection string **Transaction Pooler** atau **Session Pooler** yang memakai host `pooler.supabase.com`.

Setelah environment variable diperbarui, redeploy backend Render dan cek:

```txt
https://fotocopy-backend.onrender.com/api/health
```

Response sehat harus berisi `database: "ok"`.
