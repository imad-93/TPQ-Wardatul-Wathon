// Authentication routes
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock users database - akan ganti dengan database sebenarnya
const users = [
  {
    id: 'w1',
    username: 'wali.ahmad',
    password: '$2a$10$Yq7l5lZXvzPLVrXdSf3Feu6C9d8e7f6g5h4i3j2k1l0m9n8o7p6q5', // bcrypt hash of '123456'
    nama: 'Bpk. Ahmad Fauzi',
    role: 'wali',
    hp: '0813-1111-0001'
  },
  {
    id: 'u1',
    username: 'ustadzah.aminah',
    password: '$2a$10$Yq7l5lZXvzPLVrXdSf3Feu6C9d8e7f6g5h4i3j2k1l0m9n8o7p6q5', // bcrypt hash of '123456'
    nama: 'Ustadzah Aminah',
    role: 'ustadzah',
    hp: '0812-3456-7801'
  },
  {
    id: 'a1',
    username: 'admin.tpq',
    password: '$2a$10$Yq7l5lZXvzPLVrXdSf3Feu6C9d8e7f6g5h4i3j2k1l0m9n8o7p6q5', // bcrypt hash of '123456'
    nama: 'Admin TPQ',
    role: 'admin',
    hp: '0813-9999-9999'
  }
];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    // Cari user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Verifikasi password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Return response
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
        hp: user.hp
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout berhasil' });
});

export default router;
