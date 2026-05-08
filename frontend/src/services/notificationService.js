import { toast } from 'react-toastify';

const defaultOptions = {
  position: 'top-right',
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
};

export function notifySuccess(message) {
  toast.success(message, defaultOptions);
}

export function notifyError(message) {
  toast.error(message, defaultOptions);
}

export function notifyInfo(message) {
  toast.info(message, defaultOptions);
}

export function notifyWarning(message) {
  toast.warn(message, defaultOptions);
}
