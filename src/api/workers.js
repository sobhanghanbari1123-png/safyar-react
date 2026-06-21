import client from './client';
import { keysToCamel, keysToSnake } from './helpers';

export const getWorkers = () =>
  client.get('/workers/').then((r) => keysToCamel(r.data));

export const addWorker = (data) =>
  client.post('/workers/', keysToSnake(data)).then((r) => keysToCamel(r.data));

export const updateWorker = (id, data) =>
  client.put(`/workers/${id}/`, keysToSnake(data)).then((r) => keysToCamel(r.data));

export const deleteWorker = (id) =>
  client.delete(`/workers/${id}/`);