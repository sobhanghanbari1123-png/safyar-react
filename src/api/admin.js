import client from './client';
import { keysToCamel, keysToSnake } from './helpers';

/* ── صافکاری‌ها ── */
export const getShops = () =>
  client.get('/admin/shops/').then(r => keysToCamel(r.data));

export const updateShop = (id, data) =>
  client.put(`/admin/shops/${id}/`, keysToSnake(data)).then(r => keysToCamel(r.data));

export const deleteShop = (id) =>
  client.delete(`/admin/shops/${id}/`);

// شارژ دستی کیف پول یک صافکاری
export const chargeShop = (id, amount) =>
  client.post(`/admin/shops/${id}/charge/`, { amount }).then(r => keysToCamel(r.data));

/* ── کاربران ── */
export const getUsers = () =>
  client.get('/admin/users/').then(r => keysToCamel(r.data));

export const updateUser = (id, data) =>
  client.put(`/admin/users/${id}/`, keysToSnake(data)).then(r => keysToCamel(r.data));

export const deleteUser = (id) =>
  client.delete(`/admin/users/${id}/`);

/* ── تراکنش‌ها ── */
export const getAllTransactions = (filters = {}) =>
  client.get('/admin/transactions/', { params: filters }).then(r => keysToCamel(r.data));

/* ── محتوای راهنما (مشترک با صفحه‌ی Next) ── */
export const getHelpContent = () =>
  client.get('/admin/help-content/').then(r => keysToCamel(r.data));

export const saveHelpContent = (content) =>
  client.put('/admin/help-content/', keysToSnake(content)).then(r => keysToCamel(r.data));