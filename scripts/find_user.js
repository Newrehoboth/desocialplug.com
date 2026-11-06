const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://rufusdufussu:rufusdufussu@cluster0.p5hbynz.mongodb.net/desocialplug';

async function findUser() {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const PocketfiVirtualAccount = mongoose.model('PocketfiVirtualAccount', new mongoose.Schema({}, { strict: false }));
  const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));

  const email = 'jacobemmanuel2080@gmail.com';
  const user = await User.findOne({ email: new RegExp('^' + email.replace('.', '\\.') + '$', 'i') }).lean();

  if (user) {
    console.log('User found:', {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      walletBalance: user.walletBalance,
      createdAt: user.createdAt
    });

    const vas = await PocketfiVirtualAccount.find({ userId: user._id.toString() }).lean();
    console.log('Virtual accounts:', vas.map(v => ({ bank: v.bankName, number: v.accountNumber, name: v.accountName })));

    const txs = await Transaction.find({ userUUID: user._id.toString() }).lean();
    console.log('Transactions count:', txs.length);
    txs.forEach(t => console.log(`  [${t.type}] ₦${t.amount} (${t.status}) Ref: ${t.reference} - ${t.createdAt}`));
  } else {
    console.log('Searching by regex for jacobemmanuel...');
    const users = await User.find({ email: /jacobemmanuel/i }).lean();
    console.log('Matching users:', users.map(u => ({ id: u._id, username: u.username, email: u.email, walletBalance: u.walletBalance })));
  }

  await mongoose.disconnect();
}

findUser().catch(console.error);
