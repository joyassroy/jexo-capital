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
    password: "password",
    my_bank: "My Bank",
    my_team: "My team",
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
    vip_privilege: "VIP Privileges",
    daily_income: "Daily Income",
    total_revenue: "Total Revenue",
    valid_days: "Valid Period",
    join_now: "Join Now",
    current_level: "Current Level",

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
    vip_privilege: "ভিআইপি সুবিধা",
    daily_income: "দৈনিক আয়",
    total_revenue: "মোট আয়",
    valid_days: "মেয়াদকাল",
    join_now: "যুক্ত হোন",
    current_level: "বর্তমান লেভেল",

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
    vip_privilege: "امتيازات VIP",
    daily_income: "الدخل اليومي",
    total_revenue: "إجمالي الإيرادات",
    valid_days: "مدة الصلاحية",
    join_now: "انضم الآن",
    current_level: "المستوى الحالي",

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
    vip_privilege: "VIP专属特权",
    daily_income: "每日收益",
    total_revenue: "累计收益",
    valid_days: "有效周期",
    join_now: "立即加入",
    current_level: "当前等级",

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
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
  activeLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
  isRtl: false,
  activeLanguageOption: LANGUAGE_OPTIONS[0],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
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
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
