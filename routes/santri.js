// Santri management routes
import express from 'express';

const router = express.Router();

// Mock santri database
let santriData = [
  { id: 's1', nama: 'Muhammad Rizki', jilidId: 'j2', waliId: 'w1', aktif: true },
  { id: 's2', nama: 'Ahmad Zaki', jilidId: 'j2', waliId: 'w1', aktif: true },
  { id: 's3', nama: 'Nur Aini', jilidId: 'j2', waliId: 'w1', aktif: true },
  { id: 's6', nama: 'Fatimah Azzahra', jilidId: 'j1', waliId: 'w1', aktif: true }
];

// Get all santri
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const jilidId = req.query.jilid_id;

    let filtered = santriData;
    if (jilidId) {
      filtered = santriData.filter(s => s.jilidId === jilidId);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get santri by ID
router.get('/:id', (req, res) => {
  try {
    const santri = santriData.find(s => s.id === req.params.id);
    if (!santri) {
      return res.status(404).json({ error: 'Santri tidak ditemukan' });
    }
    res.json({ success: true, data: santri });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create santri
router.post('/', (req, res) => {
  try {
    const { nama, jilidId, waliId } = req.body;

    if (!nama || !jilidId || !waliId) {
      return res.status(400).json({ error: 'Nama, jilid_id, dan wali_id harus diisi' });
    }

    const newSantri = {
      id: 's' + Date.now(),
      nama,
      jilidId,
      waliId,
      aktif: true
    };

    santriData.push(newSantri);
    res.status(201).json({ success: true, data: newSantri });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update santri
router.put('/:id', (req, res) => {
  try {
    const index = santriData.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Santri tidak ditemukan' });
    }

    santriData[index] = { ...santriData[index], ...req.body };
    res.json({ success: true, data: santriData[index] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete santri
router.delete('/:id', (req, res) => {
  try {
    const index = santriData.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Santri tidak ditemukan' });
    }

    santriData.splice(index, 1);
    res.json({ success: true, message: 'Santri berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
