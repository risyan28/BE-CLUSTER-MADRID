import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Tagihan from '../models/Tagihan';
import Iuran from '../models/Iuran';
import Warga from '../models/Warga';
import Pembayaran from '../models/Pembayaran';
import Kas from '../models/Kas';
import { Op } from 'sequelize';

export const getAll = async (req: AuthRequest, res: Response) => {
  const { warga_id, iuran_id, bulan_from, bulan_to, tahun, status, status_warga } = req.query;
  const where: any = {};
  if (warga_id) where.warga_id = parseInt(warga_id as string);
  if (iuran_id) where.iuran_id = parseInt(iuran_id as string);
  if (bulan_from || bulan_to) {
    where.bulan = {};
    if (bulan_from) where.bulan[Op.gte] = parseInt(bulan_from as string);
    if (bulan_to) where.bulan[Op.lte] = parseInt(bulan_to as string);
  }
  if (tahun) where.tahun = parseInt(tahun as string);
  if (status === 'belum_lunas') {
    where.status = 'belum_lunas';
  } else if (status && status !== 'menunggu') {
    where.status = status;
  }
  const wargaInclude: any = { model: Warga, as: 'warga' };
  if (status_warga) {
    wargaInclude.where = { status: status_warga };
    wargaInclude.required = true;
  }
  const data = await Tagihan.findAll({
    where,
    include: [
      { model: Iuran, as: 'iuran' },
      wargaInclude,
      { model: Pembayaran, as: 'pembayaran', include: [
        { model: Warga, as: 'verifikator', attributes: ['id', 'nama'] },
        { model: Warga, as: 'uploader', attributes: ['id', 'nama'] }
      ] }
    ],
    order: [['tahun', 'DESC'], ['bulan', 'DESC']]
  });
  const filtered = status === 'menunggu'
    ? data.filter((item: any) => item.pembayaran?.status === 'menunggu')
    : status === 'belum_lunas'
      ? data.filter((item: any) => item.pembayaran?.status !== 'menunggu')
      : data;
  res.json(filtered);
};

export const getById = async (req: AuthRequest, res: Response) => {
  const data = await Tagihan.findByPk(req.params.id, {
    include: [
      { model: Iuran, as: 'iuran' },
      { model: Warga, as: 'warga' }
    ]
  });
  if (!data) return res.status(404).json({ message: 'Tagihan tidak ditemukan' });
  res.json(data);
};

export const getTagihanSaya = async (req: AuthRequest, res: Response) => {
  const warga_id = req.user!.id;
  const tahun = parseInt(req.query.tahun as string) || new Date().getFullYear();
  const data = await Tagihan.findAll({
    where: { warga_id, tahun },
    include: [
      { model: Iuran, as: 'iuran' },
      { model: Pembayaran, as: 'pembayaran', include: [
        { model: Warga, as: 'verifikator', attributes: ['id', 'nama'] },
        { model: Warga, as: 'uploader', attributes: ['id', 'nama'] }
      ] }
    ],
    order: [['bulan', 'ASC']]
  });
  res.json(data);
};
