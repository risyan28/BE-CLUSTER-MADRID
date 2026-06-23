import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { sequelize } from '../models';
import Warga from '../models/Warga';
import Iuran from '../models/Iuran';
import Tagihan from '../models/Tagihan';
import Kegiatan from '../models/Kegiatan';

async function seed() {
  await sequelize.sync({ alter: true });
  console.log('DB synced. Seeding...');

  // Clean existing data
  await Tagihan.destroy({ where: {} });
  await Kegiatan.destroy({ where: {} });
  await Iuran.destroy({ where: {} });
  await Warga.destroy({ where: {} });

  // === 1. Warga (admin) ===
  const adminUser = await Warga.create({
    nama: 'ADMIN RT', email: 'admin@rt.com',
    password_hash: await bcrypt.hash('admin123', 10), role: 'admin',
  });
  console.log('✅ Admin (admin@rt.com / admin123)');

  // === 2. Warga (dummy) ===
  const warga = await Warga.create({
    nama: 'BUDI SANTOSO', no_hp: '081234567892',
    status: 'Dihuni', blok: 'A', nomor: '1', rt: '03', rw: '07',
    alamat: 'Perumahan Griya Asri Blok A No. 1',
    password_hash: await bcrypt.hash('081234567892', 10), role: 'warga',
  });
  console.log('✅ 1 warga (login: pilih hunian)');

  // === 4. Iuran ===
  const iuran = await Iuran.create({
    nama: 'IPKL', nominal: 150000, periode: 'bulanan', aktif: true,
    keterangan: 'Iuran Pembangunan dan Kebersihan Lingkungan',
  });
  console.log('✅ 1 iuran (IPKL - Rp150.000)');

  // === 5. Tagihan bulan ini ===
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();
  await Tagihan.create({
    iuran_id: iuran.id, warga_id: warga.id,
    bulan, tahun, nominal: iuran.nominal,
  });
  console.log(`✅ 1 tagihan bulan ${bulan}/${tahun}`);

  // === 6. Kegiatan ===
  await Kegiatan.create({
    judul: 'Kerja Bakti Bulanan',
    tanggal: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    jam: '07:00', lokasi: 'Lapangan RT',
    deskripsi: 'Kerja bakti bersih-bersih lingkungan RT.',
    status: 'akan_datang', created_by: adminUser.id,
  });
  await Kegiatan.create({
    judul: 'Rapat Warga Bulanan',
    tanggal: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    jam: '19:30', lokasi: 'Balai RT',
    deskripsi: 'Rapat bulanan evaluasi iuran dan rencana kegiatan.',
    status: 'akan_datang', created_by: adminUser.id,
  });
  await Kegiatan.create({
    judul: 'Pengajian Akbar',
    tanggal: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    jam: '09:00', lokasi: 'Masjid Al-Ikhlas',
    deskripsi: 'Pengajian akbar dalam rangka Isra Miraj.',
    status: 'selesai', created_by: adminUser.id,
  });
  console.log('✅ 3 kegiatan created');

  console.log('\n========================================');
  console.log('  SEEDING COMPLETE!');
  console.log('========================================');
  console.log('  Admin:  admin@rt.com / admin123');
  console.log('  Warga:  login pilih Blok A No.1');
  console.log('========================================\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
