import React from 'react';

const WarningBanner: React.FC = () => {
  return (
    <div className="bg-yellow-400 text-gray-800 p-4 text-center z-1000">
      <p>
        Warning: This protocol is pre-audit. Use at your own risk.
      </p>
    </div>
  );
};

export default WarningBanner;
