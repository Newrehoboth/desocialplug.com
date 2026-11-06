const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://rufusdufussu:rufusdufussu@cluster0.p5hbynz.mongodb.net/desocialplug";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    // Define simple schema
    const UserSchema = new mongoose.Schema({
      username: String,
      purchasedAccounts: Number,
      status: String,
      role: String,
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users in total.`);
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. Username: ${u.username}, Purchased: ${u.purchasedAccounts}, Status: ${u.status}, Role: ${u.role}`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
