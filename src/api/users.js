import client from './client';
import { keysToCamel, keysToSnake } from './helpers';

export const getUsers = () =>
  client.get('/users/').then((r) => keysToCamel(r.data));

export const addUser = (data) =>
  client.post('/users/', keysToSnake(data)).then((r) => keysToCamel(r.data));

export const deleteUser = (id) =>
  client.delete(`/users/${id}/`);