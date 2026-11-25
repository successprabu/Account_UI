import { call } from './mahal';

/** Client for the "Ask us" chat box on the MySuccess website (API: SupportAiController). Results are { ok, message, data }. */
const R = 'SupportAi/';

/** Whether AI answers are on (an API key is set on the server). Cached for the page's life. */
let statusPromise;
export const supportStatus = () => {
  statusPromise ||= call({ method: 'get', url: `${R}Status` }).then((r) => !!(r.ok && r.data?.enabled));
  return statusPromise;
};
/** For tests. */
export const resetSupportStatus = () => {
  statusPromise = undefined;
};

/** history: earlier messages, oldest first, as { role: 'user' | 'assistant', text }. */
export const supportChat = (message, history, page) =>
  call({ method: 'post', url: `${R}Chat`, data: { message, history, page }, timeout: 60000 });
