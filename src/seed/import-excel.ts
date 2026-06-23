import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { sequelize } from '../models';
import Warga from '../models/Warga';
import Iuran from '../models/Iuran';
import Tagihan from '../models/Tagihan';
import Kegiatan from '../models/Kegiatan';
import XLSX from 'xlsx';

async function main() {
  await sequelize.sync({ alter: true });

  // Clean
  await Tagihan.destroy({ where: {} });
  await Kegiatan.destroy({ where: {} });
  await Warga.destroy({ where: {} });

  const wb = XLSX.readFile('C:\\Users\\adaptive\\Downloads\\DATA MASTER WARGA - IPKL ( RT 03 RW 016 ~ CLUSTER MADRID ).xlsx');
  const ws = wb.Sheets['DATA WARGA RT 03'];
  const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Filter valid rows (skip header, total row, JANGAN DI CEKLIST, empty)
  const rows = data.slice(4).filter((r: any) => {
    const nama = (r[1] || '').toString().trim().toUpperCase();
    if (!nama || nama === 'JANGAN DI CEKLIST NONAME' || nama === 'NAMA' || nama.startsWith('TOTAL')) return false;
    return true;
  });

  // Admin user
  const admin = await Warga.create({
    nama: 'ADMIN RT', email: 'admin@rt.com',
    password_hash: await bcrypt.hash('admin123', 10), role: 'admin',
  });
  console.log('Admin created');

  let wargaCount = 0;

  for (const row of rows) {
    const nama = (row[1] || '').toString().trim().toUpperCase();
    const alamat = (row[2] || '').toString().trim();
    let status = (row[3] || '').toString().trim();
    status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    status = status.replace(/kontrak/i, 'Kontrak');
    const noHp = (row[4] || '').toString().trim().replace(/[^0-9]/g, '');

    if (!nama || !alamat) continue;

    const match = alamat.match(/^([A-Z0-9]+)\/(\d+)$/i);
    let blok = alamat;
    let nomor = '1';
    if (match) {
      blok = match[1].toUpperCase();
      nomor = match[2];
    }

    const wargaStatus = status === 'Belum dihuni' ? 'Belum dihuni' as const
      : status === 'Dihuni/Kontrak' ? 'Dihuni/Kontrak' as const
      : 'Dihuni' as const;

    await Warga.create({
      nama, no_hp: noHp, status: wargaStatus,
      blok, nomor, rt: '03', rw: '016',
      alamat: `Cluster Madrid Blok ${blok} No. ${nomor}`,
      password_hash: await bcrypt.hash(noHp || `warga${wargaCount + 1}`, 10),
      role: 'warga',
    });

    wargaCount++;
  }

  console.log(`${wargaCount} warga imported`);

  // Iuran IPKL
  const iuran = await Iuran.create({
    nama: 'IPKL', nominal: 150000, periode: 'bulanan', aktif: true,
    keterangan: 'Iuran Pembangunan dan Kebersihan Lingkungan',
  });
  console.log('Iuran IPKL created');

  // Tagihan bulan ini
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();
  const allWarga = await Warga.findAll({ where: { aktif: true } });
  let tagihanCount = 0;
  for (const w of allWarga) {
    await Tagihan.findOrCreate({
      where: { iuran_id: iuran.id, warga_id: w.id, bulan, tahun },
      defaults: { iuran_id: iuran.id, warga_id: w.id, bulan, tahun, nominal: iuran.nominal },
    });
    tagihanCount++;
  }
  console.log(`${tagihanCount} tagihan bulan ${bulan}/${tahun}`);

  // Kegiatan sample
  await Kegiatan.create({
    judul: 'Kerja Bakti Bulanan',
    tanggal: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    jam: '07:00', lokasi: 'Lapangan RT',
    deskripsi: 'Kerja bakti bersih-bersih lingkungan RT.',
    status: 'akan_datang', created_by: admin.id,
  });
  await Kegiatan.create({
    judul: 'Rapat Warga Bulanan',
    tanggal: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    jam: '19:30', lokasi: 'Balai RT',
    deskripsi: 'Rapat bulanan evaluasi iuran dan rencana kegiatan.',
    status: 'akan_datang', created_by: admin.id,
  });
  console.log('Kegiatan created');

  console.log('\nDONE!');
  console.log(`Admin: admin@rt.com / admin123`);
  console.log(`Warga login: pilih hunian, password = no HP`);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
