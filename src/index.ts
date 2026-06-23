import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import { sequelize, Iuran, Warga, Tagihan } from './models';

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/auth').default);
app.use('/api/warga', require('./routes/warga').default);

app.use('/api/iuran', require('./routes/iuran').default);
app.use('/api/tagihan', require('./routes/tagihan').default);
app.use('/api/pembayaran', require('./routes/pembayaran').default);
app.use('/api/kas', require('./routes/kas').default);
app.use('/api/kegiatan', require('./routes/kegiatan').default);
app.use('/api/dashboard', require('./routes/dashboard').default);
app.use('/api/laporan', require('./routes/laporan').default);
app.use('/api/qris', require('./routes/qris').default);
app.use('/api/bendahara', require('./routes/bendahara').default);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Cluster Madrid API running' });
});

app.get('/api/seed', async (_req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { Warga, Iuran, Tagihan, Kegiatan, Kehadiran, Kas, Pembayaran } = require('./models');

    await Tagihan.destroy({ where: {} });
    await Pembayaran.destroy({ where: {} });
    await Kehadiran.destroy({ where: {} });
    await Kas.destroy({ where: {} });
    await Kegiatan.destroy({ where: {} });
    await Iuran.destroy({ where: {} });
    await Warga.destroy({ where: {} });

    const admin = await Warga.create({
      nama: 'ADMIN RT', email: 'admin@rt.com',
      password_hash: await bcrypt.hash('admin123', 10), role: 'admin',
    });

    const warga = await Warga.create({
      nama: 'BUDI SANTOSO', no_hp: '081234567892',
      status: 'Dihuni', blok: 'A', nomor: '1', rt: '03', rw: '07', aktif: true,
      alamat: 'Cluster Madrid Blok A No. 1',
      password_hash: await bcrypt.hash('081234567892', 10), role: 'warga',
    });

    const iuran = await Iuran.create({
      nama: 'IPKL', nominal: 150000, nominal_dihuni: 150000, nominal_belum_dihuni: 75000,
      periode: 'bulanan', aktif: true,
      keterangan: 'Iuran Pembangunan dan Kebersihan Lingkungan',
    });

    const now = new Date();
    await Tagihan.create({
      iuran_id: iuran.id, warga_id: warga.id,
      bulan: now.getMonth() + 1, tahun: now.getFullYear(),
      nominal: iuran.nominal, status: 'belum_lunas',
    });

    await Kegiatan.create({
      judul: 'Kerja Bakti Bulanan',
      tanggal: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      jam: '07:00', lokasi: 'Lapangan RT',
      deskripsi: 'Kerja bakti bersih-bersih lingkungan RT.',
      status: 'akan_datang', created_by: admin.id,
    });

    res.json({
      message: 'Seed complete!',
      admin: { email: 'admin@rt.com', password: 'admin123' },
      warga: { nama: 'BUDI SANTOSO', password: '081234567892' },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

cron.schedule('0 0 1 * *', async () => {
  console.log('[CRON] Generate tagihan otomatis tanggal 1');
  try {
    const iuranList = await Iuran.findAll({ where: { aktif: true } });
    const wargaList = await Warga.findAll({ where: { aktif: true } });
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();
    let created = 0;
    for (const iuran of iuranList) {
      if (iuran.periode !== 'bulanan') continue;
      for (const warga of wargaList) {
        const [, isNew] = await Tagihan.findOrCreate({
          where: { iuran_id: iuran.id, warga_id: warga.id, bulan, tahun },
          defaults: { iuran_id: iuran.id, warga_id: warga.id, bulan, tahun, nominal: iuran.nominal as number }
        });
        if (isNew) created++;
      }
    }
    console.log(`[CRON] ${created} tagihan baru dibuat`);
  } catch (err: any) {
    console.error('[CRON] Error:', err.message);
  }
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const getNetworkIP = () => {
  try {
    const os = require('os');
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal) return net.address;
      }
    }
  } catch (_) {}
  return '127.0.0.1';
};

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(Number(PORT), HOST, () => {
    const ip = getNetworkIP();
    console.log(`Backend: http://localhost:${PORT}`);
    console.log(`Backend network: http://${ip}:${PORT}`);
  });
});
