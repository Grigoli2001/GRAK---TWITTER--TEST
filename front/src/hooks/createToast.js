import { toast } from 'react-toastify';
import { FaExclamationCircle } from 'react-icons/fa';
import { FaCircleCheck, FaCircleXmark, FaCircleInfo } from 'react-icons/fa6';

export const createToast = (message, type, customClassName, options) => {
    // use options to override default toast options

    let caller;
    let icon;
    switch (type) {
        case 'success':
            caller = toast.success;
            icon = <FaCircleCheck/>;
            break;
        case 'error':
            caller = toast.error;
            icon = <FaCircleXmark/>;
            break;
        case 'warn':
            caller = toast.warn;
            icon = <FaExclamationCircle/>;
            break;
        default:
            caller = toast.info;
            icon = <FaCircleInfo/>;
            break;
    }

    if ( typeof options?.limit === 'number' && customClassName) {
        if (document.querySelectorAll(`.${customClassName}`).length >= options.limit) return;
    }

    caller(message, {
        position: "bottom-center",
        icon: icon,
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: `${customClassName} !bg-twitter-blue !text-white`,
        ...options
        });
}
