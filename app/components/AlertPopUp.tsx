import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AlertPopupProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const toastId = toast[type](message, {
      position: "bottom-left",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      onClose: onClose,
    });

    return () => {
      toast.dismiss(toastId);
    };
  }, [message, type, onClose]);

  return <ToastContainer />;
};

export default AlertPopup;
