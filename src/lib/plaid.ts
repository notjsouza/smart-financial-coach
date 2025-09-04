import { CONFIG } from './constants';

export interface PlaidAccount {
  account_id: string;
  name: string;
  type: string;
  subtype: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
  };
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  category: string[] | null;
  merchant_name?: string;
}

export class PlaidService {
  private static baseUrl = CONFIG.PLAID_HANDLER_URL;

  static async createLinkToken(userId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/create-link-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      console.log('Plaid createLinkToken response:', data);
      
      if (!data.success) {
        console.error('Plaid createLinkToken error:', data);
        throw new Error(data.error || 'Failed to create link token');
      }

      return data.link_token;
    } catch (error) {
      console.error('Network error calling Plaid service:', error);
      throw error;
    }
  }

  static async exchangePublicToken(publicToken: string): Promise<{ accessToken: string; itemId: string }> {
    const response = await fetch(`${this.baseUrl}/exchange-public-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_token: publicToken }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to exchange public token');
    }

    return {
      accessToken: data.access_token,
      itemId: data.item_id,
    };
  }

  static async getAccounts(accessToken: string): Promise<PlaidAccount[]> {
    const response = await fetch(`${this.baseUrl}/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get accounts');
    }

    return data.accounts;
  }

  static async getTransactions(
    accessToken: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<{ transactions: PlaidTransaction[]; accounts: PlaidAccount[] }> {
    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
      }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get transactions');
    }

    return {
      transactions: data.transactions,
      accounts: data.accounts,
    };
  }
}
