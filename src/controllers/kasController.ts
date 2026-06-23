import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Kas from '../models/Kas';
import Pembayaran from '../models/Pembayaran';
import Tagihan from '../models/Tagihan';
import Iuran from '../models/Iuran';
import Warga from '../models/Warga';
import { Op } from 'sequelize';

export const getAll = async (req: AuthRequest, res: Response) => {
  const { tipe, from, to } = req.query;
  const where: any = {};
  if (tipe) where.tipe = tipe;
  if (from || to) {
    where.tanggal = {};
    if (from) where.tanggal[Op.gte] = from;
    if (to) where.tanggal[Op.lte] = to;
  }
  const data = await Kas.findAll({
    where,
    include: [{
      model: Pembayaran,
      as: 'pembayaran',
      include: [{
        model: Tagihan,
        as: 'tagihan',
        include: [
          { model: Iuran, as: 'iuran' },
          { model: Warga, as: 'warga' }
        ]
      }]
    }],
    order: [['tanggal', 'DESC'], ['createdAt', 'DESC']]
  });
  res.json(data);
};

export const create = async (req: AuthRequest, res: Response) => {
  const data = await Kas.create(req.body);
  res.status(201).json(data);
};

export const saldo = async (_req: AuthRequest, res: Response) => {
  const masuk = await Kas.sum('nominal', { where: { tipe: 'masuk' } }) || 0;
  const keluar = await Kas.sum('nominal', { where: { tipe: 'keluar' } }) || 0;
  res.json({ saldo: (masuk as number) - (keluar as number), total_masuk: masuk, total_keluar: keluar });
};
