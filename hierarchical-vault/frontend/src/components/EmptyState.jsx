import React from 'react';
import { 
  FolderIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  UsersIcon 
} from '@heroicons/react/24/outline';

const EmptyState = ({ 
  type = 'default',
  title = 'لا توجد بيانات',
  description = 'لم يتم العثور على أي بيانات لعرضها',
  action = null,
  className = '' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'vaults':
        return <FolderIcon className="w-16 h-16 text-gray-400" />;
      case 'projects':
        return <DocumentTextIcon className="w-16 h-16 text-gray-400" />;
      case 'reports':
        return <CurrencyDollarIcon className="w-16 h-16 text-gray-400" />;
      case 'users':
        return <UsersIcon className="w-16 h-16 text-gray-400" />;
      default:
        return <FolderIcon className="w-16 h-16 text-gray-400" />;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {getIcon()}
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 max-w-sm">{description}</p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;