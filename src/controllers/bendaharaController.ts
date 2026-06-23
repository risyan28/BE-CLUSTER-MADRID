import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

export const getInfo = async (_req: AuthRequest, res: Response) => {
  const bankName = process.env.BANK_NAME || 'BANK BCA';
  const bankAccount = process.env.BANK_ACCOUNT || '1234567890';
  const bankHolder = process.env.BANK_HOLDER || 'Bendahara';

  const uploadsDir = path.join(__dirname, '../../uploads');
  let qrisUrl = null;
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir).filter(f => f.startsWith('qris_'));
    if (files.length > 0) {
      const latest = files.sort().reverse()[0];
      qrisUrl = `/uploads/${latest}`;
    }
  }

  res.json({
    bank: { name: bankName, account: bankAccount, holder: bankHolder },
    qris: qrisUrl ? { url: qrisUrl } : null,
  });
};
