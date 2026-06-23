import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      define: { timestamps: true, underscored: true },
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || process.env.MYSQL_DATABASE || 'admin_lingkungan',
      process.env.DB_USER || process.env.MYSQL_USER || 'root',
      process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
      {
        host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306'),
        dialect: 'mysql',
        logging: false,
        define: { timestamps: true, underscored: true },
      }
    );

export default sequelize;
