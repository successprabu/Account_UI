import axios from "axios";
import { BASE_URL } from "./CommonApiURL";

const user = localStorage.getItem('user');
// Function to get the token from localStorage
const getToken = () => {
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

console.log(user,'localstorage')
// Common payload fields for POST requests
export const commonPayloadFields = {
  createdBy: user ? JSON.parse(user).primary_phone:'APPLICATION',
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
      'Authorization':`Bearer ${getToken()}`
    }
  }).catch(handleAuthenticationError);
};

// GET method
const get = (url,payload) => {
  return axios({
    method: "get",
    url: BASE_URL + `${url}`,
    params: payload,
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
