// Shared worker (همکاران) data used by Workers, ChoosePlacePrice and Reports pages.

// Available job types
export const JOBS = ['صافکار', 'نقاش', 'کاورکار'];

// Map a repair type to the matching worker job
export const REPAIR_JOB = {
  'صافکاری': 'صافکار',
  'نقاشی':   'نقاش',
  'کاور':    'کاورکار',
};

// Sample / initial workers
export const INIT_WORKERS = [
  { id: 1, name: 'رضا کریمی',  mobile: '09121111111', branch: 'شعبه مرکزی', job: 'صافکار' },
  { id: 2, name: 'مهدی احمدی', mobile: '09122222222', branch: 'شعبه مشهد',  job: 'نقاش' },
  { id: 3, name: 'علی رضایی',  mobile: '09123333333', branch: 'شعبه مرکزی', job: 'صافکار' },
  { id: 4, name: 'سعید موسوی', mobile: '09124444444', branch: 'شعبه مرکزی', job: 'کاورکار' },
];

// Badge color class per job
export const jobBadgeClass = (job) =>
  job === 'صافکار' ? 'badge-success'
  : job === 'نقاش' ? 'badge-info'
  : job === 'کاورکار' ? 'badge-warning'
  : 'badge-purple';
