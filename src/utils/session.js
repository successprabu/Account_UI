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
