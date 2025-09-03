export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Treasury {
  id: number;
  name: string;
  type: 'main' | 'sub';
  parent_id?: number;
  parent_name?: string;
  balance: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  has_permission?: number;
}

export interface Transaction {
  id: number;
  treasury_id: number;
  user_id: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description?: string;
  reference_number?: string;
  from_treasury_id?: number;
  to_treasury_id?: number;
  treasury_name?: string;
  user_name?: string;
  from_treasury_name?: string;
  to_treasury_name?: string;
  created_at: string;
}

export interface FinancialSummary {
  total_deposits: number;
  total_withdrawals: number;
  total_transfers_out: number;
  total_transfers_in: number;
  total_transactions: number;
  total_balance: number;
}

export interface TreasuryPerformance {
  id: number;
  name: string;
  balance: number;
  type: 'main' | 'sub';
  transaction_count: number;
  total_deposits: number;
  total_withdrawals: number;
  transfers_out: number;
  transfers_in: number;
  net_flow: number;
}

export interface TrendData {
  period: string;
  transaction_count: number;
  total_deposits: number;
  total_withdrawals: number;
  total_transfers: number;
  net_flow: number;
}

export interface UserActivity {
  id: number;
  username: string;
  email: string;
  role: string;
  transaction_count: number;
  total_deposits: number;
  total_withdrawals: number;
  total_transfers: number;
  total_amount: number;
  last_activity: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: PaginationData;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface TransactionFormData {
  treasury_id: number;
  amount: number;
  description?: string;
  reference_number?: string;
}

export interface TransferFormData {
  from_treasury_id: number;
  to_treasury_id: number;
  amount: number;
  description?: string;
  reference_number?: string;
}

export interface TreasuryFormData {
  name: string;
  type: 'main' | 'sub';
  parent_id?: number;
  description?: string;
  balance?: number;
}