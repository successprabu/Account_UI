import axios from "axios";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create();

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
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('user');
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );
};

export { axiosInstance, setupInterceptors };
