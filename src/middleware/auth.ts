import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Warga from '../models/Warga';

export interface AuthRequest extends Request {
  user?: Warga;
}

const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number };
    const user = await Warga.findByPk(decoded.id);
    if (!user || !user.aktif) {
      return res.status(401).json({ message: 'User tidak valid' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

export default authenticate;
