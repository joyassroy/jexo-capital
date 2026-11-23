# jexo-capital

> **Zexo Capital** — A high-performance, mobile-first investment & financial rewards platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and MongoDB Atlas.

---

## 🌟 Architecture & Features

The project is structured with two completely isolated panels having dedicated URL spaces, layouts, and cryptographic JWT session tokens:

### 📱 1. User Panel (`/`)
- **Visual Design**: Mobile-first native application experience matching sky-blue fluid waves, modern glassy cards, and a metropolitan skyline footer.
- **Nine-Grid Dashboard**:
  - 📥 **App Download**: Direct APK download portal.
  - 📜 **Records**: Filterable financial statement (Recharge, Withdraw, Return, Gift, Bonus).
  - 🎁 **Gift Receive**: Instant voucher code redemption.
  - 🔐 **Password Management**: Login password and 6-digit withdrawal security PIN.
  - 💳 **My Bank**: Binding of MFS accounts (bKash, Nagad) and USDT BEP-20 addresses.
  - 👥 **My Team / Share**: 3-tier affiliate referral tree with instant copy referral link & code.
  - 💰 **Deposit**: Multi-step local MFS (Send Money / Payment) and USDT BEP-20 with QR generation.
  - 💸 **Withdraw**: Instant cash-out with automatic 10% fee calculation and working-hours enforcement.
  - 🚪 **Logout**: Secure session termination.
- **Bottom Navigation**: Quick switching between Homepage, VIP catalog, Share center, and Personal Profile.
- **Support Modal**: Floating live customer service popup with direct WhatsApp, Telegram Group, and Telegram Channel links.
- **KYC Identity Verification**: NID submission with front & back card previews.

---

### 🛡️ 2. Admin Management Panel (`/admin/*`)
- **Isolated Authentication**: Dedicated admin login credentials with HTTP-only encrypted JWT session cookies.
- **Operations Dashboard**: Real-time KPI statistics (Total Users, Today's Deposits, Today's Withdrawals, Platform Net Flow).
- **Deposit Approvals (`/admin/deposits`)**: Real-time queue to verify 10-digit TxIDs and credit user accounts in 1 click.
- **Withdrawal Management (`/admin/withdrawals`)**: Review cash-out requests with 10% fee breakdowns, mark as paid or reject with instant user balance refund.
- **KYC Verification Review (`/admin/kyc`)**: Inspect uploaded NID photos and user identity details with 1-click Approve / Reject.
- **User Management (`/admin/users`)**: Search users by phone or nickname, view balances, manually credit/debit funds, and toggle active/blocked status.
- **Gift Voucher Engine (`/admin/gift-codes`)**: Generate promotional voucher codes with custom balance amounts and usage limits.
- **Platform Settings (`/admin/settings`)**: Configure gateway numbers (bKash, Nagad), USDT wallet address, USDT-to-BDT exchange rates, minimum withdrawal thresholds, and withdrawal hours.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Security**: BcryptJS password hashing, JSON Web Tokens (JWT), Edge Middleware route protection.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/joyassroy/jexo-capital.git
cd jexo-capital
npm install
```

### 2. Environment Setup
Create `.env.local` or `.env` in the root directory:
```env
MONGODB_URI="mongodb+srv://<db_user>:<db_pass>@cluster0.umszehx.mongodb.net/zexo_capital?retryWrites=true&w=majority"
USER_JWT_SECRET="your_secure_user_jwt_secret"
ADMIN_JWT_SECRET="your_secure_admin_jwt_secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` for the User Panel and `http://localhost:3000/admin/login` for the Admin Panel.

### 4. Admin Credentials (Default Seed)
- **Username**: `admin`
- **Password**: `Admin@123456`

### 5. Run Automated QA Tests
```bash
node scripts/qa_test.mjs
```

### 6. Production Build
```bash
npm run build
npm run start
```

