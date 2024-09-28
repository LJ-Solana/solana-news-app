import React, { useState, useEffect, useCallback } from 'react';

interface CountdownTimerProps {
  startDate: Date;
  duration: number; // duration in milliseconds
  endText: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startDate, duration, endText }) => {
  const [timeLeft, setTimeLeft] = useState('');

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const endTime = startDate.getTime() + duration;
    const difference = endTime - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else {
      return endText;
    }
  }, [startDate, duration, endText]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return <span>{timeLeft}</span>;
};

export default CountdownTimer;