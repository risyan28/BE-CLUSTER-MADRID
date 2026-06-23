import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Iuran from '../models/Iuran';
import Tagihan from '../models/Tagihan';
import Warga from '../models/Warga';

export const getAll = async (_req: AuthRequest, res: Response) => {
  const data = await Iuran.findAll({ order: [['nama', 'ASC']] });
  res.json(data);
};

export const getById = async (req: AuthRequest, res: Response) => {
  const data = await Iuran.findByPk(req.params.id);
  if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
  res.json(data);
};

export const create = async (req: AuthRequest, res: Response) => {
  const data = await Iuran.create(req.body);
  res.status(201).json(data);
};

export const update = async (req: AuthRequest, res: Response) => {
  const data = await Iuran.findByPk(req.params.id);
  if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
  await data.update(req.body);
  res.json(data);
};

export const delete_ = async (req: AuthRequest, res: Response) => {
  const data = await Iuran.findByPk(req.params.id);
  if (!data) return res.status(404).json({ message: 'Data tidak ditemukan' });
  await data.destroy();
  res.json({ message: 'Iuran dihapus' });
};

export const generateTagihan = async (req: AuthRequest, res: Response) => {
  try {
    const iuran = await Iuran.findByPk(req.params.id);
    if (!iuran) return res.status(404).json({ message: 'Iuran tidak ditemukan' });
    const { bulan, tahun, warga_ids } = req.body;
    const month = bulan || new Date().getMonth() + 1;
    const year = tahun || new Date().getFullYear();
    const whereWarga: any = { aktif: true };
    if (warga_ids && warga_ids.length) whereWarga.id = warga_ids;
    const wargaList = await Warga.findAll({ where: whereWarga });
    let created = 0;
    for (const warga of wargaList) {
      const isDihuni = warga.status === 'Dihuni' || warga.status === 'Dihuni/Kontrak';
      const nominal = isDihuni ? (iuran.nominal_dihuni as number) : (iuran.nominal_belum_dihuni as number);
      const [, isNew] = await Tagihan.findOrCreate({
        where: { iuran_id: iuran.id, warga_id: warga.id, bulan: month, tahun: year },
        defaults: { iuran_id: iuran.id, warga_id: warga.id, bulan: month, tahun: year, nominal }
      });
      if (isNew) created++;
    }
    res.json({ message: `${created} tagihan berhasil dibuat`, total: wargaList.length });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
