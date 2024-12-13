import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const registerUser = (userData) => API.get('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);