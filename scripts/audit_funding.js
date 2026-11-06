const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://rufusdufussu:rufusdufussu@cluster0.p5hbynz.mongodb.net/desocialplug';

async function audit() {
  await mongoose.connect(MONGODB_URI);

  const startOfToday = new Date('2026-10-08T00:00:00.000Z');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const PocketfiVirtualAccount = mongoose.model('PocketfiVirtualAccount', new mongoose.Schema({}, { strict: false }));
  const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));

  console.log('=== AUDIT REPORT FOR OCT 8, 2026 ===\n');

  const newUsers = await User.find({ createdAt: { $gte: startOfToday } }).lean();
  console.log('Total New Users Registered Today:', newUsers.length);
  for (const u of newUsers) {
    const vas = await PocketfiVirtualAccount.find({ userId: u._id.toString() }).lean();
    const txs = await Transaction.find({ userUUID: u._id.toString() }).lean();
    console.log(`\nUser: ${u.username} (${u.email}) [ID: ${u._id}]`);
    console.log(`  Wallet Balance: ₦${u.walletBalance}`);
    console.log(`  Virtual Accounts: ${vas.length}`);
    vas.forEach(v => console.log(`    - VA ${v.bankName} ${v.accountNumber} (${v.accountName})`));
    console.log(`  Transactions: ${txs.length}`);
    txs.forEach(t => console.log(`    - [${t.type}] ₦${t.amount} (${t.status}) Ref: ${t.reference}`));
  }

  console.log('\n=== ALL USERS WITH VIRTUAL ACCOUNTS CREATED TODAY ===\n');
  const vasToday = await PocketfiVirtualAccount.find({ createdAt: { $gte: startOfToday } }).lean();
  for (const va of vasToday) {
    const u = await User.findById(va.userId).lean();
    const txs = await Transaction.find({ userUUID: va.userId }).lean();
    console.log(`User: ${u ? u.username : 'Unknown'} (${u ? u.email : 'N/A'})`);
    console.log(`  VA: ${va.bankName} ${va.accountNumber} (${va.accountName})`);
    console.log(`  Balance: ₦${u ? u.walletBalance : 0}`);
    console.log(`  Deposit Txs:`, txs.filter(t => t.type === 'deposit').map(t => `${t.amount} (Ref: ${t.reference})`));
  }

  await mongoose.disconnect();
}

audit().catch(console.error);
