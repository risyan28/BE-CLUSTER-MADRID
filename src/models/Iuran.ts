import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Iuran extends Model {
  declare id: number;
  declare nama: string;
  declare nominal: number;
  declare nominal_dihuni: number | null;
  declare nominal_belum_dihuni: number | null;
  declare periode: 'bulanan' | 'tahunan' | 'sekali';
  declare aktif: boolean;
  declare keterangan: string;
}

Iuran.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama: { type: DataTypes.STRING(150), allowNull: false },
  nominal: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  nominal_dihuni: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
  nominal_belum_dihuni: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
  periode: { type: DataTypes.ENUM('bulanan', 'tahunan', 'sekali'), defaultValue: 'bulanan' },
  aktif: { type: DataTypes.BOOLEAN, defaultValue: true },
  keterangan: { type: DataTypes.TEXT },
}, {
  sequelize,
  tableName: 'iuran',
});

export default Iuran;
