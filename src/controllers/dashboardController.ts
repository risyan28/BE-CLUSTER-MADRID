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

export const matriksIuran = async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const tahunSekarang = new Date().getFullYear();
  const bulanSekarang = new Date().getMonth() + 1;
  const tahun = parseInt(req.query.tahun as string) || tahunSekarang;
  const bulanNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  const whereWarga: any = { aktif: true };
  if (user.role === 'warga') whereWarga.id = user.id;

  const wargaList = await Warga.findAll({
    where: whereWarga,
    attributes: ['id', 'nama', 'blok', 'nomor'],
    order: [['blok', 'ASC'], [literal('CAST(nomor AS SIGNED)'), 'ASC']]
  });

  const tagihanAgg = await Tagihan.findAll({
    where: { tahun },
    attributes: [
      'warga_id', 'bulan',
      [fn('COUNT', col('id')), 'total'],
      [fn('SUM', literal('CASE WHEN status = "lunas" THEN 1 ELSE 0 END')), 'lunas_count']
    ],
    group: ['warga_id', 'bulan'],
    raw: true
  });

  const lookup: Record<string, string> = {};
  for (const row of tagihanAgg as any[]) {
    const total = parseInt(row.total) || 0;
    const lunasCount = parseInt(row.lunas_count) || 0;
    if (total === 0) continue;
    const id = `${row.warga_id}_${row.bulan}_${tahun}`;
    if (total === lunasCount) {
      lookup[id] = 'lunas';
    } else if (tahun < tahunSekarang || (tahun === tahunSekarang && row.bulan < bulanSekarang)) {
      lookup[id] = 'nunggak';
    } else {
      lookup[id] = 'belum_lunas';
    }
  }

  const bulanList: { bulan: number; label: string }[] = [];
  for (let b = 1; b <= 12; b++) {
    bulanList.push({ bulan: b, label: bulanNames[b - 1] });
  }

  res.json({ warga: wargaList, lookup, bulanList, bulanSekarang, tahun });
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
