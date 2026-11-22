import { jwtDecode } from 'jwt-decode';

/** The signed-in user from this browser, or null when nobody is signed in or the login has expired. */
export const currentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) return null;
    const { exp } = jwtDecode(user.token);
    return exp && exp * 1000 > Date.now() ? user : null;
  } catch (e) {
    return null;
  }
};

/** Signs out and goes to the login page, which says the session ended (used when the login has expired). */
export const endSession = () => {
  try {
    localStorage.removeItem('user');
  } catch (e) {
    // storage blocked: nothing to remove
  }
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.replace('/login?session=expired');
  }
};

let watching = false;
/**
 * Every API call goes through axios: when the API answers 401 to a signed-in request (expired or invalid
 * login), sign out and go to the login page instead of showing "session ended" on the screen.
 */
export const watchSession = (client) => {
  if (watching || !client?.interceptors?.response?.use) return;
  watching = true;
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const headers = error?.config?.headers || {};
      const auth = headers.Authorization || headers.authorization || '';
      if (error?.response?.status === 401 && /^Bearer\s+\S+/.test(String(auth))) endSession();
      return Promise.reject(error);
    }
  );
};

/** Milliseconds until the current login expires, or null when nobody is signed in. */
export const msUntilExpiry = () => {
  const user = currentUser();
  if (!user) return null;
  try {
    return jwtDecode(user.token).exp * 1000 - Date.now();
  } catch (e) {
    return null;
  }
};
