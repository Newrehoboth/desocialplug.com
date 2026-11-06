const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://rufusdufussu:rufusdufussu@cluster0.p5hbynz.mongodb.net/desocialplug';

async function creditLucky() {
  await mongoose.connect(MONGODB_URI);

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Transaction = mongoose.model('Transaction', new mongoose.Schema({}, { strict: false }));
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));

  const email = 'amagborlucky1358@gmail.com';
  const user = await User.findOne({ email: new RegExp('^' + email.replace('.', '\\.') + '$', 'i') });

  if (user) {
    const depositAmount = 600;
    const oldBalance = user.walletBalance || 0;
    user.walletBalance = Number((oldBalance + depositAmount).toFixed(2));
    await user.save();

    const ref = 'PFI|100004261008115032173639780325';
    await Transaction.create({
      userUUID: user._id.toString(),
      type: 'deposit',
      amount: depositAmount,
      status: 'successful',
      reference: ref,
      description: `Funded wallet via PocketFi (Ref: ${ref})`
    });

    await Notification.create({
      userUUID: user._id.toString(),
      type: 'payment',
      title: 'Wallet Funded',
      message: `Successfully added ₦${depositAmount.toLocaleString()} to your account`,
      read: false,
      source: 'notifications'
    });

    console.log(`✅ Successfully credited ₦${depositAmount} to ${user.username} (${user.email}).`);
    console.log(`   Old balance: ₦${oldBalance} → New balance: ₦${user.walletBalance}`);
  } else {
    console.error('❌ User amagborlucky1358@gmail.com not found!');
  }

  await mongoose.disconnect();
}

creditLucky().catch(console.error);
