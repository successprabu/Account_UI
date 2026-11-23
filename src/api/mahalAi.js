import { auth, call } from './mahal';

/** Client for AI in Mahal Management (API: MahalAiController). Same { ok, message, data } results as api/mahal. */
const R = 'MahalAi/';

/** Whether AI is switched on (an API key is set on the server). Cached for the page's life. */
let statusPromise;
export const aiStatus = () => {
  statusPromise ||= call({ method: 'get', url: `${R}Status` }).then((r) => !!(r.ok && r.data?.enabled));
  return statusPromise;
};
/** For tests. */
export const resetAiStatus = () => {
  statusPromise = undefined;
};

export const aiChat = (message, chatId, mahalId) =>
  call({ method: 'post', url: `${R}Chat`, data: { message, chatId: chatId || null, mahalId: mahalId || null }, timeout: 60000 });

export const parseBooking = (text, mahalId) =>
  call({ method: 'post', url: `${R}ParseBooking`, data: { text, mahalId: mahalId || null }, headers: auth(), timeout: 60000 });

export const listFollowUps = () => call({ method: 'get', url: `${R}FollowUps`, headers: auth() });
export const draftFollowUp = (id, lang) => call({ method: 'post', url: `${R}FollowUps/Draft`, data: { id, lang }, headers: auth(), timeout: 60000 });
export const markFollowUp = (id, status, message) => call({ method: 'post', url: `${R}FollowUps/Mark`, data: { id, status, message }, headers: auth() });
