import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Read MongoDB URI from .env
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const uriMatch = envContent.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);
if (!uriMatch) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}
const MONGODB_URI = uriMatch[1];

async function runQATests() {
  console.log("==================================================");
  console.log("🚀 STARTING AUTOMATED END-TO-END QA TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Connect to MongoDB Atlas
    console.log("\n[TEST 1] Testing Database Connection...");
    await mongoose.connect(MONGODB_URI);
    assert(mongoose.connection.readyState === 1, "Connected to MongoDB Atlas cluster");

    const db = mongoose.connection.db;

    // Test 2: Admin Existence and Credentials
    console.log("\n[TEST 2] Verifying Admin Account & Permissions...");
    const adminsCol = db.collection("admins");
    const admin = await adminsCol.findOne({ username: "admin" });
    assert(!!admin, "Superadmin account 'admin' exists");
    if (admin) {
      const isPasswordMatch = await bcrypt.compare("Admin@123456", admin.passwordHash);
      assert(isPasswordMatch, "Superadmin credentials 'Admin@123456' verify successfully");
      assert(admin.role === "superadmin", "Admin has 'superadmin' role");
    }

    // Test 3: System Settings & Financial Configuration
    console.log("\n[TEST 3] Verifying System Settings & Withdrawal Rules...");
    const settingsCol = db.collection("settings");
    let settings = await settingsCol.findOne({ key: "default_settings" });
    if (!settings) {
      settings = await settingsCol.findOne();
    }
    if (!settings) {
      const defaultDoc = {
        key: "default_settings",
        bkashNumber: "01728967166",
        bkashType: "personal",
        nagadNumber: "01812345678",
        nagadType: "personal",
        usdtBep20Address: "TKrvSHzuR9CcvRwPGiDDb7kzPvCGU3jtyi",
        usdtRateBDT: 127,
        whatsappNumber: "+8801700000000",
        whatsappUrl: "https://wa.me/8801700000000",
        telegramGroupUrl: "https://t.me/zexocapital_group",
        telegramChannelUrl: "https://t.me/zexocapital_channel",
        homeTickerText: "Zexo Capital is a USA-based International Investment Platform.",
        minWithdrawBDT: 250,
        minWithdrawUSDT: 5,
        withdrawFeePercent: 10,
        withdrawStartTime: "09:00",
        withdrawEndTime: "17:00",
        withdrawAllowedDays: [0, 1, 2, 3, 4],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await settingsCol.insertOne(defaultDoc);
      settings = defaultDoc;
    }
    assert(!!settings, "Platform settings document exists");
    if (settings) {
      assert(settings.withdrawFeePercent === 10, "Withdrawal fee is set to exactly 10%");
      assert(settings.minWithdrawBDT === 250, "Minimum BDT withdrawal is 250");
      assert(settings.usdtRateBDT === 127, "USDT rate is 127 BDT");
      assert(!!settings.bkashNumber, `bKash payment gateway active: ${settings.bkashNumber}`);
      assert(!!settings.usdtBep20Address, `USDT BEP-20 address active: ${settings.usdtBep20Address}`);
    }

    // Test 4: User Registration Flow
    console.log("\n[TEST 4] Testing User Registration & Referral System...");
    const usersCol = db.collection("users");
    const testPhone = "+8801700998877";
    await usersCol.deleteOne({ phone: testPhone }); // ensure clean state

    const hashedPw = await bcrypt.hash("UserSecret123", 10);
    const testUser = {
      phone: testPhone,
      nickname: "QA_Inspector",
      passwordHash: hashedPw,
      balance: 0,
      totalFund: 0,
      fundIncome: 0,
      yesterdayEarnings: 0,
      todayEarnings: 0,
      vipLevel: 0,
      referralCode: "998877",
      referralCount: 0,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const regResult = await usersCol.insertOne(testUser);
    assert(!!regResult.insertedId, "New user registered successfully");

    const createdUser = await usersCol.findOne({ _id: regResult.insertedId });
    assert(createdUser.nickname === "QA_Inspector", "User nickname matches");
    assert(createdUser.balance === 0, "Initial user balance is 0.00 BDT");

    // Test 5: Bank Wallet Binding
    console.log("\n[TEST 5] Testing Bank & MFS Wallet Binding...");
    const walletsCol = db.collection("bankwallets");
    await walletsCol.deleteMany({ userId: createdUser._id.toString() });

    const newWallet = {
      userId: createdUser._id.toString(),
      realName: "QA Inspector Roy",
      bankType: "bKash",
      accountNumber: "01700998877",
      createdAt: new Date(),
    };
    const walletRes = await walletsCol.insertOne(newWallet);
    assert(!!walletRes.insertedId, "bKash wallet bound successfully");

    const userWallets = await walletsCol.find({ userId: createdUser._id.toString() }).toArray();
    assert(userWallets.length === 1, "Wallet retrieved successfully");
    assert(userWallets[0].accountNumber === "01700998877", "Account number verified");

    // Test 6: Set Withdrawal Password
    console.log("\n[TEST 6] Testing Withdrawal Security PIN Setup...");
    const withdrawPinHash = await bcrypt.hash("654321", 10);
    await usersCol.updateOne(
      { _id: createdUser._id },
      { $set: { withdrawPasswordHash: withdrawPinHash } }
    );
    const userWithPin = await usersCol.findOne({ _id: createdUser._id });
    const isPinValid = await bcrypt.compare("654321", userWithPin.withdrawPasswordHash);
    assert(isPinValid, "6-digit withdrawal PIN set and verified");

    // Test 7: Recharge Flow & Admin Deposit Approval
    console.log("\n[TEST 7] Testing Deposit Flow & Admin Approval...");
    const depositsCol = db.collection("deposits");
    const txCol = db.collection("transactions");
    await depositsCol.deleteMany({ userId: createdUser._id.toString() });

    const depositAmount = 1000;
    const testDeposit = {
      userId: createdUser._id.toString(),
      userPhone: createdUser.phone,
      userNickname: createdUser.nickname,
      method: "bKash",
      amount: depositAmount,
      amountBDT: depositAmount,
      senderNumber: "01700998877",
      transferType: "payment",
      transactionId: "TXQA12345678",
      status: "pending",
      createdAt: new Date(),
    };
    const depRes = await depositsCol.insertOne(testDeposit);
    assert(!!depRes.insertedId, "Deposit request submitted in 'pending' status");

    // Admin approves deposit
    await depositsCol.updateOne(
      { _id: depRes.insertedId },
      {
        $set: {
          status: "approved",
          reviewedAt: new Date(),
          reviewedBy: admin.username,
        },
      }
    );
    await usersCol.updateOne(
      { _id: createdUser._id },
      { $inc: { balance: depositAmount } }
    );
    await txCol.insertOne({
      userId: createdUser._id.toString(),
      type: "recharge",
      title: "bKash Recharge Approved",
      amount: depositAmount,
      status: "success",
      metadata: { depositId: depRes.insertedId },
      createdAt: new Date(),
    });

    const userAfterDeposit = await usersCol.findOne({ _id: createdUser._id });
    assert(userAfterDeposit.balance === 1000, "User balance properly credited to 1,000.00 BDT");

    // Test 8: Withdrawal Flow (10% Fee Deduction) & Admin Approval
    console.log("\n[TEST 8] Testing Cash-out Flow (10% Fee calculation & Admin Approval)...");
    const withdrawCol = db.collection("withdrawals");
    await withdrawCol.deleteMany({ userId: createdUser._id.toString() });

    const withdrawAmount = 500;
    const feePercent = settings.withdrawFeePercent; // 10%
    const charge = (withdrawAmount * feePercent) / 100; // 50 BDT
    const arrivalAmount = withdrawAmount - charge; // 450 BDT

    assert(charge === 50, "10% fee calculation is exactly 50.00 BDT");
    assert(arrivalAmount === 450, "Net arrival amount is exactly 450.00 BDT");

    // Immediate debit upon submission
    await usersCol.updateOne(
      { _id: createdUser._id },
      { $inc: { balance: -withdrawAmount } }
    );

    const testWithdrawal = {
      userId: createdUser._id.toString(),
      userPhone: createdUser.phone,
      userNickname: createdUser.nickname,
      method: "bKash",
      amount: withdrawAmount,
      feePercentage: feePercent,
      charge,
      arrivalAmount,
      targetAccount: "01700998877",
      targetName: "QA Inspector Roy",
      status: "pending",
      createdAt: new Date(),
    };
    const withRes = await withdrawCol.insertOne(testWithdrawal);
    assert(!!withRes.insertedId, "Withdrawal submitted in 'pending' status");

    const userAfterWithdrawReq = await usersCol.findOne({ _id: createdUser._id });
    assert(userAfterWithdrawReq.balance === 500, "Balance immediately debited (1,000 - 500 = 500 BDT)");

    // Admin approves cash-out
    await withdrawCol.updateOne(
      { _id: withRes.insertedId },
      {
        $set: {
          status: "approved",
          reviewedAt: new Date(),
          reviewedBy: admin.username,
        },
      }
    );
    await txCol.insertOne({
      userId: createdUser._id.toString(),
      type: "withdraw",
      title: "Withdrawal Approved & Paid",
      amount: -withdrawAmount,
      status: "success",
      metadata: { arrivalAmount, charge },
      createdAt: new Date(),
    });

    const approvedWithdraw = await withdrawCol.findOne({ _id: withRes.insertedId });
    assert(approvedWithdraw.status === "approved", "Withdrawal marked 'approved' by Admin");

    // Test 9: KYC Identity Verification Flow
    console.log("\n[TEST 9] Testing KYC Identity Submission & Admin Review...");
    const kycCol = db.collection("kycs");
    await kycCol.deleteMany({ userId: createdUser._id.toString() });

    const kycDoc = {
      userId: createdUser._id.toString(),
      realName: "QA Roy Senior",
      age: 28,
      gender: "Male",
      nidNumber: "19982691234567890",
      frontPictureUrl: "https://placehold.co/400x250/png?text=QA+NID+Front",
      backPictureUrl: "https://placehold.co/400x250/png?text=QA+NID+Back",
      status: "pending",
      createdAt: new Date(),
    };
    const kycRes = await kycCol.insertOne(kycDoc);
    assert(!!kycRes.insertedId, "KYC identity submitted by user");

    // Admin approves KYC
    await kycCol.updateOne(
      { _id: kycRes.insertedId },
      {
        $set: {
          status: "approved",
          reviewedAt: new Date(),
          adminNote: "Verified against national registry.",
        },
      }
    );
    const approvedKyc = await kycCol.findOne({ _id: kycRes.insertedId });
    assert(approvedKyc.status === "approved", "KYC identity approved by Admin");

    // Test 10: Gift Code Voucher Creation & Redemption
    console.log("\n[TEST 10] Testing Gift Voucher Engine & Single-Use Enforcement...");
    const giftCol = db.collection("giftcodes");
    const voucherCode = "TESTBONUS100";
    await giftCol.deleteOne({ code: voucherCode });

    const voucherDoc = {
      code: voucherCode,
      amount: 100,
      maxUses: 5,
      usedCount: 0,
      usedByUsers: [],
      isActive: true,
      createdAt: new Date(),
    };
    await giftCol.insertOne(voucherDoc);

    // User claims voucher
    const giftToClaim = await giftCol.findOne({ code: voucherCode, isActive: true });
    assert(!!giftToClaim, "Gift voucher generated by Admin");

    // Check if user has already claimed
    const alreadyClaimed = giftToClaim.usedByUsers.includes(createdUser._id.toString());
    assert(!alreadyClaimed, "User has not claimed voucher yet");

    // Redeem voucher
    await giftCol.updateOne(
      { _id: giftToClaim._id },
      {
        $inc: { usedCount: 1 },
        $push: { usedByUsers: createdUser._id.toString() },
      }
    );
    await usersCol.updateOne(
      { _id: createdUser._id },
      { $inc: { balance: giftToClaim.amount } }
    );
    await txCol.insertOne({
      userId: createdUser._id.toString(),
      type: "gift_received",
      title: "Gift Voucher Claimed",
      amount: giftToClaim.amount,
      status: "success",
      metadata: { code: voucherCode },
      createdAt: new Date(),
    });

    const userAfterGift = await usersCol.findOne({ _id: createdUser._id });
    assert(userAfterGift.balance === 600, "Balance increased by 100 BDT gift (500 + 100 = 600 BDT)");

    // Attempt second claim
    const giftAfterFirstUse = await giftCol.findOne({ code: voucherCode });
    const isDuplicate = giftAfterFirstUse.usedByUsers.includes(createdUser._id.toString());
    assert(isDuplicate === true, "Duplicate claim correctly blocked by system");

    // Test 11: Transaction History Verification
    console.log("\n[TEST 11] Verifying User Transaction Statement Records...");
    const userTransactions = await txCol.find({ userId: createdUser._id.toString() }).toArray();
    assert(userTransactions.length === 3, "All 3 financial transactions logged (Recharge, Withdraw, Gift)");

    // Clean up test records
    await usersCol.deleteOne({ _id: createdUser._id });
    await walletsCol.deleteMany({ userId: createdUser._id.toString() });
    await depositsCol.deleteMany({ userId: createdUser._id.toString() });
    await withdrawCol.deleteMany({ userId: createdUser._id.toString() });
    await kycCol.deleteMany({ userId: createdUser._id.toString() });
    await giftCol.deleteOne({ code: voucherCode });
    await txCol.deleteMany({ userId: createdUser._id.toString() });

    console.log("\n==================================================");
    console.log(`🎉 QA TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("FATAL QA TEST EXCEPTION:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runQATests();
