import React, { useState, useEffect } from 'react';
import { Treasury, TransactionFormData, TransferFormData } from '../../types';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import apiService from '../../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  treasury: Treasury | null;
  type: 'deposit' | 'withdraw' | 'transfer' | null;
  onSuccess: (transaction: any) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  treasury,
  type,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<TransactionFormData | TransferFormData>({
    treasury_id: 0,
    amount: 0,
    description: '',
    reference_number: '',
  });
  const [transferData, setTransferData] = useState<TransferFormData>({
    from_treasury_id: 0,
    to_treasury_id: 0,
    amount: 0,
    description: '',
    reference_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [treasuries, setTreasuries] = useState<Treasury[]>([]);

  useEffect(() => {
    if (isOpen && treasury) {
      if (type === 'transfer') {
        setTransferData({
          from_treasury_id: treasury.id,
          to_treasury_id: 0,
          amount: 0,
          description: '',
          reference_number: '',
        });
      } else {
        setFormData({
          treasury_id: treasury.id,
          amount: 0,
          description: '',
          reference_number: '',
        });
      }
      setError('');
      setSuccess('');
      loadTreasuries();
    }
  }, [isOpen, treasury, type]);

  const loadTreasuries = async () => {
    try {
      const response = await apiService.getTreasuries();
      if (response.success && response.data) {
        setTreasuries(response.data);
      }
    } catch (error) {
      console.error('Error loading treasuries:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (type === 'transfer') {
      setTransferData(prev => ({
        ...prev,
        [name]: name === 'amount' ? parseFloat(value) || 0 : value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'amount' ? parseFloat(value) || 0 : value
      }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (type === 'deposit') {
        response = await apiService.deposit(formData as TransactionFormData);
      } else if (type === 'withdraw') {
        response = await apiService.withdraw(formData as TransactionFormData);
      } else if (type === 'transfer') {
        response = await apiService.transfer(transferData);
      }

      if (response?.success) {
        setSuccess('تم تنفيذ العملية بنجاح');
        onSuccess(response.data);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(response?.message || 'حدث خطأ في تنفيذ العملية');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تنفيذ العملية');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'deposit':
        return 'إيداع أموال';
      case 'withdraw':
        return 'سحب أموال';
      case 'transfer':
        return 'تحويل أموال';
      default:
        return 'عملية مالية';
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'deposit':
        return 'إيداع';
      case 'withdraw':
        return 'سحب';
      case 'transfer':
        return 'تحويل';
      default:
        return 'تنفيذ';
    }
  };

  if (!isOpen || !treasury || !type) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {getTitle()}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="mr-3">
                      <h3 className="text-sm font-medium text-red-800">
                        خطأ
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="mr-3">
                      <h3 className="text-sm font-medium text-green-800">
                        نجح
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        {success}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {type === 'transfer' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        من الخزينة
                      </label>
                      <select
                        name="from_treasury_id"
                        value={transferData.from_treasury_id}
                        onChange={handleInputChange}
                        className="mt-1 input"
                        required
                      >
                        <option value="">اختر الخزينة المصدر</option>
                        {treasuries.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} - {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(t.balance)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        إلى الخزينة
                      </label>
                      <select
                        name="to_treasury_id"
                        value={transferData.to_treasury_id}
                        onChange={handleInputChange}
                        className="mt-1 input"
                        required
                      >
                        <option value="">اختر الخزينة الهدف</option>
                        {treasuries.filter(t => t.id !== transferData.from_treasury_id).map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} - {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(t.balance)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      الخزينة
                    </label>
                    <input
                      type="text"
                      value={treasury.name}
                      className="mt-1 input bg-gray-50"
                      disabled
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    المبلغ
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={type === 'transfer' ? transferData.amount : formData.amount}
                    onChange={handleInputChange}
                    className="mt-1 input"
                    placeholder="أدخل المبلغ"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    الوصف (اختياري)
                  </label>
                  <textarea
                    name="description"
                    value={type === 'transfer' ? transferData.description : formData.description}
                    onChange={handleInputChange}
                    className="mt-1 input"
                    rows={3}
                    placeholder="أدخل وصف للعملية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    رقم المرجع (اختياري)
                  </label>
                  <input
                    type="text"
                    name="reference_number"
                    value={type === 'transfer' ? transferData.reference_number : formData.reference_number}
                    onChange={handleInputChange}
                    className="mt-1 input"
                    placeholder="أدخل رقم المرجع"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري التنفيذ...
                  </div>
                ) : (
                  getButtonText()
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;