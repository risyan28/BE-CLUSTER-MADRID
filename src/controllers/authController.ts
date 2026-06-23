import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Warga from '../models/Warga';
import { AuthRequest } from '../middleware/auth';

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email diperlukan' });
    const user = await Warga.findOne({ where: { email, aktif: true } });
    if (!user) return res.status(400).json({ message: 'Email tidak terdaftar' });
    const valid = await user.verifyPassword(password);
    if (!valid) return res.status(400).json({ message: 'Password salah' });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' } as jwt.SignOptions
    );
    res.json({ token, user: user.toJSON() });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const loginByHunian = async (req: AuthRequest, res: Response) => {
  try {
    const { hunian_id } = req.body;
    if (!hunian_id) return res.status(400).json({ message: 'Pilih hunian' });
    const user = await Warga.findByPk(hunian_id);
    if (!user || !user.aktif) return res.status(404).json({ message: 'Warga tidak ditemukan' });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' } as jwt.SignOptions
    );
    res.json({ token, user: user.toJSON() });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { nama, email, password, role, blok, nomor } = req.body;
    if (email) {
      const exist = await Warga.findOne({ where: { email } });
      if (exist) return res.status(400).json({ message: 'Email sudah digunakan' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await Warga.create({
      nama, email: email || null, password_hash: hash,
      role: role || 'warga', blok: blok || null, nomor: nomor || null,
      rt: '03', rw: '016',
      status: 'Belum dihuni',
    });
    res.status(201).json({ message: 'Registrasi berhasil', user: user.toJSON() });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getHunianList = async (_req: AuthRequest, res: Response) => {
  const data = await Warga.findAll({
    where: { aktif: true },
    order: [['blok', 'ASC'], ['nomor', 'ASC']]
  });
  const list = data.map(w => ({
    id: w.id,
    label: w.blok && w.nomor ? `Blok ${w.blok} No. ${w.nomor}` : w.nama,
    warga: w.nama,
    role: w.role,
  }));
  res.json(list);
};

export const me = async (req: AuthRequest, res: Response) => {
  const user = await Warga.findByPk(req.user!.id);
  res.json(user);
};
