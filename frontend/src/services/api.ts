import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  LoginCredentials, 
  RegisterData, 
  TransactionFormData, 
  TransferFormData, 
  TreasuryFormData,
  User,
  Treasury,
  Transaction,
  FinancialSummary,
  TreasuryPerformance,
  TrendData,
  UserActivity,
  PaginatedResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse = await this.api.get('/auth/profile');
    return response.data;
  }

  // Treasury endpoints
  async getTreasuries(): Promise<ApiResponse<Treasury[]>> {
    const response: AxiosResponse = await this.api.get('/treasuries');
    return response.data;
  }

  async getTreasury(id: number): Promise<ApiResponse<Treasury>> {
    const response: AxiosResponse = await this.api.get(`/treasuries/${id}`);
    return response.data;
  }

  async createTreasury(treasuryData: TreasuryFormData): Promise<ApiResponse<Treasury>> {
    const response: AxiosResponse = await this.api.post('/treasuries', treasuryData);
    return response.data;
  }

  async updateTreasury(id: number, treasuryData: Partial<TreasuryFormData>): Promise<ApiResponse<Treasury>> {
    const response: AxiosResponse = await this.api.put(`/treasuries/${id}`, treasuryData);
    return response.data;
  }

  async getTreasuryBalance(id: number): Promise<ApiResponse<{ balance: number }>> {
    const response: AxiosResponse = await this.api.get(`/treasuries/${id}/balance`);
    return response.data;
  }

  async getTreasuryTransactions(
    id: number, 
    params?: { page?: number; limit?: number; type?: string }
  ): Promise<PaginatedResponse<Transaction>> {
    const response: AxiosResponse = await this.api.get(`/treasuries/${id}/transactions`, { params });
    return response.data;
  }

  // Transaction endpoints
  async deposit(transactionData: TransactionFormData): Promise<ApiResponse<{ transaction: Transaction; new_balance: number }>> {
    const response: AxiosResponse = await this.api.post('/transactions/deposit', transactionData);
    return response.data;
  }

  async withdraw(transactionData: TransactionFormData): Promise<ApiResponse<{ transaction: Transaction; new_balance: number }>> {
    const response: AxiosResponse = await this.api.post('/transactions/withdraw', transactionData);
    return response.data;
  }

  async transfer(transferData: TransferFormData): Promise<ApiResponse<{
    from_transaction: Transaction;
    to_transaction: Transaction;
    from_new_balance: number;
    to_new_balance: number;
  }>> {
    const response: AxiosResponse = await this.api.post('/transactions/transfer', transferData);
    return response.data;
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    treasury_id?: number;
    start_date?: string;
    end_date?: string;
    user_id?: number;
  }): Promise<PaginatedResponse<Transaction>> {
    const response: AxiosResponse = await this.api.get('/transactions', { params });
    return response.data;
  }

  async getTransaction(id: number): Promise<ApiResponse<Transaction>> {
    const response: AxiosResponse = await this.api.get(`/transactions/${id}`);
    return response.data;
  }

  // Reports endpoints
  async getFinancialSummary(params?: { start_date?: string; end_date?: string }): Promise<ApiResponse<{
    summary: FinancialSummary;
    treasuries: Treasury[];
    recent_transactions: Transaction[];
  }>> {
    const response: AxiosResponse = await this.api.get('/reports/summary', { params });
    return response.data;
  }

  async getTreasuryPerformance(params?: { start_date?: string; end_date?: string }): Promise<ApiResponse<TreasuryPerformance[]>> {
    const response: AxiosResponse = await this.api.get('/reports/treasury-performance', { params });
    return response.data;
  }

  async getTrends(params?: { period?: string; start_date?: string; end_date?: string }): Promise<ApiResponse<TrendData[]>> {
    const response: AxiosResponse = await this.api.get('/reports/trends', { params });
    return response.data;
  }

  async getUserActivity(params?: { start_date?: string; end_date?: string }): Promise<ApiResponse<UserActivity[]>> {
    const response: AxiosResponse = await this.api.get('/reports/user-activity', { params });
    return response.data;
  }
}

export default new ApiService();