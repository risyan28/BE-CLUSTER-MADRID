import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Kegiatan from '../models/Kegiatan';
import Kehadiran from '../models/Kehadiran';
import Warga from '../models/Warga';

export const getAll = async (_req: AuthRequest, res: Response) => {
  const data = await Kegiatan.findAll({
    include: [{ model: Kehadiran, as: 'kehadiran', include: ['warga'] }],
    order: [['tanggal', 'DESC']]
  });
  res.json(data);
};

export const getById = async (req: AuthRequest, res: Response) => {
  const data = await Kegiatan.findByPk(req.params.id, {
    include: [{ model: Kehadiran, as: 'kehadiran', include: ['warga'] }]
  });
  if (!data) return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
  res.json(data);
};

export const create = async (req: AuthRequest, res: Response) => {
  const data = await Kegiatan.create({ ...req.body, created_by: req.user!.id });
  res.status(201).json(data);
};

export const update = async (req: AuthRequest, res: Response) => {
  const data = await Kegiatan.findByPk(req.params.id);
  if (!data) return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
  await data.update(req.body);
  res.json(data);
};

export const delete_ = async (req: AuthRequest, res: Response) => {
  const data = await Kegiatan.findByPk(req.params.id);
  if (!data) return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
  await data.destroy();
  res.json({ message: 'Kegiatan dihapus' });
};

export const hadir = async (req: AuthRequest, res: Response) => {
  const kegiatan = await Kegiatan.findByPk(req.params.id);
  if (!kegiatan) return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
  const warga_id = req.body.warga_id || req.user!.id;
  if (!warga_id) return res.status(400).json({ message: 'Data warga tidak ditemukan' });
  const [kehadiran, created] = await Kehadiran.findOrCreate({
    where: { kegiatan_id: kegiatan.id, warga_id },
    defaults: { status: 'hadir' }
  });
  if (!created) await kehadiran.update({ status: 'hadir' });
  res.json({ message: 'Kehadiran dicatat' });
};
