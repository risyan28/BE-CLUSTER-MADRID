import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Kehadiran extends Model {
  declare id: number;
  declare kegiatan_id: number;
  declare warga_id: number;
  declare status: 'hadir' | 'tidak_hadir';
}

Kehadiran.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  kegiatan_id: { type: DataTypes.INTEGER, allowNull: false },
  warga_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('hadir', 'tidak_hadir'), defaultValue: 'hadir' },
}, {
  sequelize,
  tableName: 'kehadiran',
  indexes: [{ unique: true, fields: ['kegiatan_id', 'warga_id'] }],
});

export default Kehadiran;
