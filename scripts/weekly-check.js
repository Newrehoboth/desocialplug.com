const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://rufusdufussu:rufusdufussu@cluster0.p5hbynz.mongodb.net/desocialplug";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    // Calculate start of current week (Monday)
    const now = new Date();
    const day = now.getDay();
    const daysToSubtract = day === 0 ? 6 : day - 1;
    const startOfWeek = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
    startOfWeek.setHours(0, 0, 0, 0);

    console.log(`Current Time: ${now.toISOString()}`);
    console.log(`Start of Current Week (Monday): ${startOfWeek.toISOString()}`);

    // Get a sample purchase to see what the date looks like
    const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', new mongoose.Schema({
      userUUID: String,
      quantity: Number,
      purchaseDate: Date,
      status: String
    }));

    const sample = await Purchase.findOne({}).sort({ purchaseDate: -1 }).lean();
    if (sample) {
      console.log(`Latest purchase date in DB: ${sample.purchaseDate ? sample.purchaseDate.toISOString() : 'N/A'}`);
    }

    // Run weekly aggregation
    const weeklyPurchases = await Purchase.aggregate([
      {
        $match: {
          purchaseDate: { $gte: startOfWeek },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: "$userUUID",
          purchasedAccounts: { $sum: "$quantity" }
        }
      },
      {
        $sort: { purchasedAccounts: -1 }
      },
      {
        $lookup: {
          from: "users",
          let: { userIdStr: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $toString: "$_id" }, "$$userIdStr"] },
                    { $eq: ["$status", "active"] }
                  ]
                }
              }
            },
            { $project: { username: 1 } }
          ],
          as: "userInfo"
        }
      },
      {
        $unwind: "$userInfo"
      },
      {
        $project: {
          userId: "$_id",
          username: "$userInfo.username",
          purchasedAccounts: 1
        }
      }
    ]);

    console.log(`Found ${weeklyPurchases.length} users with purchases this week:`);
    weeklyPurchases.forEach((p, idx) => {
      console.log(`${idx + 1}. User: ${p.username}, Purchased This Week: ${p.purchasedAccounts}`);
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
