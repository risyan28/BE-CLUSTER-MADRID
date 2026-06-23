import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(__dirname, '../../uploads');

export const getQris = async (_req: AuthRequest, res: Response) => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const files = fs.readdirSync(uploadsDir).filter(f => f.startsWith('qris_'));
  if (files.length === 0) return res.json({ url: null });
  const latest = files.sort().reverse()[0];
  res.json({ url: `/uploads/${latest}`, filename: latest });
};

export const uploadQris = async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan' });
  try {
    // Hapus QRIS lama
    if (fs.existsSync(uploadsDir)) {
      const old = fs.readdirSync(uploadsDir).filter(f => f.startsWith('qris_'));
      old.forEach(f => fs.unlinkSync(path.join(uploadsDir, f)));
    }
    const ext = path.extname(req.file.originalname);
    const newName = `qris_${Date.now()}${ext}`;
    const newPath = path.join(uploadsDir, newName);
    fs.copyFileSync(req.file.path, newPath);
    fs.unlinkSync(req.file.path);
    res.json({ url: `/uploads/${newName}`, message: 'QRIS berhasil diupload' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteQris = async (_req: AuthRequest, res: Response) => {
  if (!fs.existsSync(uploadsDir)) return res.json({ message: 'Tidak ada QRIS' });
  const files = fs.readdirSync(uploadsDir).filter(f => f.startsWith('qris_'));
  files.forEach(f => fs.unlinkSync(path.join(uploadsDir, f)));
  res.json({ message: 'QRIS dihapus' });
};
