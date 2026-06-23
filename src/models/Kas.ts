import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Kas extends Model {
  declare id: number;
  declare tipe: 'masuk' | 'keluar';
  declare kategori: string;
  declare nominal: number;
  declare keterangan: string | null;
  declare tanggal: string;
  declare pembayaran_id: number | null;
  declare bukti_url: string | null;
}

Kas.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipe: { type: DataTypes.ENUM('masuk', 'keluar'), allowNull: false },
  kategori: { type: DataTypes.STRING(100), allowNull: false },
  nominal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  keterangan: { type: DataTypes.TEXT },
  tanggal: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  pembayaran_id: { type: DataTypes.INTEGER, allowNull: true },
  bukti_url: { type: DataTypes.STRING(255) },
}, {
  sequelize,
  tableName: 'kas',
});

export default Kas;
