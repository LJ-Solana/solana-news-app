import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AlertPopupProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const toastId = toast(message, {
      type: type === 'error' ? 'error' : 'success',
      autoClose: 5000,
      onClose: onClose,
    });

    return () => toast.dismiss(toastId);
  }, [message, type, onClose]);

  return <ToastContainer position="bottom-left" />;
};

export default AlertPopup;
