import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Tagihan from '../models/Tagihan';
import Pembayaran from '../models/Pembayaran';
import Kas from '../models/Kas';
import Iuran from '../models/Iuran';
import Warga from '../models/Warga';
import { Op } from 'sequelize';

export const laporanIuran = async (req: AuthRequest, res: Response) => {
  const { bulan, tahun } = req.query;
  const where: any = {};
  if (bulan) where.bulan = parseInt(bulan as string);
  if (tahun) where.tahun = parseInt(tahun as string);
  const data = await Tagihan.findAll({
    where,
    include: [
      { model: Iuran, as: 'iuran' },
      { model: Warga, as: 'warga' },
      { model: Pembayaran, as: 'pembayaran' }
    ],
    order: [['warga_id', 'ASC']]
  });
  const totalNominal = data.reduce((s, t) => s + Number(t.nominal), 0);
  const totalLunas = data.filter(t => t.status === 'lunas').length;
  res.json({ data, totalTagihan: data.length, totalLunas, totalNominal });
};

export const laporanKas = async (req: AuthRequest, res: Response) => {
  const { from, to } = req.query;
  const where: any = {};
  if (from || to) {
    where.tanggal = {};
    if (from) where.tanggal[Op.gte] = from;
    if (to) where.tanggal[Op.lte] = to;
  }
  const data = await Kas.findAll({ where, order: [['tanggal', 'ASC']] });
  const totalMasuk = data.filter(d => d.tipe === 'masuk').reduce((s, d) => s + Number(d.nominal), 0);
  const totalKeluar = data.filter(d => d.tipe === 'keluar').reduce((s, d) => s + Number(d.nominal), 0);
  res.json({ data, totalMasuk, totalKeluar, saldo: totalMasuk - totalKeluar });
};

export const laporanWarga = async (_req: AuthRequest, res: Response) => {
  const data = await Warga.findAll({
    where: { aktif: true },
    order: [['nama', 'ASC']]
  });
  res.json({ data, total: data.length });
};
