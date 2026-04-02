import axios from 'axios';

export const usersApi = axios.create({
  baseURL: '/api/users',
  params: {},
});
