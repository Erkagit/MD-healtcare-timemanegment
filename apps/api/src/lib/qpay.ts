// ==========================================
// QPAY V2 CLIENT - QPay Merchant API Integration
// https://merchant.qpay.mn/v2
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
// QPAY V2 CLIENT CLASS (Singleton)
// ==========================================

class QPay {
  private client: AxiosInstance | null = null;

  // Token state — timestamp-based cache
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number = 0;   // Date.now() ms when access_token expires
  private refreshExpiresAt: number = 0; // Date.now() ms when refresh_token expires

  // Mutex: prevents duplicate concurrent auth requests
  private authPromise: Promise<string> | null = null;

  // Config — lazy-loaded from env on first use (avoids import-hoisting race)
  private _username: string | null = null;
  private _password: string | null = null;
  private _invoiceCode: string | null = null;
  private _callbackUrl: string | null = null;
  private _initialized = false;

  private get username(): string {
    this.ensureInit();
    return this._username!;
  }
  private get password(): string {
    this.ensureInit();
    return this._password!;
  }
  private get invoiceCode(): string {
    this.ensureInit();
    return this._invoiceCode!;
  }
  private get callbackUrl(): string {
    this.ensureInit();
    return this._callbackUrl!;
  }

  /**
   * Lazy-init: reads env vars on first access so dotenv.config() has time to run.
   */
  private ensureInit(): void {
    if (this._initialized) return;
    this._initialized = true;

    const baseURL = process.env.QPAY_API_URL || 'https://merchant.qpay.mn/v2';
    this._username = process.env.QPAY_USERNAME || '';
    this._password = process.env.QPAY_PASSWORD || '';
    this._invoiceCode = process.env.QPAY_INVOICE_CODE || 'MDHEALTHCARE_INVOICE';
    this._callbackUrl = process.env.QPAY_CALLBACK_URL || '';

    if (!this._username || !this._password) {
      console.warn('⚠️  QPay credentials not configured. Set QPAY_USERNAME, QPAY_PASSWORD in .env');
    }

    console.log(`🔗 QPay V2 client initialized: ${baseURL} (user: ${this._username || 'NOT SET'})`);

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /** Get the axios client (lazy-initialized) */
  private getClient(): AxiosInstance {
    this.ensureInit();
    return this.client!;
  }

  // ==========================================
  // AUTHENTICATION — timestamp-based token cache with mutex
  // ==========================================

  /**
   * Save tokens and compute absolute expiry timestamps.
   * QPay returns `expires_in` in seconds; we subtract 60s buffer to avoid edge-case expiry.
   */
  private applyTokens(data: QPayAuthResponse): string {
    const now = Date.now();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    // expires_in and refresh_expires_in are in seconds — convert to ms, subtract 60s buffer
    this.tokenExpiresAt = now + (data.expires_in - 60) * 1000;
    this.refreshExpiresAt = now + (data.refresh_expires_in - 60) * 1000;
    return data.access_token;
  }

  /**
   * Full login: POST /auth/token with HTTP Basic auth (username:password).
   * QPay V2 /auth/token endpoint uses Basic authentication.
   */
  private async authenticate(): Promise<string> {
    try {
      console.log('🔐 QPay authenticating (Basic auth)...');
      const response = await this.getClient().post<QPayAuthResponse>(
        '/auth/token',
        {},
        {
          auth: {
            username: this.username,
            password: this.password,
          },
        },
      );

      console.log('✅ QPay authenticated successfully');
      return this.applyTokens(response.data);
    } catch (error: any) {
      console.error('❌ QPay authentication failed:', error?.response?.data || error.message);
      throw new Error(`QPay authentication failed: ${error?.response?.status || error.message}`);
    }
  }

  /**
   * Refresh: POST /auth/refresh with Bearer refresh_token.
   * If refresh fails, falls back to full authenticate().
   */
  private async refreshAccessToken(): Promise<string> {
    try {
      console.log('🔄 QPay refreshing token...');
      const response = await this.getClient().post<QPayAuthResponse>(
        '/auth/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${this.refreshToken}`,
          },
        },
      );

      console.log('✅ QPay token refreshed');
      return this.applyTokens(response.data);
    } catch (error: any) {
      console.warn('⚠️ QPay refresh failed, doing full auth:', error?.response?.status || error.message);
      // Refresh failed — fall back to full login
      return this.authenticate();
    }
  }

  /**
   * Get a valid access token. Mutex (authPromise) ensures only ONE concurrent auth request
   * even if multiple requests call getToken() simultaneously.
   *
   * Logic:
   *  1. access_token still valid (Date.now() < tokenExpiresAt) → return cached, no network call
   *  2. access_token expired, refresh_token still valid → call refreshAccessToken()
   *  3. both expired → call authenticate() (full login)
   */
  private async getToken(): Promise<string> {
    // 1. Still valid — return cached token instantly
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    // 2/3. Need new token — use mutex to prevent duplicate concurrent requests
    if (!this.authPromise) {
      if (this.refreshToken && Date.now() < this.refreshExpiresAt) {
        // Access expired but refresh still valid → refresh
        this.authPromise = this.refreshAccessToken().finally(() => {
          this.authPromise = null;
        });
      } else {
        // Both expired → full login
        this.authPromise = this.authenticate().finally(() => {
          this.authPromise = null;
        });
      }
    }

    return this.authPromise;
  }

  // ==========================================
  // AUTHENTICATED REQUEST HELPER
  // ==========================================

  /**
   * Make an authenticated API call. If 401 Unauthorized, invalidate the cached
   * access_token and retry once with a fresh token.
   */
  private async authRequest<T>(method: 'GET' | 'POST' | 'DELETE', url: string, data?: any): Promise<T> {
    const token = await this.getToken();

    try {
      const response = await this.getClient().request<T>({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      // On 401 — invalidate access_token and retry with fresh token
      if (error?.response?.status === 401) {
        console.warn('⚠️ QPay 401 — re-authenticating...');
        this.accessToken = null;
        this.tokenExpiresAt = 0;

        const newToken = await this.getToken();
        const response = await this.getClient().request<T>({
          method,
          url,
          data,
          headers: { Authorization: `Bearer ${newToken}` },
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
   * Create a QPay invoice — POST /invoice
   * Body follows QPay V2 "Create simple" format from Postman collection.
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
      invoice_code: body.invoice_code,
      sender_invoice_no: body.sender_invoice_no,
      amount: body.amount,
      callback_url: body.callback_url,
    });

    const result = await this.authRequest<QPayInvoiceResponse>('POST', '/invoice', body);
    console.log('✅ QPay invoice created:', result.invoice_id);
    return result;
  }

  /**
   * Check payment status — POST /payment/check
   * Body follows QPay V2 "check" format from Postman collection.
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
   * Cancel/delete an invoice — DELETE /invoice/{invoice_id}
   */
  async cancelInvoice(invoiceId: string): Promise<void> {
    try {
      await this.authRequest<void>('DELETE', `/invoice/${invoiceId}`);
      console.log('🗑️ QPay invoice cancelled:', invoiceId);
    } catch (error: any) {
      console.error('⚠️ QPay cancel invoice failed:', error?.response?.data || error.message);
      // Don't throw — cancellation failure shouldn't break the flow
    }
  }

  /**
   * Check if QPay is properly configured with required credentials
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
