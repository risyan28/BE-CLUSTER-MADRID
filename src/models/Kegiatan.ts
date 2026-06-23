import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Kegiatan extends Model {
  declare id: number;
  declare judul: string;
  declare tanggal: string;
  declare jam: string | null;
  declare lokasi: string | null;
  declare deskripsi: string | null;
  declare status: 'akan_datang' | 'selesai' | 'dibatalkan';
  declare created_by: number;
}

Kegiatan.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  judul: { type: DataTypes.STRING(200), allowNull: false },
  tanggal: { type: DataTypes.DATEONLY, allowNull: false },
  jam: { type: DataTypes.TIME },
  lokasi: { type: DataTypes.STRING(200) },
  deskripsi: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('akan_datang', 'selesai', 'dibatalkan'), defaultValue: 'akan_datang' },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
}, {
  sequelize,
  tableName: 'kegiatan',
});

export default Kegiatan;
