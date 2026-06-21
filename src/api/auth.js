import client from './client';

export const login = async (username, password) => {
  const { data } = await client.post('/token/', { username, password });
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  return data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isLoggedIn = () => !!localStorage.getItem('access_token');