import axios from "axios";
import { watchSession } from "../../utils/session";

const axiosInstance = axios.create();
// Renews the 30-minute sign-in token in the background (see utils/session).
watchSession(axiosInstance);

const setupInterceptors = (navigate) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const user = localStorage.getItem('user');
      const token = user ? JSON.parse(user).token : '';
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401 && !localStorage.getItem('user')) {
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );
};

export { axiosInstance, setupInterceptors };
