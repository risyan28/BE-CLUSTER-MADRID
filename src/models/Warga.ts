import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

class Warga extends Model {
  declare id: number;
  declare nama: string;
  declare email: string | null;
  declare password_hash: string;
  declare role: 'admin' | 'warga';
  declare blok: string | null;
  declare nomor: string | null;
  declare no_hp: string | null;
  declare status: 'Dihuni' | 'Belum dihuni' | 'Dihuni/Kontrak' | null;
  declare rt: string | null;
  declare rw: string | null;
  declare alamat: string | null;
  declare aktif: boolean;

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }
}

Warga.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(100) },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'warga'), defaultValue: 'warga' },
  blok: { type: DataTypes.STRING(10) },
  nomor: { type: DataTypes.STRING(10) },
  no_hp: { type: DataTypes.STRING(15) },
  status: { type: DataTypes.ENUM('Dihuni', 'Belum dihuni', 'Dihuni/Kontrak') },
  rt: { type: DataTypes.STRING(5) },
  rw: { type: DataTypes.STRING(5) },
  alamat: { type: DataTypes.STRING(255) },
  aktif: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  tableName: 'warga',
});

export default Warga;
