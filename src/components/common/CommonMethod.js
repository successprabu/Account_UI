import axios from "axios";
import { BASE_URL } from "./CommonApiURL";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const user = localStorage.getItem('user');
// Function to get the token from localStorage
const getToken = () => {
  return user ? JSON.parse(user).token : '';
};

// Common payload fields for POST requests
export const userDetail = {
  customerId: user ? JSON.parse(user).customerID : 0,
  functionId: user ? JSON.parse(user).functionId : 0,
  userType: user ? JSON.parse(user).userType : 'NU',
  userTypeDescription:user ? JSON.parse(user).userTypeDescription : 'User',
  id: user ? JSON.parse(user).id : 0,
  appName: user ? JSON.parse(user).appName : 'MOI',
  userName: user ? JSON.parse(user).name : 'Guest',
  mobile: user ? JSON.parse(user).primary_phone : '0000000000',

};
// Function to handle authentication errors
const handleAuthenticationError = (error) => {
  if (error.response && error.response.status === 401) {
    // Handle unauthorized error, e.g., redirect to login
    localStorage.removeItem('user'); // Remove user from localStorage
    window.location.href = '/login'; // Redirect to login page
  }
  return Promise.reject(error);
};

// Function to get the current date in UTC format
export const dateUTC = (date = new Date()) => new Date(new Date(date).toUTCString()).toISOString();

// Common payload fields for POST requests
export const commonPayloadFields = {
  createdBy: user ? JSON.parse(user).primary_phone : 'APPLICATION',
  createdDt: dateUTC(new Date()),
  updatedBy: user ? JSON.parse(user).primary_phone : 'APPLICATION',
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
      'Authorization': `Bearer ${getToken()}`
    }
  }).catch(handleAuthenticationError);
};

// GET method
const get = (url, payload) => {
  return axios({
    method: "get",
    url: BASE_URL + `${url}`,
    params: payload,
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  }).catch(handleAuthenticationError);
};

// put method
const postreq = (url, payload) => {
  return axios({
    method: 'post',
    url: BASE_URL + url,
    params: payload, // Send payload as query parameters
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${getToken()}`,
    },
  }).catch(handleAuthenticationError);
};

// Export API service
export const API_SERVICE = {
  post,
  get,
  postreq,
  formatDate
};
