// ==========================================
// QPAY CLIENT - QPay V2 API Integration
// API Base: https://merchant.qpay.mn/v2
// ==========================================

import axios, { AxiosInstance } from 'axios';

// ==========================================
// TYPES
// ==========================================

interface QPayAuthResponse {
  token_type: string;
  refresh_expires_in: number;
  refresh_token: string;
  access_token: string;
  expires_in: number;
  scope: string;
  session_state: string;
}

interface QPayInvoiceRequest {
  invoice_code: string;
  sender_invoice_no: string;
  invoice_receiver_code: string;
  invoice_description: string;
  amount: number;
  callback_url: string;
}

interface QPayBankAccount {
  name: string;
  description: string;
  logo: string;
  link: string;
}

interface QPayInvoiceResponse {
  invoice_id: string;
  qr_text: string;
  qr_image: string; // Base64 encoded QR image
  qPay_shortUrl: string;
  urls: QPayBankAccount[];
}

interface QPayPaymentCheckRequest {
  object_type: string;
  object_id: string;
  offset?: {
    page_number: number;
    page_limit: number;
  };
}

interface QPayPaymentRow {
  payment_id: string;
  payment_status: string;
  payment_date: string;
  payment_fee: string;
  payment_amount: string;
  payment_currency: string;
  payment_wallet: string;
  transaction_type: string;
}

interface QPayPaymentCheckResponse {
  count: number;
  paid_amount: number;
  rows: QPayPaymentRow[];
}

// ==========================================
// QPAY CLIENT CLASS
// ==========================================

class QPay {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private refreshExpiresAt: number = 0;

  private readonly username: string;
  private readonly password: string;
  private readonly invoiceCode: string;
  private readonly callbackUrl: string;

  constructor() {
    const baseURL = process.env.QPAY_API_URL || 'https://qr.qpay.mn/v1';
    this.username = process.env.QPAY_USERNAME || '';
    this.password = process.env.QPAY_PASSWORD || '';
    this.invoiceCode = process.env.QPAY_INVOICE_CODE || '';
    this.callbackUrl = process.env.QPAY_CALLBACK_URL || '';

    if (!this.username || !this.password || !this.invoiceCode) {
      console.warn('⚠️  QPay credentials not configured. Set QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE in .env');
    }

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  /**
   * Get access token using username/password
   */
  private async authenticate(): Promise<string> {
    try {
      const response = await this.client.post<QPayAuthResponse>(
        '/auth/token',
        {},
        {
          auth: {
            username: this.username,
            password: this.password,
          },
        }
      );

      const data = response.data;
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      // Token expires_in is in seconds, convert to ms and subtract 60s buffer
      this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
      this.refreshExpiresAt = Date.now() + (data.refresh_expires_in - 60) * 1000;

      console.log('✅ QPay authenticated successfully');
      return this.accessToken;
    } catch (error: any) {
      console.error('❌ QPay authentication failed:', error?.response?.data || error.message);
      throw new Error('QPay authentication failed');
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken || Date.now() >= this.refreshExpiresAt) {
      // Refresh token expired, do full auth
      return this.authenticate();
    }

    try {
      const response = await this.client.post<QPayAuthResponse>(
        '/auth/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${this.refreshToken}`,
          },
        }
      );

      const data = response.data;
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
      this.refreshExpiresAt = Date.now() + (data.refresh_expires_in - 60) * 1000;

      return this.accessToken;
    } catch (error) {
      // Refresh failed, try full auth
      return this.authenticate();
    }
  }

  /**
   * Get a valid access token (auto-refresh if needed)
   */
  private async getToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (this.refreshToken && Date.now() < this.refreshExpiresAt) {
      return this.refreshAccessToken();
    }

    return this.authenticate();
  }

  /**
   * Make authenticated API call
   */
  private async authRequest<T>(method: 'GET' | 'POST' | 'DELETE', url: string, data?: any): Promise<T> {
    const token = await this.getToken();

    try {
      const response = await this.client.request<T>({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      // If 401, try re-auth once
      if (error?.response?.status === 401) {
        this.accessToken = null;
        const newToken = await this.authenticate();
        const response = await this.client.request<T>({
          method,
          url,
          data,
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        return response.data;
      }
      throw error;
    }
  }

  // ==========================================
  // INVOICE OPERATIONS
  // ==========================================

  /**
   * Create a QPay invoice and get QR code
   */
  async createInvoice(params: {
    senderInvoiceNo: string;
    invoiceReceiverCode: string;
    description: string;
    amount: number;
  }): Promise<QPayInvoiceResponse> {
    const body: QPayInvoiceRequest = {
      invoice_code: this.invoiceCode,
      sender_invoice_no: params.senderInvoiceNo,
      invoice_receiver_code: params.invoiceReceiverCode,
      invoice_description: params.description,
      amount: params.amount,
      callback_url: `${this.callbackUrl}?invoice_id=${params.senderInvoiceNo}`,
    };

    console.log('📄 Creating QPay invoice:', {
      invoice_code: this.invoiceCode,
      sender_invoice_no: params.senderInvoiceNo,
      amount: params.amount,
    });

    const result = await this.authRequest<QPayInvoiceResponse>('POST', '/invoice', body);

    console.log('✅ QPay invoice created:', result.invoice_id);
    return result;
  }

  /**
   * Check payment status for an invoice
   */
  async checkPayment(invoiceId: string): Promise<QPayPaymentCheckResponse> {
    const body: QPayPaymentCheckRequest = {
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    };

    const result = await this.authRequest<QPayPaymentCheckResponse>('POST', '/payment/check', body);
    return result;
  }

  /**
   * Cancel/delete an invoice
   */
  async cancelInvoice(invoiceId: string): Promise<void> {
    try {
      await this.authRequest<void>('DELETE', `/invoice/${invoiceId}`);
      console.log('🗑️ QPay invoice cancelled:', invoiceId);
    } catch (error: any) {
      console.error('⚠️ QPay cancel invoice failed:', error?.response?.data || error.message);
      // Don't throw - cancellation failure shouldn't break the flow
    }
  }

  /**
   * Check if QPay is properly configured
   */
  isConfigured(): boolean {
    return !!(this.username && this.password && this.invoiceCode);
  }
}

// ==========================================
// SINGLETON INSTANCE
// ==========================================

const qpay = new QPay();

export default qpay;
export type {
  QPayInvoiceResponse,
  QPayPaymentCheckResponse,
  QPayPaymentRow,
  QPayBankAccount,
};
