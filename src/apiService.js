import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

export const getPolls = () => API.get('/polls');
export const createPoll = (pollData) => API.post('/polls', pollData);
export const deletePoll = (pollId) => API.delete(`/polls/${pollId}`);
export const voteOnPoll = (pollId, optionId) => API.post(`/polls/${pollId}/vote`, { optionId });
