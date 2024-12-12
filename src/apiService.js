import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' }); // Adjust baseURL as needed

export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getPolls = () => API.get('/polls');
export const createPoll = (pollData) => API.post('/polls', pollData);
export const deletePoll = (pollId) => API.delete(`/polls/${pollId}`);
export const voteOnPoll = (pollId, optionId) => API.post(`/polls/${pollId}/vote`, { optionId });
