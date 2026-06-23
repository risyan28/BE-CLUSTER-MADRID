import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const isRailwayMySQL = process.env.MYSQLHOST || process.env.MYSQL_DATABASE;

const sequelize = process.env.DATABASE_URL && !isRailwayMySQL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      define: { timestamps: true, underscored: true },
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'admin_lingkungan',
      process.env.DB_USER || process.env.MYSQL_USER || process.env.MYSQLUSER || 'root',
      process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '',
      {
        host: process.env.DB_HOST || process.env.MYSQL_HOST || process.env.MYSQLHOST || 'localhost',
        port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || process.env.MYSQLPORT || '3306'),
        dialect: 'mysql',
        logging: false,
        define: { timestamps: true, underscored: true },
      }
    );

export default sequelize;
