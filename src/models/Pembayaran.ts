import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Pembayaran extends Model {
  declare id: number;
  declare tagihan_id: number;
  declare metode: 'tunai' | 'transfer' | 'qris';
  declare nominal: number;
  declare bukti_url: string | null;
  declare status: 'menunggu' | 'lunas' | 'ditolak';
  declare verified_by: number | null;
  declare keterangan: string | null;
  declare tgl_bayar: string;
}

Pembayaran.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tagihan_id: { type: DataTypes.INTEGER, allowNull: false },
  metode: { type: DataTypes.ENUM('tunai', 'transfer', 'qris'), allowNull: false },
  nominal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  bukti_url: { type: DataTypes.STRING(255) },
  status: { type: DataTypes.ENUM('menunggu', 'lunas', 'ditolak'), defaultValue: 'menunggu' },
  verified_by: { type: DataTypes.INTEGER, allowNull: true },
  keterangan: { type: DataTypes.TEXT },
  tgl_bayar: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  tableName: 'pembayaran',
});

export default Pembayaran;
