import React, { useState } from 'react';
import { useTreasury } from 'contexts/TreasuryContext';
import { useAuth } from 'contexts/AuthContext';
import TreasuryCard from 'components/Treasury/TreasuryCard';
import TransactionModal from 'components/Treasury/TransactionModal';
import { Treasury } from 'types';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown,
  DollarSign,
  Activity,
  Users,
  BarChart3
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { treasuries, summary, loading, error } = useTreasury();
  const { user } = useAuth();
  const [selectedTreasury, setSelectedTreasury] = useState<Treasury | null>(null);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const handleDeposit = (treasury: Treasury) => {
    setSelectedTreasury(treasury);
    setModalType('deposit');
    setIsModalOpen(true);
  };

  const handleWithdraw = (treasury: Treasury) => {
    setSelectedTreasury(treasury);
    setModalType('withdraw');
    setIsModalOpen(true);
  };

  const handleTransfer = (treasury: Treasury) => {
    setSelectedTreasury(treasury);
    setModalType('transfer');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTreasury(null);
    setModalType(null);
  };

  const handleTransactionSuccess = (data: any) => {
    // Refresh data after successful transaction
    window.location.reload();
  };

  const mainTreasury = treasuries.find(t => t.type === 'main');
  const subTreasuries = treasuries.filter(t => t.type === 'sub');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="mr-3">
            <h3 className="text-sm font-medium text-red-800">
              خطأ في تحميل البيانات
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          مرحباً، {user?.username}
        </h1>
        <p className="text-primary-100">
          إدارة شاملة للخزائن والعمليات المالية
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">إجمالي الرصيد</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.total_balance)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 bg-success-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-success-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">إجمالي الإيداعات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.total_deposits)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-danger-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">إجمالي السحوبات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.total_withdrawals)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Activity className="h-6 w-6 text-warning-600" />
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-600">إجمالي المعاملات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summary.total_transactions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Treasury */}
      {mainTreasury && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            الخزينة الرئيسية
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <TreasuryCard
              treasury={mainTreasury}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onTransfer={handleTransfer}
            />
          </div>
        </div>
      )}

      {/* Sub Treasuries */}
      {subTreasuries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            الخزائن الفرعية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subTreasuries.map((treasury) => (
              <TreasuryCard
                key={treasury.id}
                treasury={treasury}
                onDeposit={handleDeposit}
                onWithdraw={handleWithdraw}
                onTransfer={handleTransfer}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            الإجراءات السريعة
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/transactions'}
              className="btn btn-primary flex items-center justify-center"
            >
              <ArrowUpDown className="h-5 w-5 ml-2" />
              عرض جميع المعاملات
            </button>
            
            <button
              onClick={() => window.location.href = '/reports'}
              className="btn btn-secondary flex items-center justify-center"
            >
              <BarChart3 className="h-5 w-5 ml-2" />
              التقارير المالية
            </button>
            
            {user?.role === 'admin' && (
              <button
                onClick={() => window.location.href = '/treasuries'}
                className="btn btn-warning flex items-center justify-center"
              >
                <Wallet className="h-5 w-5 ml-2" />
                إدارة الخزائن
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        treasury={selectedTreasury}
        type={modalType}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default Dashboard;