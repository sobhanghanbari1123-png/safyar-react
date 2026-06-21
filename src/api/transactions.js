import client from './client';
import { keysToCamel } from './helpers';

export const getTransactions = (filters = {}) =>
  client.get('/transactions/', { params: filters }).then((r) => keysToCamel(r.data));