import { toast } from 'react-toastify';

/**
 * One way to show feedback messages across the app.
 *   notify.success('Saved')   notify.error('Could not save')   notify.info(...)   notify.warning(...)
 */
const base = { position: 'top-right', autoClose: 3500, hideProgressBar: true, closeOnClick: true, pauseOnHover: true };

const notify = {
  success: (msg, opts) => toast.success(msg, { ...base, ...opts }),
  error: (msg, opts) => toast.error(msg, { ...base, autoClose: 6000, ...opts }),
  info: (msg, opts) => toast.info(msg, { ...base, ...opts }),
  warning: (msg, opts) => toast.warning(msg, { ...base, ...opts }),
};

export default notify;
