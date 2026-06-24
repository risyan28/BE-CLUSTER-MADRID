import sequelize from '../config/database';
import Warga from './Warga';
import Iuran from './Iuran';
import Tagihan from './Tagihan';
import Pembayaran from './Pembayaran';
import Kas from './Kas';
import Kegiatan from './Kegiatan';
import Kehadiran from './Kehadiran';

Tagihan.belongsTo(Iuran, { foreignKey: 'iuran_id', as: 'iuran' });
Iuran.hasMany(Tagihan, { foreignKey: 'iuran_id', as: 'tagihan' });

Tagihan.belongsTo(Warga, { foreignKey: 'warga_id', as: 'warga' });
Warga.hasMany(Tagihan, { foreignKey: 'warga_id', as: 'tagihan' });

Pembayaran.belongsTo(Tagihan, { foreignKey: 'tagihan_id', as: 'tagihan' });
Tagihan.hasOne(Pembayaran, { foreignKey: 'tagihan_id', as: 'pembayaran' });

Pembayaran.belongsTo(Warga, { foreignKey: 'verified_by', as: 'verifikator' });
Pembayaran.belongsTo(Warga, { foreignKey: 'uploaded_by', as: 'uploader' });

Pembayaran.hasOne(Kas, { foreignKey: 'pembayaran_id', as: 'kas' });
Kas.belongsTo(Pembayaran, { foreignKey: 'pembayaran_id', as: 'pembayaran' });

Kegiatan.belongsTo(Warga, { foreignKey: 'created_by', as: 'creator' });

Kehadiran.belongsTo(Kegiatan, { foreignKey: 'kegiatan_id', as: 'kegiatan' });
Kegiatan.hasMany(Kehadiran, { foreignKey: 'kegiatan_id', as: 'kehadiran' });

Kehadiran.belongsTo(Warga, { foreignKey: 'warga_id', as: 'warga' });
Warga.hasMany(Kehadiran, { foreignKey: 'warga_id', as: 'kehadiran' });

export {
  sequelize,
  Warga,
  Iuran,
  Tagihan,
  Pembayaran,
  Kas,
  Kegiatan,
  Kehadiran,
};
