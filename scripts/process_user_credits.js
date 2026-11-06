const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://rufusdufussu:rufusdufussu@cluster0.p5hbynz.mongodb.net/desocialplug';

async function processCredits() {
  await mongoose.connect(MONGODB_URI);

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const PocketfiVirtualAccount = mongoose.model('PocketfiVirtualAccount', new mongoose.Schema({}, { strict: false }));
  const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));

  console.log('=== CREDIT EMMANUEL (jacobemmanuel2080@gmail.com) ===\n');

  const emmanuelEmail = 'jacobemmanuel2080@gmail.com';
  const emmanuel = await User.findOne({ email: new RegExp('^' + emmanuelEmail.replace('.', '\\.') + '$', 'i') });

  if (emmanuel) {
    const missingAmount = 2020; // ₦1,800 + ₦100 + ₦120
    const oldBal = emmanuel.walletBalance || 0;
    emmanuel.walletBalance = Number((oldBal + missingAmount).toFixed(2));
    await emmanuel.save();

    const ref = `MANUAL_CREDIT_POCKETFI_${Date.now()}`;
    await Transaction.create({
      userUUID: emmanuel._id.toString(),
      type: 'deposit',
      amount: missingAmount,
      status: 'successful',
      reference: ref,
      description: `Funded wallet via PocketFi (Missing deposits: ₦1,800 + ₦100 + ₦120)`
    });

    await Notification.create({
      userUUID: emmanuel._id.toString(),
      type: 'payment',
      title: 'Wallet Funded',
      message: `Successfully added ₦${missingAmount.toLocaleString()} to your account for missing deposits`,
      read: false,
      source: 'notifications'
    });

    console.log(`✅ Credited ₦${missingAmount} to Emmanuel (${emmanuel.email}).`);
    console.log(`   Old balance: ₦${oldBal} → New balance: ₦${emmanuel.walletBalance}`);
  } else {
    console.error('❌ Emmanuel user not found!');
  }

  console.log('\n=== LOOKUP AMAGBOR LUCKY (amagborlucky1358@gmail.com) ===\n');

  const luckyEmail = 'amagborlucky1358@gmail.com';
  const lucky = await User.findOne({ email: new RegExp('^' + luckyEmail.replace('.', '\\.') + '$', 'i') }).lean();

  if (lucky) {
    console.log('Lucky User Record:', {
      id: lucky._id.toString(),
      username: lucky.username,
      email: lucky.email,
      walletBalance: lucky.walletBalance,
      createdAt: lucky.createdAt
    });

    const vas = await PocketfiVirtualAccount.find({ userId: lucky._id.toString() }).lean();
    console.log('Virtual Accounts:', vas.map(v => ({ bank: v.bankName, number: v.accountNumber, name: v.accountName })));

    const txs = await Transaction.find({ userUUID: lucky._id.toString() }).lean();
    console.log('Transactions count:', txs.length);
    txs.forEach(t => console.log(`  [${t.type}] ₦${t.amount} (${t.status}) Ref: ${t.reference} - ${t.createdAt}`));
  } else {
    console.log('Searching for any user matching amagbor or lucky...');
    const users = await User.find({
      $or: [
        { email: /amagbor/i },
        { email: /lucky/i },
        { username: /amagbor/i },
        { username: /lucky/i }
      ]
    }).lean();
    console.log('Found matching users:', users.map(u => ({ id: u._id, username: u.username, email: u.email, walletBalance: u.walletBalance })));
  }

  await mongoose.disconnect();
}

processCredits().catch(console.error);
