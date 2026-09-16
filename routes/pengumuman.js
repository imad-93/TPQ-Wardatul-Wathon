// Pengumuman routes
import express from 'express';

const router = express.Router();

// Mock pengumuman database
let pengumumanData = [
  { id: 'p1', judul: 'Libur Maulid Nabi Muhammad SAW', tanggal: '2026-09-14', isi: 'Kegiatan mengaji diliburkan pada hari Senin, 15 September 2026 dalam rangka peringatan Maulid Nabi. Kegiatan aktif kembali hari Selasa.' },
  { id: 'p2', judul: 'Pembayaran SPP September', tanggal: '2026-09-01', isi: 'Mohon wali santri menyelesaikan pembayaran SPP bulan September paling lambat tanggal 10 melalui menu Riwayat Keuangan.' },
  { id: 'p3', judul: 'Khataman Akbar Akhir Tahun', tanggal: '2026-08-28', isi: 'TPQ akan mengadakan Khataman Akbar pada bulan Oktober. Info lebih lanjut menyusul melalui pengumuman berikutnya.' }
];

// Get all pengumuman
router.get('/', (req, res) => {
  try {
    const sorted = pengumumanData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pengumuman by ID
router.get('/:id', (req, res) => {
  try {
    const pengumuman = pengumumanData.find(p => p.id === req.params.id);
    if (!pengumuman) {
      return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
    }
    res.json({ success: true, data: pengumuman });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create pengumuman
router.post('/', (req, res) => {
  try {
    const { judul, isi } = req.body;

    if (!judul || !isi) {
      return res.status(400).json({ error: 'Judul dan isi harus diisi' });
    }

    const now = new Date();
    const tanggal = now.toISOString().split('T')[0];

    const newPengumuman = {
      id: 'p' + Date.now(),
      judul,
      isi,
      tanggal
    };

    pengumumanData.unshift(newPengumuman);
    res.status(201).json({ success: true, data: newPengumuman });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pengumuman
router.delete('/:id', (req, res) => {
  try {
    const index = pengumumanData.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Pengumuman tidak ditemukan' });
    }

    pengumumanData.splice(index, 1);
    res.json({ success: true, message: 'Pengumuman berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
