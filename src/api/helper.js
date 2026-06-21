const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toSnake = (s) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());

// داده‌ی سرور → شکل داخل برنامه
export const keysToCamel = (obj) => {
  if (Array.isArray(obj)) return obj.map(keysToCamel);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamel(k), keysToCamel(v)])
    );
  }
  return obj;
};

// داده‌ی برنامه → شکل ارسالی به سرور
export const keysToSnake = (obj) => {
  if (Array.isArray(obj)) return obj.map(keysToSnake);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toSnake(k), keysToSnake(v)])
    );
  }
  return obj;
};