import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Pembayaran from '../models/Pembayaran';
import Tagihan from '../models/Tagihan';
import Kas from '../models/Kas';
import Iuran from '../models/Iuran';
import Warga from '../models/Warga';
import { Op } from 'sequelize';

export const getAll = async (req: AuthRequest, res: Response) => {
  const { status, metode, tgl_from, tgl_to } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (metode) where.metode = metode;
  if (tgl_from || tgl_to) {
    where.tgl_bayar = {};
    if (tgl_from) where.tgl_bayar[Op.gte] = tgl_from;
    if (tgl_to) where.tgl_bayar[Op.lte] = tgl_to;
  }
  const data = await Pembayaran.findAll({
    where,
    include: [
      { model: Tagihan, as: 'tagihan', include: [
        { model: Iuran, as: 'iuran' },
        { model: Warga, as: 'warga' }
      ]},
      { model: Warga, as: 'verifikator', attributes: ['id', 'nama'] }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json(data);
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { tagihan_id, metode, nominal, keterangan } = req.body;
    const tagihan = await Tagihan.findByPk(tagihan_id, {
      include: [
        { model: Iuran, as: 'iuran' },
        { model: Warga, as: 'warga' }
      ]
    });
    if (!tagihan) return res.status(404).json({ message: 'Tagihan tidak ditemukan' });
    if (tagihan.status === 'lunas') return res.status(400).json({ message: 'Tagihan sudah lunas' });
    const bayarNominal = nominal || tagihan.nominal;
    const pembayaran = await Pembayaran.create({
      tagihan_id, metode, nominal: bayarNominal,
      status: metode === 'tunai' ? 'lunas' : 'menunggu',
      verified_by: metode === 'tunai' ? req.user!.id : null,
      keterangan
    });
    if (metode === 'tunai') {
      await tagihan.update({ status: 'lunas' });
      const t = tagihan as any;
      await Kas.create({
        tipe: 'masuk', kategori: 'iuran', nominal: bayarNominal,
        keterangan: `Pembayaran IPKL via tunai - ${t.iuran?.nama || 'iuran'} - ${t.warga?.nama || '-'} - ${t.bulan}/${t.tahun}`,
        pembayaran_id: pembayaran.id
      });
    }
    res.status(201).json(pembayaran);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadBukti = async (req: AuthRequest, res: Response) => {
  try {
    const { tagihan_id, metode } = req.body;
    const tagihan = await Tagihan.findByPk(tagihan_id);
    if (!tagihan) return res.status(404).json({ message: 'Tagihan tidak ditemukan' });
    let bukti_url = null;
    if (req.file) bukti_url = `/uploads/${req.file.filename}`;
    const pembayaran = await Pembayaran.create({
      tagihan_id, metode, nominal: tagihan.nominal,
      bukti_url, status: 'menunggu'
    });
    res.status(201).json(pembayaran);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const verifikasi = async (req: AuthRequest, res: Response) => {
  try {
    const pembayaran = await Pembayaran.findByPk(req.params.id, {
      include: [{ model: Tagihan, as: 'tagihan', include: [
        { model: Iuran, as: 'iuran' },
        { model: Warga, as: 'warga' }
      ]}]
    });
    if (!pembayaran) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    if (pembayaran.status !== 'menunggu') return res.status(400).json({ message: 'Pembayaran sudah diproses' });
    await pembayaran.update({ status: 'lunas', verified_by: req.user!.id });
    await (pembayaran as any).tagihan.update({ status: 'lunas' });
    const p = pembayaran as any;
    await Kas.create({
      tipe: 'masuk', kategori: 'iuran', nominal: pembayaran.nominal,
      keterangan: `Pembayaran IPKL via ${pembayaran.metode === 'transfer' ? 'Transfer Bank' : pembayaran.metode === 'qris' ? 'QRIS' : pembayaran.metode} - ${p.tagihan?.iuran?.nama || 'iuran'} - ${p.tagihan?.warga?.nama || '-'} - ${p.tagihan?.bulan}/${p.tagihan?.tahun}`,
      pembayaran_id: pembayaran.id
    });
    res.json({ message: 'Pembayaran diverifikasi' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const tolak = async (req: AuthRequest, res: Response) => {
  try {
    const pembayaran = await Pembayaran.findByPk(req.params.id);
    if (!pembayaran) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    if (pembayaran.status !== 'menunggu') return res.status(400).json({ message: 'Pembayaran sudah diproses' });
    await pembayaran.update({ status: 'ditolak', verified_by: req.user!.id, keterangan: req.body.alasan });
    res.json({ message: 'Pembayaran ditolak' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
