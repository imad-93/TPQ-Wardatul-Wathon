// Riwayat ngaji routes
import express from 'express';

const router = express.Router();

// Mock riwayat database
let riwayatData = [
  { id: 'r1', santriId: 's1', jenis: 'bacaan', halaman: 14, status: 'naik', pesan: 'Bacaan tajwidnya sudah rapi', tanggal: '2026-09-15' },
  { id: 'r2', santriId: 's1', jenis: 'bacaan', halaman: 13, status: 'mengulang', pesan: 'Pesan suara (0:24)', tanggal: '2026-09-12' },
  { id: 'r3', santriId: 's1', jenis: 'hafalan', halaman: 5, status: 'naik', pesan: 'Hafalan An-Naba ayat 1-5 sudah lancar', tanggal: '2026-09-14' },
  { id: 'r4', santriId: 's6', jenis: 'bacaan', halaman: 9, status: 'mengulang', pesan: 'Perhatikan panjang pendek bacaan', tanggal: '2026-09-15' }
];

// Get riwayat by santri ID
router.get('/santri/:santriId', (req, res) => {
  try {
    const jenis = req.query.jenis;
    let data = riwayatData.filter(r => r.santriId === req.params.santriId);
    
    if (jenis) {
      data = data.filter(r => r.jenis === jenis);
    }

    res.json({ success: true, data: data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create riwayat
router.post('/', (req, res) => {
  try {
    const { santriId, jenis, halaman, status, pesan } = req.body;

    if (!santriId || !jenis || !status) {
      return res.status(400).json({ error: 'santriId, jenis, dan status harus diisi' });
    }

    const now = new Date();
    const tanggal = now.toISOString().split('T')[0];

    const newRiwayat = {
      id: 'r' + Date.now(),
      santriId,
      jenis,
      halaman,
      status,
      pesan,
      tanggal
    };

    riwayatData.push(newRiwayat);
    res.status(201).json({ success: true, data: newRiwayat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
