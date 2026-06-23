import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Warga from '../models/Warga';

export const getAll = async (req: AuthRequest, res: Response) => {
  const { aktif } = req.query;
  const where: any = {};
  if (aktif !== undefined) where.aktif = aktif === 'true';
  const data = await Warga.findAll({ where, order: [['nama', 'ASC']] });
  res.json(data);
};

export const getById = async (req: AuthRequest, res: Response) => {
  const data = await Warga.findByPk(req.params.id);
  if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
  res.json(data);
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const data = await Warga.create(req.body);
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  const data = await Warga.findByPk(req.params.id);
  if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
  await data.update(req.body);
  res.json(data);
};

export const toggleRole = async (req: AuthRequest, res: Response) => {
  try {
    const data = await Warga.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
    if (data.id === req.user!.id) return res.status(400).json({ message: 'Tidak bisa mengubah role sendiri' });
    const newRole = data.role === 'admin' ? 'warga' : 'admin';
    await data.update({ role: newRole });
    res.json({ message: `Role berhasil diubah menjadi ${newRole}`, user: data.toJSON() });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const delete_ = async (req: AuthRequest, res: Response) => {
  const data = await Warga.findByPk(req.params.id);
  if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
  await data.destroy();
  res.json({ message: 'Data dihapus' });
};
