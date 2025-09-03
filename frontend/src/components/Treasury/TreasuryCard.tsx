import React from 'react';
import { Treasury } from 'types';
import { Wallet, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

interface TreasuryCardProps {
  treasury: Treasury;
  onDeposit: (treasury: Treasury) => void;
  onWithdraw: (treasury: Treasury) => void;
  onTransfer: (treasury: Treasury) => void;
}

const TreasuryCard: React.FC<TreasuryCardProps> = ({
  treasury,
  onDeposit,
  onWithdraw,
  onTransfer,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const getTreasuryIcon = () => {
    if (treasury.type === 'main') {
      return <Wallet className="h-8 w-8 text-primary-600" />;
    }
    return <Wallet className="h-8 w-8 text-gray-600" />;
  };

  const getTreasuryTypeColor = () => {
    if (treasury.type === 'main') {
      return 'bg-primary-50 border-primary-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  const getTreasuryTypeBadge = () => {
    if (treasury.type === 'main') {
      return (
        <span className="badge badge-info">
          خزينة رئيسية
        </span>
      );
    }
    return (
      <span className="badge badge-secondary">
        خزينة فرعية
      </span>
    );
  };

  return (
    <div className={`card ${getTreasuryTypeColor()}`}>
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getTreasuryIcon()}
            <div className="mr-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {treasury.name}
              </h3>
              {getTreasuryTypeBadge()}
            </div>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(treasury.balance)}
            </p>
            <p className="text-sm text-gray-500">الرصيد الحالي</p>
          </div>
        </div>
      </div>

      <div className="card-body">
        {treasury.description && (
          <p className="text-sm text-gray-600 mb-4">
            {treasury.description}
          </p>
        )}

        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => onDeposit(treasury)}
            className="flex-1 btn btn-success flex items-center justify-center"
          >
            <TrendingUp className="h-4 w-4 ml-2" />
            إيداع
          </button>
          
          <button
            onClick={() => onWithdraw(treasury)}
            className="flex-1 btn btn-danger flex items-center justify-center"
            disabled={treasury.balance <= 0}
          >
            <TrendingDown className="h-4 w-4 ml-2" />
            سحب
          </button>
          
          <button
            onClick={() => onTransfer(treasury)}
            className="flex-1 btn btn-primary flex items-center justify-center"
            disabled={treasury.balance <= 0}
          >
            <ArrowUpDown className="h-4 w-4 ml-2" />
            تحويل
          </button>
        </div>
      </div>

      <div className="card-footer">
        <div className="flex justify-between text-xs text-gray-500">
          <span>آخر تحديث: {new Date(treasury.updated_at).toLocaleDateString('ar-EG')}</span>
          <span>ID: {treasury.id}</span>
        </div>
      </div>
    </div>
  );
};

export default TreasuryCard;