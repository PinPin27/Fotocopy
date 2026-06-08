import { useState } from 'react';
import { CheckCircle2, UploadCloud, File, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router';
import { apiUrl } from '../lib/api';

export default function OrderPrint() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(1);
  const [colorType, setColorType] = useState('B&W');
  const [paperType, setPaperType] = useState('A4 70gr');
  const [quantity, setQuantity] = useState(1);
  const [binding, setBinding] = useState('Tanpa Jilid');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ queueNumber: number; totalPrice: number } | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Calculation
  const colorPrice = colorType === 'Color' ? 1500 : 500;
  const bindingPrice = binding === 'Soft Cover' ? 15000 : (binding === 'Hard Cover' ? 25000 : 0);
  const total = (pages * colorPrice * quantity) + bindingPrice;

  const handleOrder = async () => {
    setSubmitting(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(apiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          document_url: file?.name || 'document.pdf',
          pages,
          color_type: colorType,
          paper_type: paperType,
          quantity,
          binding_type: binding,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pesanan gagal dibuat.');
      setOrderSuccess({ queueNumber: Number(data.queue_number || 0), totalPrice: Number(data.total_price || total) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pesanan gagal dibuat.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Pesanan berhasil dibuat</h2>
            <p className="mt-2 text-sm text-slate-500">Nomor antrian print kamu:</p>
            <p className="mt-4 text-6xl font-black text-indigo-600">
              #{String(orderSuccess.queueNumber).padStart(3, '0')}
            </p>
            <p className="mt-3 text-sm font-medium text-slate-600">
              Total pembayaran Rp {orderSuccess.totalPrice.toLocaleString()}
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Lihat Pesanan Saya
            </button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Buat Pesanan Baru</h1>
        <p className="mt-1 text-sm text-slate-500">Upload dokumen dan atur spesifikasi print.</p>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-medium text-slate-900 mb-4">1. Upload Dokumen</h2>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 hover:bg-slate-50 transition-colors">
              <div className="text-center">
                {file ? (
                  <div className="flex flex-col items-center">
                    <File className="mx-auto h-12 w-12 text-blue-500" aria-hidden="true" />
                    <span className="mt-2 block text-sm font-semibold text-slate-900">{file.name}</span>
                    <button onClick={() => setFile(null)} className="text-sm text-red-500 mt-1">Remove</button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                    <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                      <label className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none hover:text-blue-500">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-slate-500">PDF, DOCX, PPTX up to 50MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {file && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
              <h2 className="text-lg font-medium text-slate-900">2. Spesifikasi Print</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Jumlah Halaman Dokumen</label>
                  <input type="number" min="1" value={pages} onChange={e => setPages(Number(e.target.value))} className="mt-1 block w-full rounded-md border-slate-300 py-2 px-3 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Rangkap (Quantity)</label>
                  <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="mt-1 block w-full rounded-md border-slate-300 py-2 px-3 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Warna</label>
                  <select value={colorType} onChange={e => setColorType(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 py-2 px-3 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm">
                    <option>B&W</option>
                    <option>Color</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Kertas</label>
                  <select value={paperType} onChange={e => setPaperType(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 py-2 px-3 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm">
                    <option>A4 70gr</option>
                    <option>A4 80gr</option>
                    <option>F4 70gr</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Jilid</label>
                  <select value={binding} onChange={e => setBinding(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 py-2 px-3 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm">
                    <option>Tanpa Jilid</option>
                    <option>Soft Cover</option>
                    <option>Hard Cover</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
            <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-blue-600" /> Estimasi Harga
            </h2>
            <div className="space-y-3 text-sm text-slate-600 border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span>Print ({pages} hal x {quantity} rangkap)</span>
                <span>Rp {(pages * colorPrice * quantity).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Warna</span>
                <span>{colorType} (Rp {colorPrice}/hal)</span>
              </div>
              <div className="flex justify-between">
                <span>Jilid ({binding})</span>
                <span>Rp {bindingPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-center font-bold text-lg text-slate-900 mb-6">
              <span>Total</span>
              <span>Rp {total.toLocaleString()}</span>
            </div>
            
            <button
              onClick={handleOrder}
              disabled={!file || submitting}
              className="w-full rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Memproses...' : 'Proses Pesanan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
