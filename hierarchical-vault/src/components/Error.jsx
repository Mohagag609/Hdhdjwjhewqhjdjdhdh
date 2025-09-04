import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Error = ({ 
  message = 'حدث خطأ غير متوقع', 
  onRetry = null,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">خطأ</h3>
      <p className="text-gray-600 text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
};

export default Error;