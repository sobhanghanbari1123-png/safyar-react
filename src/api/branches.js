import client from './client';
import { keysToCamel, keysToSnake } from './helpers';

export const getBranches = () =>
  client.get('/branches/').then((r) => keysToCamel(r.data));

export const addBranch = (data) =>
  client.post('/branches/', keysToSnake(data)).then((r) => keysToCamel(r.data));

export const updateBranch = (id, data) =>
  client.put(`/branches/${id}/`, keysToSnake(data)).then((r) => keysToCamel(r.data));

export const deleteBranch = (id) =>
  client.delete(`/branches/${id}/`);