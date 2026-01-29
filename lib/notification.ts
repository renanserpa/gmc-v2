import { toast, ToastOptions } from 'react-toastify';
import { uiSounds } from './uiSounds.ts';

const defaultOptions: ToastOptions = {
    position: "bottom-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
};

export const notify = {
    success: (message: string, options: ToastOptions = {}) => {
        uiSounds.playSuccess();
        toast.success(message, { ...defaultOptions, ...options });
    },
    error: (message: string, options: ToastOptions = {}) => {
        uiSounds.playError();
        toast.error(message, { ...defaultOptions, ...options });
    },
    info: (message: string, options: ToastOptions = {}) => {
        uiSounds.playClick();
        toast.info(message, { ...defaultOptions, ...options });
    },
    warning: (message: string, options: ToastOptions = {}) => {
        uiSounds.playHover();
        toast.warn(message, { ...defaultOptions, ...options });
    }
};