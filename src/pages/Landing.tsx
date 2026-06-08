import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, Bell, CheckCircle2, Clock, CreditCard, FileCheck2, HandCoins, Printer, Upload } from 'lucide-react';
import { User } from '../types';

const features = [
  {
    name: 'Upload dokumen dari mana saja',
    description: 'Kirim PDF, DOCX, atau PPTX sebelum datang ke tempat fotocopy.',
    icon: Upload,
  },
  {
    name: 'Estimasi harga otomatis',
    description: 'Total biaya dihitung dari jumlah halaman, warna, kuantitas, dan jenis jilid.',
    icon: HandCoins,
  },
  {
    name: 'Antrian real-time',
    description: 'User bisa melihat nomor antrian, status cetak, dan estimasi selesai.',
    icon: Clock,
  },
  {
    name: 'Notifikasi status pesanan',
    description: 'Update payment dan progress order langsung muncul di dashboard user.',
    icon: Bell,
  },
];

const pricing = [
  { name: 'Hitam Putih A4', price: 'Rp 500', unit: '/halaman' },
  { name: 'Berwarna A4', price: 'Rp 1.500', unit: '/halaman' },
  { name: 'Jilid Soft Cover', price: 'Rp 15.000', unit: '/dokumen' },
];

export default function Landing({ user }: { user: User | null }) {
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8" aria-label="Global">
          <Link to="/" className="flex items-center gap-3 text-blue-700">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Printer className="h-5 w-5" />
            </span>
            <span className="text-lg font-black tracking-tight">Foto Copy v1</span>
          </Link>
          <div className="hidden items-center gap-x-8 md:flex">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-700">Fitur</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-blue-700">Harga</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={dashboardPath}
                className="inline-flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:block">{user.name}</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-12 lg:px-8 lg:py-24">
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-100"
              >
                <CheckCircle2 className="h-4 w-4" />
                Pemesanan fotocopy tanpa antre panjang
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl"
              >
                Print tugas lebih cepat, ambil saat sudah siap.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 max-w-xl text-lg leading-8 text-slate-600"
              >
                Upload dokumen, pilih warna dan jilid, lihat estimasi harga, lalu pantau antrian langsung dari dashboard.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  to={user ? dashboardPath : '/register'}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-500"
                >
                  {user ? 'Buka Dashboard' : 'Mulai Order'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={user ? '/' : '/login'}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200"
                >
                  {user ? 'Lihat Info' : 'Masuk Dashboard'}
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.18 }}
              className="lg:col-span-6"
            >
              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-blue-100">
                <div className="rounded-2xl bg-white p-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Order</p>
                      <h2 className="mt-1 text-lg font-bold text-slate-900">Makalah RPL Final.pdf</h2>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">Printing</span>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-blue-50 p-4">
                      <p className="text-xs font-semibold text-blue-600">Antrian</p>
                      <p className="mt-2 text-3xl font-black text-blue-700">#012</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">Estimasi</p>
                      <p className="mt-2 text-3xl font-black text-slate-900">18m</p>
                    </div>
                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-xs font-semibold text-green-700">Payment</p>
                      <p className="mt-2 text-lg font-black text-green-700">Paid</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {['Payment verified', 'Masuk antrian cetak', 'Dokumen sedang dicetak'].map((item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-sm font-semibold text-slate-700">{item}</span>
                        <span className="text-xs text-slate-400">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Fitur Utama</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Dibuat untuk fotocopy kampus dan harian.</h2>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map(feature => (
                <div key={feature.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-900">{feature.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Harga Ringkas</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Transparan sebelum dokumen dicetak.</h2>
              <p className="mt-4 text-slate-600">Harga final dihitung otomatis saat user membuat pesanan, jadi admin dan customer melihat angka yang sama.</p>
            </div>
            <div className="grid gap-4 lg:col-span-7">
              {pricing.map(item => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <p className="font-bold text-slate-900">{item.name}</p>
                  </div>
                  <p className="text-right font-black text-slate-950">
                    {item.price}
                    <span className="ml-1 text-sm font-medium text-slate-500">{item.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-16 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-indigo-900 p-8 text-white shadow-xl sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-200">Foto Copy v1 siap dipakai</p>
              <h2 className="mt-2 text-2xl font-black">Mulai pesanan pertama tanpa antre manual.</h2>
            </div>
            <Link to={user ? dashboardPath : '/register'} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-indigo-900 hover:bg-blue-50">
              {user ? 'Buka Dashboard' : 'Buat Akun'}
              <FileCheck2 className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
