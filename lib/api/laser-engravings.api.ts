import axios from 'axios';

export const laserEngravingsApi = axios.create({
  baseURL: '/api/laser-engravings',
  params: {},
});
