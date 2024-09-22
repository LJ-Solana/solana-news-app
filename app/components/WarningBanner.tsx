import React from 'react';

const WarningBanner: React.FC = () => {
  return (
    <div className="bg-amber-100 text-gray-800 p-4 text-center">
      <p>
        Warning: This protocol is pre-audit. Use at your own risk.
      </p>
    </div>
  );
};

export default WarningBanner;
