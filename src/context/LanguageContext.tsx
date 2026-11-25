"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "bn" | "ar" | "zh";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "bn", name: "Bangla", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "Chinese", nativeName: "简体中文", flag: "🇨🇳" },
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top Bar & Common
    language: "Language",
    select_language: "Select Language",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    copy: "Copy",
    copied: "Copied!",
    submit: "Submit",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    back: "Back",
    details: "Details",
    all: "All",
    status: "Status",
    time: "Time",
    amount: "Amount",
    action: "Action",

    // Banner & Announcements
    live_summit: "LIVE SUMMIT",
    usa_official: "USA Official",
    conf_title: "Zexo Capital International Conference",
    conf_subtitle: "Invest • Grow • Prosper | Keynote Session",
    delegates_tag: "500+ DELEGATES",
    global_forum: "Global Forum",
    delegates_title: "Global Investor Delegation Summit",
    ticker_default: "Zexo Capital is a USA-based International Investment Platform",

    // Balance Card
    balance: "Balance",
    total_fund: "Total Fund",
    fund_income: "Fund Income",
    usdt: "USDT",

    // Action Cards
    app_download: "App Download",
    records: "Records",
    gift_receive: "Gift Receive",
    password: "Password",
    my_bank: "My Bank",
    my_team: "My Team",
    deposit: "Deposit",
    withdraw: "Withdraw",
    logout: "Logout",
    customer_service: "Customer Service",
    intro_zexo: "Introduction to Zexo Capital",
    confirm_logout: "Are you sure you want to log out?",

    // Bottom Navigation
    nav_home: "Homepage",
    nav_vip: "VIP level",
    nav_order: "Order",
    nav_profile: "Personal Center",

    // VIP Page
    vip_title: "Invest and Share the Earnings",
    vip_privilege: "VIP Privileges",
    vip_my_wallet_balance: "My Wallet Balance",
    vip_daily_profit: "Daily Profit",
    vip_per_order: "Per Order",
    vip_orders_per_day: "Orders / Day",
    daily_income: "Daily Income",
    total_revenue: "Total Revenue",
    valid_days: "Valid Period",
    join_now: "Join Now",
    vip_upgrade_join: "Upgrade / Join Now",
    vip_active_now: "Currently Active",
    current_level: "Current Level",
    vip_confirm_modal_title: "Confirm VIP Activation",
    vip_unlock_rule: "VIP Level Requirement",
    vip_balance_insufficient: "Insufficient balance to upgrade. Please recharge first.",

    // Profile & Records
    my_profile: "My Profile",
    phone_number: "Phone Number",
    invitation_code: "Invitation Code",
    recharge_records: "Recharge Records",
    withdrawal_records: "Withdrawal Records",
    account_details: "Account Details",
    total_assets: "My total assets: (USDT)",
    earnings_yesterday: "Earnings-yesterday",
    accumulated_earnings: "Accumulated earnings",
    today_earnings: "Today's earnings",
    complete_now: "Complete Now",
    notice: "Notice",
    company_info: "Company Info",
    faq: "FAQ",
    team_details: "Team Details",
    invite_friends: "Invite Friends",
    personal_info: "Personal Information",
    change_pwd: "Change Password",
    set_withdraw_pwd: "Set Withdrawal Password",
    support: "Support",
    remove_photo: "Remove Photo",
    upload_photo: "Upload profile picture",

    // Orders / Daily Tasks
    daily_necessities: "Daily Necessities",
    daily_return_rate: "Daily return rate",
    trusted_product: "Trusted Product",
    already_queued: "Already added to the queue",
    ready_to_queue: "Ready to Add to Queue",
    processing_order: "Processing Order in Queue...",
    total_assets_label: "Total assets",
    freeze_funds: "Freeze funds",
    todays_commission: "Today's commission",
    todays_order: "Today's order",
    add_to_queue: "Add to Queue",
    limit_reached: "Daily limit reached (5/5)",
    order_completed: "Order Completed!",
    order_success_desc: "Your daily commission has been successfully added to your balance.",
    earned_profit: "Earned Profit",
    confirm_and_continue: "Confirm & Continue",
    recharge_to_unlock: "Recharge to Unlock Orders",
    min_vip_required: "Minimum VIP-1 required to earn daily order commission.",
    target_vault: "Target Vault",
    order_settling_desc: "Please wait while the transaction settles...",

    // Withdraw Page
    withdraw_title: "Withdraw",
    withdraw_balance_label: "Withdrawable Balance",
    total_balance_label: "Total Balance",
    bank_card: "bKash / Nagad",
    crypto_usdt: "USDT (BEP-20)",
    select_account: "Select Receiving Account",
    no_wallet_bound: "No wallet bound yet. Go to 'My Bank' to bind.",
    withdraw_amount_label: "Withdrawal Amount",
    enter_amount: "Please enter amount",
    withdraw_pwd_label: "Withdrawal Password",
    enter_withdraw_pwd: "Enter 6-digit withdrawal password",
    confirm_withdraw_btn: "Confirm Withdrawal",
    withdraw_rules: "Withdrawal Rules",
    min_withdraw_bank_rule: "Minimum withdrawal for bKash / Nagad is 250 BDT.",
    min_withdraw_usdt_rule: "Minimum withdrawal for USDT is 6 USDT.",
    bonus_lock_rule: "The 500 BDT sign-up bonus cannot be withdrawn directly.",
    weekend_notice_title: "Weekly Settlement Notice",
    weekend_notice_desc: "Withdrawals are unavailable on Friday and Saturday due to weekly financial audits and banking settlement. Withdrawal services will resume on Sunday at 10:00 AM.",
    weekend_badge: "Withdrawal Closed (Friday & Saturday)",
    i_understand: "I Understand",
    back_to_home: "Back to Home",

    // Recharge Page
    recharge_title: "Recharge",
    recharge_amount: "Recharge Amount",
    select_payment_channel: "Select Payment Channel",
    confirm_recharge: "Confirm Recharge",
    transfer_guide: "Transfer Guide",
    min_deposit: "Minimum Deposit",
    exchange_rate: "Exchange Rate",

    // Team Page
    team_title: "My Team",
    team_overview: "Team Overview",
    total_team_members: "Total Team Members",
    total_team_commission: "Team Commission",
    level1: "Level 1",
    level2: "Level 2",
    level3: "Level 3",
    referral_code: "Referral Code",
    copy_link: "Copy Link",
    claim_rewards: "Claim Commission",

    // My Bank Page
    my_bank_title: "My Bank",
    bind_account: "Bind Account",
    account_name: "Account Holder Name",
    account_number: "Account / Phone Number",
    save_changes: "Save Changes",

    // Auth Pages
    login_title: "Welcome to Zexo Capital",
    login_subheading: "Login to continue your investment journey",
    register_title: "Create Account",
    register_subheading: "Join Zexo Capital and grow your wealth",
    phone_placeholder: "Phone number",
    password_placeholder: "Password",
    login_button: "Sign In",
    register_button: "Create Account",
    dont_have_account: "Don't have an account?",
    already_have_account: "Already have an account?",
    sign_up_now: "Sign Up Now",
  },
  bn: {
    // Top Bar & Common
    language: "ভাষা",
    select_language: "ভাষা নির্বাচন করুন",
    close: "বন্ধ করুন",
    cancel: "বাতিল",
    confirm: "নিশ্চিত করুন",
    copy: "কপি",
    copied: "কপি হয়েছে!",
    submit: "জমা দিন",
    loading: "লোড হচ্ছে...",
    success: "সফল",
    error: "ত্রুটি",
    back: "ফিরে যান",
    details: "বিস্তারিত",
    all: "সব",
    status: "স্ট্যাটাস",
    time: "সময়",
    amount: "পরিমাণ",
    action: "অ্যাকশন",

    // Banner & Announcements
    live_summit: "লাইভ সামিট",
    usa_official: "ইউএসএ অফিশিয়াল",
    conf_title: "জেক্সো ক্যাপিটাল আন্তর্জাতিক সম্মেলন",
    conf_subtitle: "বিনিয়োগ • বৃদ্ধি • সমৃদ্ধি | কিনোট সেশন",
    delegates_tag: "৫০০+ প্রতিনিধি",
    global_forum: "গ্লোবাল ফোরাম",
    delegates_title: "গ্লোবাল ইনভেস্টর ডেলিগেশন সামিট",
    ticker_default: "জেক্সো ক্যাপিটাল একটি ইউএসএ-ভিত্তিক আন্তর্জাতিক বিনিয়োগ প্ল্যাটফর্ম",

    // Balance Card
    balance: "ব্যালেন্স",
    total_fund: "মোট তহবিল",
    fund_income: "তহবিল আয়",
    usdt: "USDT",

    // Action Cards
    app_download: "অ্যাপ ডাউনলোড",
    records: "রেকর্ড",
    gift_receive: "উপহার গ্রহণ",
    password: "পাসওয়ার্ড",
    my_bank: "আমার ব্যাংক",
    my_team: "আমার টিম",
    deposit: "ডিপোজিট",
    withdraw: "উইথড্র",
    logout: "লগআউট",
    customer_service: "কাস্টমার সার্ভিস",
    intro_zexo: "জেক্সো ক্যাপিটাল পরিচিতি",
    confirm_logout: "আপনি কি নিশ্চিতভাবে লগআউট করতে চান?",

    // Bottom Navigation
    nav_home: "হোমপেজ",
    nav_vip: "ভিআইপি লেভেল",
    nav_order: "অর্ডার",
    nav_profile: "পার্সোনাল সেন্টার",

    // VIP Page
    vip_title: "বিনিয়োগ করুন ও আয় শেয়ার করুন",
    vip_privilege: "ভিআইপি সুবিধা",
    vip_my_wallet_balance: "আমার ওয়ালেট ব্যালেন্স",
    vip_daily_profit: "দৈনিক লাভ",
    vip_per_order: "প্রতি অর্ডার",
    vip_orders_per_day: "অর্ডার / দিন",
    daily_income: "দৈনিক আয়",
    total_revenue: "মোট আয়",
    valid_days: "মেয়াদকাল",
    join_now: "যুক্ত হোন",
    vip_upgrade_join: "আপগ্রেড / যুক্ত হোন",
    vip_active_now: "বর্তমানে সক্রিয়",
    current_level: "বর্তমান লেভেল",
    vip_confirm_modal_title: "ভিআইপি সক্রিয়করণ নিশ্চিত করুন",
    vip_unlock_rule: "ভিআইপি লেভেল শর্ত",
    vip_balance_insufficient: "আপগ্রেড করার জন্য পর্যাপ্ত ব্যালেন্স নেই। দয়া করে আগে রিচার্জ করুন।",

    // Profile & Records
    my_profile: "আমার প্রোফাইল",
    phone_number: "ফোন নম্বর",
    invitation_code: "ইনভিটেশন কোড",
    recharge_records: "রিচার্জ রেকর্ড",
    withdrawal_records: "উইথড্রয়াল রেকর্ড",
    account_details: "অ্যাকাউন্ট বিবরণ",
    total_assets: "আমার মোট সম্পদ: (USDT)",
    earnings_yesterday: "গতকালের আয়",
    accumulated_earnings: "মোট পুঞ্জীভূত আয়",
    today_earnings: "আজকের আয়",
    complete_now: "এখনই সম্পন্ন করুন",
    notice: "বিজ্ঞপ্তি",
    company_info: "কোম্পানি তথ্য",
    faq: "সাধারণ জিজ্ঞাসা",
    team_details: "টিম বিবরণ",
    invite_friends: "বন্ধু আমন্ত্রণ",
    personal_info: "ব্যক্তিগত তথ্য",
    change_pwd: "পাসওয়ার্ড পরিবর্তন",
    set_withdraw_pwd: "উইথড্র পাসওয়ার্ড সেট",
    support: "সাপোর্ট",
    remove_photo: "ছবি মুছুন",
    upload_photo: "প্রোফাইল ছবি আপলোড",

    // Orders / Daily Tasks
    daily_necessities: "নিত্যপ্রয়োজনীয় পণ্য",
    daily_return_rate: "দৈনিক আয়ের হার",
    trusted_product: "বিশ্বস্ত পণ্য",
    already_queued: "ইতিমধ্যে সারিতে যুক্ত করা হয়েছে",
    ready_to_queue: "অর্ডারের সারিতে যোগ দিন",
    processing_order: "অর্ডার প্রসেস হচ্ছে...",
    total_assets_label: "মোট সম্পদ",
    freeze_funds: "হোল্ড ফান্ড",
    todays_commission: "আজকের কমিশন",
    todays_order: "আজকের অর্ডার",
    add_to_queue: "অর্ডারের সারিতে যোগ দিন",
    limit_reached: "আজকের লিমিট শেষ (৫/৫)",
    order_completed: "অর্ডার সম্পন্ন হয়েছে!",
    order_success_desc: "আপনার দৈনিক কমিশন সফলভাবে ব্যালেন্সে যুক্ত হয়েছে।",
    earned_profit: "অর্জিত লাভ",
    confirm_and_continue: "নিশ্চিত করুন এবং এগিয়ে যান",
    recharge_to_unlock: "অর্ডার আনলক করতে রিচার্জ করুন",
    min_vip_required: "অর্ডার কমিশন পেতে ন্যূনতম VIP-1 প্রয়োজন।",
    target_vault: "টার্গেট ভল্ট",
    order_settling_desc: "অনুগ্রহ করে লেনদেন সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন...",

    // Withdraw Page
    withdraw_title: "উইথড্র",
    withdraw_balance_label: "উইথড্রযোগ্য ব্যালেন্স",
    total_balance_label: "মোট ব্যালেন্স",
    bank_card: "বিকাশ / নগদ",
    crypto_usdt: "ইউএসডিটি (BEP-20)",
    select_account: "গ্রহণকারী অ্যাকাউন্ট নির্বাচন করুন",
    no_wallet_bound: "কোনো ওয়ালেট যুক্ত করা নেই। যুক্ত করতে 'আমার ব্যাংক' এ যান।",
    withdraw_amount_label: "উইথড্র পরিমাণ",
    enter_amount: "পরিমাণ লিখুন",
    withdraw_pwd_label: "উইথড্র পাসওয়ার্ড",
    enter_withdraw_pwd: "৬ ডিজিটের উইথড্র পাসওয়ার্ড দিন",
    confirm_withdraw_btn: "উইথড্র নিশ্চিত করুন",
    withdraw_rules: "উইথড্র নিয়মাবলী",
    min_withdraw_bank_rule: "বিকাশ / নগদ এর জন্য ন্যূনতম উইথড্র ২৫০ BDT।",
    min_withdraw_usdt_rule: "ইউএসডিটি এর জন্য ন্যূনতম উইথড্র ৬ USDT।",
    bonus_lock_rule: "৫০০ BDT সাইন-আপ বোনাস সরাসরি উইথড্র করা যাবে না।",
    weekend_notice_title: "সাপ্তাহিক অডিট ও সেটেলমেন্ট নোটিশ",
    weekend_notice_desc: "সাপ্তাহিক অডিট এবং আর্থিক সেটেলমেন্টের কারণে শুক্রবার এবং শনিবার উইথড্র সাময়িকভাবে বন্ধ থাকে। রবিবার সকাল ১০:০০ টায় উইথড্র সেবা পুনরায় চালু হবে।",
    weekend_badge: "উইথড্র বন্ধ (শুক্রবার ও শনিবার)",
    i_understand: "আমি বুঝতে পেরেছি",
    back_to_home: "হোমপেজে ফিরে যান",

    // Recharge Page
    recharge_title: "রিচার্জ",
    recharge_amount: "রিচার্জ পরিমাণ",
    select_payment_channel: "পেমেন্ট মাধ্যম নির্বাচন করুন",
    confirm_recharge: "রিচার্জ নিশ্চিত করুন",
    transfer_guide: "পেমেন্ট নির্দেশিকা",
    min_deposit: "ন্যূনতম ডিপোজিট",
    exchange_rate: "এক্সচেঞ্জ রেট",

    // Team Page
    team_title: "আমার টিম",
    team_overview: "টিম বিবরণ",
    total_team_members: "মোট টিম মেম্বার",
    total_team_commission: "টিম কমিশন",
    level1: "লেভেল ১",
    level2: "লেভেল ২",
    level3: "লেভেল ৩",
    referral_code: "রেফারেল কোড",
    copy_link: "লিংক কপি করুন",
    claim_rewards: "কমিশন ক্লেইম করুন",

    // My Bank Page
    my_bank_title: "আমার ব্যাংক",
    bind_account: "অ্যাকাউন্ট যুক্ত করুন",
    account_name: "অ্যাকাউন্টধারীর নাম",
    account_number: "অ্যাকাউন্ট / ফোন নম্বর",
    save_changes: "সংরক্ষণ করুন",

    // Auth Pages
    login_title: "Welcome to Zexo Capital",
    login_subheading: "Login to continue your investment journey",
    register_title: "Create Account",
    register_subheading: "Join Zexo Capital and grow your wealth",
    phone_placeholder: "ফোন নম্বর",
    password_placeholder: "পাসওয়ার্ড",
    login_button: "লগইন করুন",
    register_button: "অ্যাকাউন্ট তৈরি করুন",
    dont_have_account: "অ্যাকাউন্ট নেই?",
    already_have_account: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
    sign_up_now: "এখনই সাইন আপ করুন",
  },
  ar: {
    // Top Bar & Common
    language: "اللغة",
    select_language: "اختر اللغة",
    close: "إغلاق",
    cancel: "إلغاء",
    confirm: "تأكيد",
    copy: "نسخ",
    copied: "تم النسخ!",
    submit: "إرسال",
    loading: "جار التحميل...",
    success: "نجاح",
    error: "خطأ",
    back: "رجوع",
    details: "تفاصيل",
    all: "الكل",
    status: "الحالة",
    time: "الوقت",
    amount: "المبلغ",
    action: "إجراء",

    // Banner & Announcements
    live_summit: "قمة مباشرة",
    usa_official: "رسمي من أمريكا",
    conf_title: "مؤتمر زيكسو كابيتال الدولي",
    conf_subtitle: "استثمار • نمو • ازدهار | الجلسة الافتتاحية",
    delegates_tag: "+500 مندوب",
    global_forum: "منتدى عالمي",
    delegates_title: "قمة وفد المستثمرين العالمي",
    ticker_default: "زيكسو كابيتال هي منصة استثمار دولية مقرها الولايات المتحدة الأمريكية",

    // Balance Card
    balance: "الرصيد",
    total_fund: "إجمالي الأموال",
    fund_income: "دخل الصندوق",
    usdt: "USDT",

    // Action Cards
    app_download: "تحميل التطبيق",
    records: "السجلات",
    gift_receive: "استلام الهدية",
    password: "كلمة المرور",
    my_bank: "حسابي البنكي",
    my_team: "فريقي",
    deposit: "إيداع",
    withdraw: "سحب",
    logout: "تسجيل الخروج",
    customer_service: "خدمة العملاء",
    intro_zexo: "مقدمة عن زيكسو كابيتال",
    confirm_logout: "هل أنت متأكد أنك تريد تسجيل الخروج؟",

    // Bottom Navigation
    nav_home: "الرئيسية",
    nav_vip: "مستوى VIP",
    nav_order: "الطلبات",
    nav_profile: "المركز الشخصي",

    // VIP Page
    vip_title: "استثمر وشارك الأرباح",
    vip_privilege: "امتيازات VIP",
    vip_my_wallet_balance: "رصيد محفظتي",
    vip_daily_profit: "الربح اليومي",
    vip_per_order: "لكل طلب",
    vip_orders_per_day: "طلبات / يوم",
    daily_income: "الدخل اليومي",
    total_revenue: "إجمالي الإيرادات",
    valid_days: "مدة الصلاحية",
    join_now: "انضم الآن",
    vip_upgrade_join: "ترقية / انضم الآن",
    vip_active_now: "نشط حالياً",
    current_level: "المستوى الحالي",
    vip_confirm_modal_title: "تأكيد تفعيل VIP",
    vip_unlock_rule: "متطلبات مستوى VIP",
    vip_balance_insufficient: "الرصيد غير كافٍ للترقية. يرجى الشحن أولاً.",

    // Profile & Records
    my_profile: "ملفي الشخصي",
    phone_number: "رقم الهاتف",
    invitation_code: "رمز الدعوة",
    recharge_records: "سجلات الشحن",
    withdrawal_records: "سجلات السحب",
    account_details: "تفاصيل الحساب",
    total_assets: "إجمالي أصولي: (USDT)",
    earnings_yesterday: "أرباح الأمس",
    accumulated_earnings: "الأرباح المتراكمة",
    today_earnings: "أرباح اليوم",
    complete_now: "أكمل الآن",
    notice: "إشعار",
    company_info: "معلومات الشركة",
    faq: "الأسئلة الشائعة",
    team_details: "تفاصيل الفريق",
    invite_friends: "دعوة الأصدقاء",
    personal_info: "المعلومات الشخصية",
    change_pwd: "تغيير كلمة المرور",
    set_withdraw_pwd: "تعيين كلمة مرور السحب",
    support: "الدعم",
    remove_photo: "حذف الصورة",
    upload_photo: "تحميل الصورة الشخصية",

    // Orders / Daily Tasks
    daily_necessities: "الضروريات اليومية",
    daily_return_rate: "معدل العائد اليومي",
    trusted_product: "منتج موثوق",
    already_queued: "تمت الإضافة إلى قائمة الانتظار",
    ready_to_queue: "جاهز للإضافة إلى قائمة الانتظار",
    processing_order: "جاري معالجة الطلب...",
    total_assets_label: "إجمالي الأصول",
    freeze_funds: "الأموال المجمدة",
    todays_commission: "عمولة اليوم",
    todays_order: "طلبات اليوم",
    add_to_queue: "أضف إلى قائمة الانتظار",
    limit_reached: "تم الوصول للحد اليومي (5/5)",
    order_completed: "اكتمل الطلب!",
    order_success_desc: "تمت إضافة عمولتك اليومية بنجاح إلى رصيدك.",
    earned_profit: "الربح المكتسب",
    confirm_and_continue: "تأكيد ومتابعة",
    recharge_to_unlock: "اشحن لفتح الطلبات",
    min_vip_required: "الحد الأدنى VIP-1 مطلوب لكسب عمولة الطلب اليومية.",
    target_vault: "خزنة الهدف",
    order_settling_desc: "يرجى الانتظار بينما تتم تسوية المعاملة...",

    // Withdraw Page
    withdraw_title: "سحب",
    withdraw_balance_label: "الرصيد القابل للسحب",
    total_balance_label: "الرصيد الإجمالي",
    bank_card: "bKash / Nagad",
    crypto_usdt: "USDT (BEP-20)",
    select_account: "اختر الحساب المستلم",
    no_wallet_bound: "لم يتم ربط أي محفظة بعد. انتقل إلى 'حسابي البنكي' للربط.",
    withdraw_amount_label: "مبلغ السحب",
    enter_amount: "يرجى إدخال المبلغ",
    withdraw_pwd_label: "كلمة مرور السحب",
    enter_withdraw_pwd: "أدخل كلمة مرور السحب المكونة من 6 أرقام",
    confirm_withdraw_btn: "تأكيد السحب",
    withdraw_rules: "قواعد السحب",
    min_withdraw_bank_rule: "الحد الأدنى للسحب عبر bKash / Nagad هو 250 BDT.",
    min_withdraw_usdt_rule: "الحد الأدنى للسحب عبر USDT هو 6 USDT.",
    bonus_lock_rule: "لا يمكن سحب مكافأة التسجيل البالغة 500 BDT مباشرة.",
    weekend_notice_title: "إشعار التسوية الأسبوعية",
    weekend_notice_desc: "عمليات السحب غير متاحة يومي الجمعة والسبت بسبب التدقيق المالي الأسبوعي والتسويات المصرفية. ستستأنف خدمات السحب يوم الأحد الساعة 10:00 صباحاً.",
    weekend_badge: "السحب مغلق (الجمعة والسبت)",
    i_understand: "أنا أفهم",
    back_to_home: "العودة للرئيسية",

    // Recharge Page
    recharge_title: "شحن الرصيد",
    recharge_amount: "مبلغ الشحن",
    select_payment_channel: "اختر قناة الدفع",
    confirm_recharge: "تأكيد الشحن",
    transfer_guide: "دليل التحويل",
    min_deposit: "الحد الأدنى للإيداع",
    exchange_rate: "سعر الصرف",

    // Team Page
    team_title: "فريقي",
    team_overview: "تفاصيل الفريق",
    total_team_members: "إجمالي أعضاء الفريق",
    total_team_commission: "عمولة الفريق",
    level1: "المستوى 1",
    level2: "المستوى 2",
    level3: "المستوى 3",
    referral_code: "رمز الدعوة",
    copy_link: "نسخ الرابط",
    claim_rewards: "المطالبة بالعمولة",

    // My Bank Page
    my_bank_title: "حسابي البنكي",
    bind_account: "ربط الحساب",
    account_name: "اسم صاحب الحساب",
    account_number: "رقم الحساب / الهاتف",
    save_changes: "حفظ التغييرات",

    // Auth Pages
    login_title: "Welcome to Zexo Capital",
    login_subheading: "Login to continue your investment journey",
    register_title: "Create Account",
    register_subheading: "Join Zexo Capital and grow your wealth",
    phone_placeholder: "رقم الهاتف",
    password_placeholder: "كلمة المرور",
    login_button: "تسجيل الدخول",
    register_button: "إنشاء حساب",
    dont_have_account: "ليس لديك حساب؟",
    already_have_account: "هل لديك حساب بالفعل؟",
    sign_up_now: "سجل الآن",
  },
  zh: {
    // Top Bar & Common
    language: "语言",
    select_language: "选择语言",
    close: "关闭",
    cancel: "取消",
    confirm: "确认",
    copy: "复制",
    copied: "已复制！",
    submit: "提交",
    loading: "加载中...",
    success: "成功",
    error: "错误",
    back: "返回",
    details: "详情",
    all: "全部",
    status: "状态",
    time: "时间",
    amount: "金额",
    action: "操作",

    // Banner & Announcements
    live_summit: "现场峰会",
    usa_official: "美国官方",
    conf_title: "Zexo Capital 国际投资峰会",
    conf_subtitle: "投资 • 增长 • 繁荣 | 主题演讲",
    delegates_tag: "500+ 代表",
    global_forum: "全球论坛",
    delegates_title: "全球投资者代表团峰会",
    ticker_default: "Zexo Capital 是一家总部位于美国的国际投资财富管理平台",

    // Balance Card
    balance: "账户余额",
    total_fund: "总资金",
    fund_income: "基金收益",
    usdt: "USDT",

    // Action Cards
    app_download: "下载应用",
    records: "资金记录",
    gift_receive: "领取礼品",
    password: "密码管理",
    my_bank: "我的银行",
    my_team: "我的团队",
    deposit: "充值充币",
    withdraw: "申请提现",
    logout: "退出登录",
    customer_service: "在线客服",
    intro_zexo: "Zexo Capital 平台介绍",
    confirm_logout: "您确定要退出登录吗？",

    // Bottom Navigation
    nav_home: "首页",
    nav_vip: "VIP等级",
    nav_order: "订单",
    nav_profile: "个人中心",

    // VIP Page
    vip_title: "投资并共享收益",
    vip_privilege: "VIP专属特权",
    vip_my_wallet_balance: "我的钱包余额",
    vip_daily_profit: "每日利润",
    vip_per_order: "每单收益",
    vip_orders_per_day: "每日单数",
    daily_income: "每日收益",
    total_revenue: "累计收益",
    valid_days: "有效周期",
    join_now: "立即加入",
    vip_upgrade_join: "升级 / 立即加入",
    vip_active_now: "当前激活",
    current_level: "当前等级",
    vip_confirm_modal_title: "确认激活VIP",
    vip_unlock_rule: "VIP等级要求",
    vip_balance_insufficient: "余额不足，无法升级。请先充值。",

    // Profile & Records
    my_profile: "个人资料",
    phone_number: "手机号码",
    invitation_code: "邀请码",
    recharge_records: "充值明细",
    withdrawal_records: "提现记录",
    account_details: "账户明细",
    total_assets: "我的总资产: (USDT)",
    earnings_yesterday: "昨日收益",
    accumulated_earnings: "累计收益",
    today_earnings: "今日收益",
    complete_now: "立即完成",
    notice: "公告",
    company_info: "公司介绍",
    faq: "常见问题",
    team_details: "团队详情",
    invite_friends: "邀请好友",
    personal_info: "个人信息",
    change_pwd: "修改密码",
    set_withdraw_pwd: "设置提款密码",
    support: "在线客服",
    remove_photo: "删除头像",
    upload_photo: "上传个人头像",

    // Orders / Daily Tasks
    daily_necessities: "日用品专区",
    daily_return_rate: "每日收益率",
    trusted_product: "认证优选",
    already_queued: "已加入抢单队列",
    ready_to_queue: "准备加入队列",
    processing_order: "正在匹配订单...",
    total_assets_label: "总资产",
    freeze_funds: "冻结资金",
    todays_commission: "今日佣金",
    todays_order: "今日抢单",
    add_to_queue: "加入队列",
    limit_reached: "今日上限已满 (5/5)",
    order_completed: "订单完成!",
    order_success_desc: "您的每日佣金已成功添加到账户余额。",
    earned_profit: "获得利润",
    confirm_and_continue: "确认并继续",
    recharge_to_unlock: "充值升级解锁抢单",
    min_vip_required: "需要至少 VIP-1 等级才能获取每日订单佣金。",
    target_vault: "目标金库",
    order_settling_desc: "请等待交易结算完成...",

    // Withdraw Page
    withdraw_title: "申请提现",
    withdraw_balance_label: "可提现余额",
    total_balance_label: "总余额",
    bank_card: "bKash / Nagad",
    crypto_usdt: "USDT (BEP-20)",
    select_account: "选择收款账户",
    no_wallet_bound: "尚未绑定钱包。请前往“我的银行”进行绑定。",
    withdraw_amount_label: "提现金额",
    enter_amount: "请输入提现金额",
    withdraw_pwd_label: "提现密码",
    enter_withdraw_pwd: "请输入6位提现密码",
    confirm_withdraw_btn: "确认提现",
    withdraw_rules: "提现规则",
    min_withdraw_bank_rule: "bKash / Nagad 的最低提现金额为 250 BDT。",
    min_withdraw_usdt_rule: "USDT 的最低提现金额为 6 USDT。",
    bonus_lock_rule: "500 BDT 注册奖励不可直接提现。",
    weekend_notice_title: "每周结算与审计通知",
    weekend_notice_desc: "由于每周财务审计与银行结算，周五和周六暂停提现服务。提现服务将于周日上午10:00恢复。",
    weekend_badge: "提现已暂停 (周五和周六)",
    i_understand: "我知道了",
    back_to_home: "返回首页",

    // Recharge Page
    recharge_title: "充值充币",
    recharge_amount: "充值金额",
    select_payment_channel: "选择支付通道",
    confirm_recharge: "确认充值",
    transfer_guide: "转账指南",
    min_deposit: "最低充值金额",
    exchange_rate: "参考汇率",

    // Team Page
    team_title: "我的团队",
    team_overview: "团队概览",
    total_team_members: "团队总人数",
    total_team_commission: "团队佣金",
    level1: "一级成员",
    level2: "二级成员",
    level3: "三级成员",
    referral_code: "邀请码",
    copy_link: "复制链接",
    claim_rewards: "领取佣金",

    // My Bank Page
    my_bank_title: "我的银行",
    bind_account: "绑定账户",
    account_name: "开户姓名",
    account_number: "账号 / 手机号码",
    save_changes: "保存更改",

    // Auth Pages
    login_title: "Welcome to Zexo Capital",
    login_subheading: "Login to continue your investment journey",
    register_title: "Create Account",
    register_subheading: "Join Zexo Capital and grow your wealth",
    phone_placeholder: "手机号码",
    password_placeholder: "登录密码",
    login_button: "立即登录",
    register_button: "立即注册",
    dont_have_account: "没有账号？",
    already_have_account: "已有账号？",
    sign_up_now: "立即注册",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
  activeLanguageOption: LanguageOption;
  isLangModalOpen: boolean;
  openLangModal: () => void;
  closeLangModal: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isRtl: false,
  activeLanguageOption: LANGUAGE_OPTIONS[0],
  isLangModalOpen: false,
  openLangModal: () => {},
  closeLangModal: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("zexo_language") as Language | null;
      if (saved && ["en", "bn", "ar", "zh"].includes(saved)) {
        setLanguageState(saved);
        applyLanguage(saved);
      } else {
        setLanguageState("en");
        applyLanguage("en");
      }
    } catch {
      setLanguageState("en");
    }
  }, []);

  const applyLanguage = (lang: Language) => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      if (lang === "ar") {
        document.documentElement.dir = "rtl";
      } else {
        document.documentElement.dir = "ltr";
      }
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("zexo_language", lang);
    } catch {}
    applyLanguage(lang);
  };

  const openLangModal = () => setIsLangModalOpen(true);
  const closeLangModal = () => setIsLangModalOpen(false);

  const t = (key: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    return translations.en[key] || key;
  };

  const isRtl = language === "ar";
  const activeLanguageOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRtl,
        activeLanguageOption,
        isLangModalOpen,
        openLangModal,
        closeLangModal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
