import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Treasury, Transaction, FinancialSummary } from 'types';
import apiService from 'services/api';

interface TreasuryContextType {
  treasuries: Treasury[];
  transactions: Transaction[];
  summary: FinancialSummary | null;
  loading: boolean;
  error: string | null;
  refreshTreasuries: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  updateTreasuryBalance: (treasuryId: number, newBalance: number) => void;
}

const TreasuryContext = createContext<TreasuryContextType | undefined>(undefined);

export const useTreasury = () => {
  const context = useContext(TreasuryContext);
  if (context === undefined) {
    throw new Error('useTreasury must be used within a TreasuryProvider');
  }
  return context;
};

interface TreasuryProviderProps {
  children: ReactNode;
}

export const TreasuryProvider: React.FC<TreasuryProviderProps> = ({ children }) => {
  const [treasuries, setTreasuries] = useState<Treasury[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTreasuries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTreasuries();
      
      if (response.success && response.data) {
        setTreasuries(response.data);
      } else {
        setError(response.message || 'فشل في جلب بيانات الخزائن');
      }
    } catch (error: any) {
      setError(error.message || 'خطأ في جلب بيانات الخزائن');
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTransactions({ limit: 50 });
      
      if (response.success && response.data) {
        setTransactions((response.data.transactions as Transaction[]) || []);
      } else {
        setError('فشل في جلب المعاملات');
      }
    } catch (error: any) {
      setError(error.message || 'خطأ في جلب المعاملات');
    } finally {
      setLoading(false);
    }
  };

  const refreshSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getFinancialSummary();
      
      if (response.success && response.data) {
        setSummary(response.data.summary);
      } else {
        setError(response.message || 'فشل في جلب التقرير المالي');
      }
    } catch (error: any) {
      setError(error.message || 'خطأ في جلب التقرير المالي');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const updateTreasuryBalance = (treasuryId: number, newBalance: number) => {
    setTreasuries(prev => 
      prev.map(treasury => 
        treasury.id === treasuryId 
          ? { ...treasury, balance: newBalance }
          : treasury
      )
    );
  };

  useEffect(() => {
    refreshTreasuries();
    refreshTransactions();
    refreshSummary();
  }, []);

  const value: TreasuryContextType = {
    treasuries,
    transactions,
    summary,
    loading,
    error,
    refreshTreasuries,
    refreshTransactions,
    refreshSummary,
    addTransaction,
    updateTreasuryBalance,
  };

  return (
    <TreasuryContext.Provider value={value}>
      {children}
    </TreasuryContext.Provider>
  );
};