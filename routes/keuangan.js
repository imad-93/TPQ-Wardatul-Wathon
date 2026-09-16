// Keuangan (finance) management routes
import express from 'express';

const router = express.Router();

// Mock keuangan database
let keuanganData = [
  { id: 'k1', santriId: 's1', jenis: 'spp', label: 'SPP September 2026', nominal: 150000, status: 'lunas', metode: 'QRIS', tanggal: '2026-09-05' },
  { id: 'k2', santriId: 's1', jenis: 'spp', label: 'SPP Agustus 2026', nominal: 150000, status: 'lunas', metode: 'QRIS', tanggal: '2026-08-04' },
  { id: 'k3', santriId: 's1', jenis: 'tabungan', label: 'Tabungan September 2026', nominal: 50000, status: 'belum', metode: '-', tanggal: '-' },
  { id: 'k4', santriId: 's1', jenis: 'iuran', label: 'Iuran Peringatan Maulid Nabi', nominal: 25000, status: 'belum', metode: '-', tanggal: '-' },
  { id: 'k5', santriId: 's6', jenis: 'spp', label: 'SPP September 2026', nominal: 150000, status: 'belum', metode: '-', tanggal: '-' },
  { id: 'k6', santriId: 's6', jenis: 'spp', label: 'SPP Agustus 2026', nominal: 150000, status: 'lunas', metode: 'QRIS', tanggal: '2026-08-08' }
];

// Get keuangan by santri ID
router.get('/santri/:santriId', (req, res) => {
  try {
    const data = keuanganData.filter(k => k.santriId === req.params.santriId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create keuangan
router.post('/', (req, res) => {
  try {
    const { santriId, jenis, label, nominal } = req.body;

    if (!santriId || !jenis || !nominal) {
      return res.status(400).json({ error: 'santriId, jenis, dan nominal harus diisi' });
    }

    const newKeuangan = {
      id: 'k' + Date.now(),
      santriId,
      jenis,
      label,
      nominal,
      status: 'belum',
      metode: '-',
      tanggal: '-'
    };

    keuanganData.push(newKeuangan);
    res.status(201).json({ success: true, data: newKeuangan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark payment as paid (QRIS)
router.put('/:id/bayar', (req, res) => {
  try {
    const index = keuanganData.findIndex(k => k.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Tagihan tidak ditemukan' });
    }

    const now = new Date();
    const tanggal = now.toISOString().split('T')[0];

    keuanganData[index] = {
      ...keuanganData[index],
      status: 'lunas',
      metode: req.body.metode_bayar || 'QRIS',
      tanggal
    };

    res.json({ success: true, data: keuanganData[index] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
