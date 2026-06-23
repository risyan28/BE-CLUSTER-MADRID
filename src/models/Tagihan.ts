import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Tagihan extends Model {
  declare id: number;
  declare iuran_id: number;
  declare warga_id: number;
  declare bulan: number;
  declare tahun: number;
  declare nominal: number;
  declare status: 'belum_lunas' | 'lunas';
}

Tagihan.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  iuran_id: { type: DataTypes.INTEGER, allowNull: false },
  warga_id: { type: DataTypes.INTEGER, allowNull: false },
  bulan: { type: DataTypes.INTEGER, allowNull: false },
  tahun: { type: DataTypes.INTEGER, allowNull: false },
  nominal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  status: { type: DataTypes.ENUM('belum_lunas', 'lunas'), defaultValue: 'belum_lunas' },
}, {
  sequelize,
  tableName: 'tagihan',
  indexes: [{ unique: true, fields: ['iuran_id', 'warga_id', 'bulan', 'tahun'] }],
});

export default Tagihan;
