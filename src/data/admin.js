// ── داده‌ی پنل ادمین (سوپر ادمین) ──
// این بخش مخصوص نام‌کاربری خاص ادمینه که همه‌ی صافکاری‌ها، کاربران و
// تراکنش‌های کل سامانه را می‌بیند و می‌تواند کیف پول صافکاری‌ها را شارژ کند.

// شناسه‌ی ادمین: فقط این کد ملی به پنل ادمین دسترسی دارد
export const ADMIN_USERNAME = 'safyar_admin';
export const ADMIN_NATIONAL = '0000000000';

// آیا کاربر فعلی (لاگین‌شده) ادمین است؟
export const isAdmin = () =>
  localStorage.getItem('current_user') === ADMIN_NATIONAL;

// صافکاری‌های مشترک سامانه (هر کدام یک کسب‌وکار با کیف پول جدا)
export const INIT_SHOPS = [
  { id: 1, name: 'صافکاری صافیار',     owner: 'سبحان قنبری', mobile: '09120000001', address: 'تهران، خیابان ولیعصر، پلاک ۱۲', plan: 'حرفه‌ای', wallet: 1250000, status: 'active', joined: '۱۴۰۲/۱۱/۰۳' },
  { id: 2, name: 'بدنه‌سازی مشهد پلاس', owner: 'رضا کریمی',   mobile: '09120000002', address: 'مشهد، بلوار وکیل‌آباد، پلاک ۴۵', plan: 'پایه',    wallet: 320000,  status: 'active', joined: '۱۴۰۳/۰۱/۱۵' },
  { id: 3, name: 'صافکاری البرز',       owner: 'مهدی احمدی',  mobile: '09120000003', address: 'کرج، خیابان طالقانی، پلاک ۷', plan: 'حرفه‌ای', wallet: 0,       status: 'expired', joined: '۱۴۰۳/۰۲/۲۰' },
  { id: 4, name: 'اتو بدنه اصفهان',     owner: 'علی رضایی',   mobile: '09120000004', address: 'اصفهان، خیابان چهارباغ، پلاک ۲۰', plan: 'پایه',  wallet: 85000,   status: 'active', joined: '۱۴۰۳/۰۳/۰۱' },
];

// کاربران سامانه (حساب‌های کاربری برنامه — نه همکاران/صافکار/نقاش)
export const INIT_USERS = [
  { id: 1, name: 'علی محمدی',   national: '1234567890', mobile: '09121234567', branch: 'شعبه مرکزی', status: 'approved', role: 'ادمین' },
  { id: 2, name: 'فاطمه رضایی', national: '0987654321', mobile: '09351234567', branch: 'شعبه مشهد',  status: 'approved', role: 'کاربر عادی' },
  { id: 3, name: 'حسین کریمی',  national: '1111111111', mobile: '09181234567', branch: 'شعبه مرکزی', status: 'approved', role: 'کاربر عادی' },
  { id: 4, name: 'زهرا احمدی',  national: '2222222222', mobile: '09121111111', branch: 'شعبه مشهد',  status: 'approved', role: 'کاربر عادی' },
  { id: 5, name: 'مهدی صادقی',  national: '3333333333', mobile: '09353333333', branch: 'شعبه مرکزی', status: 'approved', role: 'کاربر عادی' },
];

// ── مدیریت کاربران ثبت‌نام‌شده (در localStorage) ──
const REG_USERS_KEY = 'safyar_registered_users';

export function loadRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REG_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveRegisteredUsers(users) {
  localStorage.setItem(REG_USERS_KEY, JSON.stringify(users));
}

export function registerNewUser(userData) {
  const users = loadRegisteredUsers();
  const newUser = {
    id: Date.now(),
    name: userData.name,
    national: userData.national,
    mobile: userData.mobile,
    address: userData.address || '',
    shop: userData.shop || '',
    password: userData.password,
    branch: 'شعبه مرکزی',
    role: 'مالک',
    status: 'pending',
    registeredAt: new Date().toLocaleDateString('fa-IR'),
  };
  users.push(newUser);
  saveRegisteredUsers(users);
  return newUser;
}

export function updateUserStatus(national, status) {
  const users = loadRegisteredUsers();
  const updated = users.map(u => u.national === national ? { ...u, status } : u);
  saveRegisteredUsers(updated);
  return updated;
}

export function getUserStatus(national) {
  if (national === ADMIN_NATIONAL) return 'approved';
  const regUsers = loadRegisteredUsers();
  const found = regUsers.find(u => u.national === national);
  if (found) return found.status;
  const initFound = INIT_USERS.find(u => u.national === national);
  return initFound ? initFound.status : null;
}

const SHOP_USERS_KEY = 'safyar_shop_users';

export function loadShopUsers() {
  try { return JSON.parse(localStorage.getItem(SHOP_USERS_KEY) || '[]'); } catch { return []; }
}

export function saveShopUsers(users) {
  localStorage.setItem(SHOP_USERS_KEY, JSON.stringify(users));
}

export function getUserRole(national) {
  if (national === ADMIN_NATIONAL) return 'ادمین';
  const regUsers = loadRegisteredUsers();
  const regFound = regUsers.find(u => u.national === national);
  if (regFound) return regFound.role || 'مالک';
  const shopUsers = loadShopUsers();
  const shopFound = shopUsers.find(u => u.national === national);
  if (shopFound) return shopFound.role || 'کاربر عادی';
  const initFound = INIT_USERS.find(u => u.national === national);
  if (initFound) return initFound.role || 'کاربر عادی';
  return 'کاربر عادی';
}

export const getCurrentRole = () =>
  getUserRole(localStorage.getItem('current_user') || '');

// همه‌ی تراکنش‌های کل سامانه (واریز/شارژ صافکاری‌ها و هزینه‌ها)
export const ALL_TRANSACTIONS = [
  { id: 1, shop: 'صافکاری صافیار',     date: '۱۴۰۳/۰۳/۱۵', time: '۱۰:۳۰', type: 'income',  status: 'success', amount: 500000,  desc: 'شارژ کیف پول' },
  { id: 2, shop: 'بدنه‌سازی مشهد پلاس', date: '۱۴۰۳/۰۳/۱۴', time: '۱۴:۰۰', type: 'expense', status: 'success', amount: 200000,  desc: 'هزینه پذیرش خودرو' },
  { id: 3, shop: 'صافکاری البرز',       date: '۱۴۰۳/۰۳/۱۳', time: '۰۹:۱۵', type: 'income',  status: 'pending', amount: 1000000, desc: 'شارژ کیف پول' },
  { id: 4, shop: 'اتو بدنه اصفهان',     date: '۱۴۰۳/۰۳/۱۲', time: '۱۶:۴۵', type: 'expense', status: 'failed',  amount: 150000,  desc: 'پرداخت ناموفق' },
  { id: 5, shop: 'صافکاری صافیار',     date: '۱۴۰۳/۰۳/۱۱', time: '۱۱:۰۰', type: 'income',  status: 'success', amount: 750000,  desc: 'شارژ دستی توسط ادمین' },
  { id: 6, shop: 'بدنه‌سازی مشهد پلاس', date: '۱۴۰۳/۰۳/۱۰', time: '۱۳:۲۰', type: 'expense', status: 'success', amount: 90000,   desc: 'هزینه پیامک' },
  { id: 7, shop: 'اتو بدنه اصفهان',     date: '۱۴۰۳/۰۳/۰۹', time: '۰۸:۴۰', type: 'income',  status: 'success', amount: 300000,  desc: 'شارژ کیف پول' },
];

// ── محتوای صفحه‌ی راهنما (که در صفحه‌ی Next نمایش داده می‌شود) ──
// از پنل ادمین قابل ویرایش است و در localStorage ذخیره می‌شود.
const CONTENT_KEY = 'safyar_help_content';

export const DEFAULT_CONTENT = {
  support: { phone: '02112345678', mobile: '09120000000', email: 'support@safyar.ir', hours: 'شنبه تا پنج‌شنبه، ۹ تا ۱۸' },
  guides: [
    { id: 1, title: 'ثبت خودروی جدید', body: 'از داشبورد روی «پذیرش خودرو» بزنید، پلاک و مشخصات مالک را وارد کرده و مراحل کیلومتر، انتخاب محل و هزینه را تکمیل کنید.' },
    { id: 2, title: 'شارژ کیف پول',     body: 'از نوار کناری روی «شارژ کیف پول» بزنید، مبلغ را وارد و پرداخت کنید. موجودی بلافاصله به‌روز می‌شود.' },
    { id: 3, title: 'گرفتن گزارش و چاپ', body: 'به بخش گزارشات بروید، گزارش موردنظر را پیدا کنید و دکمه‌ی چاپ فاکتور، قرارداد یا بیمه را بزنید.' },
  ],
  changelog: [
    { id: 1, date: '۱۴۰۳/۰۳/۱۵', version: '۱.۴.۰', items: ['افزودن بخش کاور به گزارشات', 'جستجوی پلاک و تاریخ با عدد فارسی و انگلیسی', 'بهبود چاپ قرارداد و بیمه'] },
    { id: 2, date: '۱۴۰۳/۰۲/۲۰', version: '۱.۳.۰', items: ['صفحه‌بندی همه‌ی لیست‌ها', 'افزودن جنسیت به مشتریان', 'خروجی اکسل مشتریان'] },
  ],
};

export function loadContent() {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export function saveContent(content) {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
}
