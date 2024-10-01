import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Article {
  id: string;
  endTime: number;
}

interface TimeCountDownToastProps {
  articles: Article[];
}

const TimeCountDownToast: React.FC<TimeCountDownToastProps> = ({ articles }) => {
  const [shownToasts, setShownToasts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds

      articles.forEach(article => {
        const timeRemaining = article.endTime - now;

        if (timeRemaining <= 3600 && timeRemaining > 0 && !shownToasts.has(article.id)) {
          setShownToasts(prev => new Set(prev).add(article.id));
          toast.info(`Less than 1 hour left to rate article ${article.id}!`, {
            position: "bottom-right",
            autoClose: 5000, // Close after 10 seconds
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } else if (timeRemaining <= 0 && shownToasts.has(article.id)) {
          setShownToasts(prev => {
            const newSet = new Set(prev);
            newSet.delete(article.id);
            return newSet;
          });
        }
      });
    };

    const timer = setInterval(checkTimeRemaining, 60000); // Check every minute

    checkTimeRemaining(); // Check immediately on mount

    return () => clearInterval(timer); // Clean up on unmount
  }, [articles, shownToasts]);

  return <ToastContainer />;
};

export default TimeCountDownToast;
