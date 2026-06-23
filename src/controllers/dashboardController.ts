import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Warga, Tagihan, Kas } from '../models';
import { fn, col, literal, where as seqWhere, Op } from 'sequelize';

export const stats = async (_req: AuthRequest, res: Response) => {
  const totalWarga = await Warga.count({ where: { aktif: true, role: 'warga' } });
  const totalHunian = await Warga.count({ where: { blok: { [require('sequelize').Op.ne]: null } } });
  const hunianTerisi = await Warga.count({ where: { status: ['Dihuni', 'Dihuni/Kontrak'] } });
  const totalTagihanBlm = await Tagihan.count({ where: { status: 'belum_lunas' } });
  const totalTagihanLunas = await Tagihan.count({ where: { status: 'lunas' } });
  const kasMasuk = await Kas.sum('nominal', { where: { tipe: 'masuk' } }) || 0;
  const kasKeluar = await Kas.sum('nominal', { where: { tipe: 'keluar' } }) || 0;
  const bulanIni = new Date().getMonth() + 1;
  const tahunIni = new Date().getFullYear();
  const tagihanBulanIni = await Tagihan.count({ where: { bulan: bulanIni, tahun: tahunIni } });
  const lunasBulanIni = await Tagihan.count({ where: { bulan: bulanIni, tahun: tahunIni, status: 'lunas' } });
  const pemasukanBulanIni = await Kas.sum('nominal', { where: { tipe: 'masuk', [Op.and]: [seqWhere(fn('YEAR', col('tanggal')), tahunIni), seqWhere(fn('MONTH', col('tanggal')), bulanIni)] } }) || 0;
  const pengeluaranBulanIni = await Kas.sum('nominal', { where: { tipe: 'keluar', [Op.and]: [seqWhere(fn('YEAR', col('tanggal')), tahunIni), seqWhere(fn('MONTH', col('tanggal')), bulanIni)] } }) || 0;
  res.json({
    totalWarga, totalHunian, hunianTerisi, hunianKosong: totalHunian - hunianTerisi,
    totalTagihanBlm, totalTagihanLunas,
    kasMasuk, kasKeluar, saldo: (kasMasuk as number) - (kasKeluar as number),
    tagihanBulanIni, lunasBulanIni,
    persenLunas: tagihanBulanIni > 0 ? Math.round((lunasBulanIni / tagihanBulanIni) * 100) : 0,
    pemasukanBulanIni, pengeluaranBulanIni
  });
};

export const grafikIuran = async (req: AuthRequest, res: Response) => {
  const tahun = (req.query.tahun as string) || String(new Date().getFullYear());
  const data = await Tagihan.findAll({
    attributes: ['bulan', [fn('COUNT', col('id')), 'total'], [fn('SUM', literal('CASE WHEN status = "lunas" THEN 1 ELSE 0 END')), 'lunas']],
    where: { tahun: parseInt(tahun) },
    group: ['bulan'],
    order: [['bulan', 'ASC']]
  });
  const bulanData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const d = data.find(x => x.get('bulan') === month);
    const total = (d as any)?.dataValues?.total || 0;
    const lunas = parseInt((d as any)?.dataValues?.lunas) || 0;
    return { bulan: month, total, lunas, belum_lunas: total - lunas };
  });
  res.json(bulanData);
};

export const grafikKas = async (req: AuthRequest, res: Response) => {
  const tahun = (req.query.tahun as string) || String(new Date().getFullYear());
  const data = await Kas.findAll({
    attributes: [
      [fn('MONTH', col('tanggal')), 'bulan'],
      [fn('SUM', literal('CASE WHEN tipe = "masuk" THEN nominal ELSE 0 END')), 'masuk'],
      [fn('SUM', literal('CASE WHEN tipe = "keluar" THEN nominal ELSE 0 END')), 'keluar']
    ],
    where: seqWhere(fn('YEAR', col('tanggal')), parseInt(tahun)),
    group: [fn('MONTH', col('tanggal'))],
    order: [[fn('MONTH', col('tanggal')), 'ASC']]
  });
  const bulanData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const d = data.find(x => parseInt(x.get('bulan') as string) === month);
    return {
      bulan: month,
      masuk: parseFloat((d as any)?.get('masuk')) || 0,
      keluar: parseFloat((d as any)?.get('keluar')) || 0
    };
  });
  res.json(bulanData);
};
