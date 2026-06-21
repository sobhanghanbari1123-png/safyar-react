import client from './client';
import { keysToCamel, keysToSnake } from './helpers';

export const getCustomers = () =>
  client.get('/customers/').then((r) => keysToCamel(r.data));

export const addCustomer = (data) =>
  client.post('/customers/', keysToSnake(data)).then((r) => keysToCamel(r.data));

export const updateCustomer = (id, data) =>
  client.put(`/customers/${id}/`, keysToSnake(data)).then((r) => keysToCamel(r.data));

export const deleteCustomer = (id) =>
  client.delete(`/customers/${id}/`);

// جستجو با پلاک یا موبایل
export const searchCustomer = (params) =>
  client.get('/customers/', { params }).then((r) => keysToCamel(r.data));