import client from './client';
import { keysToCamel, keysToSnake } from './helpers';

export const getReports = (filters = {}) =>
  client.get('/reports/', { params: filters }).then((r) => keysToCamel(r.data));

export const addReport = (data) =>
  client.post('/reports/', keysToSnake(data)).then((r) => keysToCamel(r.data));

export const updateReport = (id, data) =>
  client.put(`/reports/${id}/`, keysToSnake(data)).then((r) => keysToCamel(r.data));

export const deleteReport = (id) =>
  client.delete(`/reports/${id}/`);
