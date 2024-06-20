import axios from "axios";
import { BASE_URL } from "./CommonApiURL";


// Function to get the token from localStorage
const getToken = () => {
  const user = localStorage.getItem('user');
  console.log(user ? JSON.parse(user).token:"token")
  return user ? JSON.parse(user).token : '';
};

// Function to handle authentication errors
const handleAuthenticationError = (error) => {
  if (error.response && error.response.status === 401) {
    // Handle unauthorized error, e.g., redirect to login
  }
  return Promise.reject(error);
};

// Function to get the current date in UTC format
export const dateUTC = (date = new Date()) => new Date(new Date(date).toUTCString()).toISOString();

// Common payload fields for POST requests
export const commonPayloadFields = {
  createdBy: 'APPLICATION',
  createdDt: dateUTC(new Date()),
  updatedBy: 'APPLICATION',
  updatedDt: dateUTC(new Date()),
  isActive: true
};

// POST method
const post = (url, payload) => {
  payload = { ...payload, ...commonPayloadFields };

  return axios({
    method: "post",
    url: BASE_URL + `${url}`,
    data: payload,
    headers: {
      'Authorization':`${getToken()}`
    }
  }).catch(handleAuthenticationError);
};

// GET method
const get = (url) => {
  return axios({
    method: "get",
    url: BASE_URL + `${url}`,
    headers: {
      'Authorization':`Bearer ${getToken()}`      
    }
  }).catch(handleAuthenticationError);
};

// Export API service
export const API_SERVICE = {
  post: post,
  get: get
};
