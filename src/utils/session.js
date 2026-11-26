import { jwtDecode } from 'jwt-decode';
import { BASE_URL } from '../components/common/CommonApiURL';

/**
 * Sign-in session: a 30-minute access token (user.token) renewed in the background with a 30-day refresh token
 * (user.refreshToken, valid until user.refreshExpires). Each renewal gives a new refresh token; the old one stops
 * working. Logins from before refresh tokens simply last until their token expires.
 */
const readStored = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

const tokenExpiry = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp ? exp * 1000 : 0;
  } catch (e) {
    return 0;
  }
};

/** When this sign-in ends: the refresh token's end when there is one, else the access token's. */
export const sessionEndsAt = (user) => {
  if (!user?.token) return 0;
  if (user.refreshToken && user.refreshExpires) {
    const t = Date.parse(user.refreshExpires.endsWith?.('Z') ? user.refreshExpires : `${user.refreshExpires}Z`);
    if (!Number.isNaN(t)) return t;
  }
  return tokenExpiry(user.token);
};

/** The signed-in user from this browser, or null when nobody is signed in or the sign-in has ended. */
export const currentUser = () => {
  const user = readStored();
  return user?.token && sessionEndsAt(user) > Date.now() ? user : null;
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

/** Sign out on purpose: tells the API to cancel this device's refresh token, then forgets the sign-in. */
export const signOut = () => {
  const user = readStored();
  if (user?.refreshToken) {
    fetch(`${BASE_URL}Auth/Logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: user.refreshToken }),
      keepalive: true,
    }).catch(() => {});
  }
  try {
    localStorage.removeItem('user');
  } catch (e) {
    // storage blocked
  }
};

let refreshing = null;
/** Gets a new access token with the refresh token (one request at a time). Resolves to the token, or null. */
export const refreshSession = () => {
  if (refreshing) return refreshing;
  const user = readStored();
  if (!user?.refreshToken) return Promise.resolve(null);
  refreshing = fetch(`${BASE_URL}Auth/Refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: user.refreshToken }),
  })
    .then(async (r) => {
      const body = await r.json().catch(() => null);
      if (!r.ok || !body?.result || !body.data?.token) {
        // Refused (signed out elsewhere, password changed, expired): the sign-in is over.
        if (r.status === 401) endSession();
        return null;
      }
      const latest = readStored() || user;
      localStorage.setItem('user', JSON.stringify({ ...latest, ...body.data }));
      return body.data.token;
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

const isBearer = (headers) => /^Bearer\s+\S+/.test(String(headers?.Authorization || headers?.authorization || ''));
const setBearer = (headers, token) => {
  if (typeof headers?.set === 'function') headers.set('Authorization', `Bearer ${token}`);
  else headers.Authorization = `Bearer ${token}`;
};

const watched = new WeakSet();
/**
 * Every API call goes through axios. Before a signed-in call, a token about to expire is renewed first;
 * a 401 is retried once after renewing; if renewing is not possible, sign out and go to the login page.
 */
export const watchSession = (client) => {
  if (!client?.interceptors?.response?.use || watched.has(client)) return;
  watched.add(client);
  client.interceptors.request?.use?.(async (config) => {
    const headers = config.headers || {};
    if (!isBearer(headers)) return config;
    const user = readStored();
    if (user?.refreshToken && tokenExpiry(user.token) - Date.now() < 60000) {
      const token = await refreshSession();
      if (token) setBearer(headers, token);
    } else if (user?.token) {
      setBearer(headers, user.token);
    }
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error?.config;
      if (error?.response?.status === 401 && isBearer(config?.headers)) {
        if (!config._retried && readStored()?.refreshToken) {
          config._retried = true;
          const token = await refreshSession();
          if (token) {
            setBearer(config.headers, token);
            return client(config);
          }
        }
        endSession();
      }
      return Promise.reject(error);
    }
  );
};

/** Milliseconds until the sign-in ends, or null when nobody is signed in. */
export const msUntilExpiry = () => {
  const user = currentUser();
  return user ? sessionEndsAt(user) - Date.now() : null;
};
