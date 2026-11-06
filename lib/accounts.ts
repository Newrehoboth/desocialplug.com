import connectDB from './mongodb';
import Account from '@/models/Account';

export interface AccountType {
  id: string;
  olaz: string;
  createdAt: Date;
  files: string[];
  followers: number;
  logs: number;
  mailIncluded: boolean;
  platform: string;
  price: number;
  status: string;
}

export async function getAccounts(): Promise<AccountType[]> {
  await connectDB();
  
  const accounts = await Account.find({ status: { $in: ['Available', 'Sold Out'] } }).sort({ createdAt: -1 }).lean();
  
  return accounts.map((doc: any) => ({
    id: doc._id.toString(),
    olaz: doc.olaz,
    createdAt: doc.createdAt,
    files: doc.files || [],
    followers: doc.followers || 0,
    logs: doc.logs || 0,
    mailIncluded: doc.mailIncluded || false,
    platform: doc.platform,
    price: doc.price,
    status: doc.status,
  }));
}
