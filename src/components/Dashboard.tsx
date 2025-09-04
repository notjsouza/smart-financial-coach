"use client";

import { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import PlaidLink from './PlaidLink';
import SubscriptionDetector from './SubscriptionDetector';
import { PlaidService, PlaidAccount, PlaidTransaction } from '../lib/plaid';

function Dashboard() {
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [plaidTransactions, setPlaidTransactions] = useState<PlaidTransaction[]>([]);
  const [isLoadingPlaidData, setIsLoadingPlaidData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    const loadPlaidData = async () => {
      const accessTokens = JSON.parse(localStorage.getItem('plaid_access_tokens') || '[]');
      if (accessTokens.length > 0) {
        setIsLoadingPlaidData(true);
        try {
          const allAccounts: PlaidAccount[] = [];
          const allTransactions: PlaidTransaction[] = [];
          
          for (const token of accessTokens) {
            const accounts = await PlaidService.getAccounts(token);
            const transactionsData = await PlaidService.getTransactions(token);
            allAccounts.push(...accounts);
            allTransactions.push(...transactionsData.transactions);
          }
          
          const uniqueAccounts = allAccounts.filter((account, index, self) => 
            index === self.findIndex(a => a.account_id === account.account_id)
          );
          
          const uniqueTransactions = allTransactions.filter((transaction, index, self) => 
            index === self.findIndex(t => t.transaction_id === transaction.transaction_id)
          );
          
          setPlaidAccounts(uniqueAccounts);
          setPlaidTransactions(uniqueTransactions);
          setCurrentPage(1);
        } catch (err) {
          console.error('Error loading Plaid data:', err);
          setError('Failed to load bank data');
        } finally {
          setIsLoadingPlaidData(false);
        }
      }
    };

    loadPlaidData();
  }, []);

  const handlePlaidSuccess = (accessToken: string) => {
    const existingTokens = JSON.parse(localStorage.getItem('plaid_access_tokens') || '[]');
    if (!existingTokens.includes(accessToken)) {
      const updatedTokens = [...existingTokens, accessToken];
      localStorage.setItem('plaid_access_tokens', JSON.stringify(updatedTokens));
    }
    
    window.location.reload();
  };

  const clearPlaidData = () => {
    localStorage.removeItem('plaid_access_tokens');
    setPlaidAccounts([]);
    setPlaidTransactions([]);
    setCurrentPage(1);
    window.location.reload();
  };

  const getTotalBalance = () => {
    return plaidAccounts.reduce((sum, account) => 
      sum + (account.balances.current || 0), 0
    );
  };

  const getCombinedTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    
    return plaidTransactions.slice(startIndex, endIndex).map(t => ({
      id: t.account_id + t.transaction_id,
      description: t.name,
      amount: t.amount,
      date: t.date,
      category: (t.category && t.category.length > 0) ? t.category[0] : 'Other'
    }));
  };

  const getTotalPages = () => Math.ceil(plaidTransactions.length / transactionsPerPage);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, getTotalPages())));

  const getMonthlyFinancials = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = plaidTransactions.filter(t => 
      new Date(t.date) >= thirtyDaysAgo
    );

    const income = recentTransactions
      .filter(t => t.amount > 0) 
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = recentTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      monthlySavings: income - expenses
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s your financial overview.</p>
        </div>

        {/* Bank Connection Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Connected Accounts</h2>
                <p className="text-gray-600">
                  {plaidAccounts.length > 0 
                    ? `${plaidAccounts.length} bank account(s) connected`
                    : 'Connect your bank account to see real financial data'
                  }
                </p>
              </div>
              <div className="flex gap-4">
                <PlaidLink 
                  userId="demo-user-123" 
                  onSuccess={handlePlaidSuccess} 
                />
                {plaidAccounts.length > 0 && (
                  <button
                    onClick={clearPlaidData}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Clear Accounts
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {isLoadingPlaidData && (
              <div className="text-center py-4">
                <p className="text-gray-600">Loading bank data...</p>
              </div>
            )}

            {plaidAccounts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plaidAccounts.map((account) => (
                  <div key={account.account_id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{account.type} • {account.subtype}</p>
                    <p className="text-lg font-semibold text-green-600 mt-2">
                      {formatCurrency(account.balances.current || 0)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalBalance())}</p>
                {plaidAccounts.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">Live bank data</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(getMonthlyFinancials().monthlyIncome)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(getMonthlyFinancials().monthlyExpenses)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(getMonthlyFinancials().monthlySavings)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                {plaidTransactions.length > 0 && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    Live bank data
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {getCombinedTransactions().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {plaidTransactions.length > transactionsPerPage && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 rounded text-sm ${
                            currentPage === page
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === getTotalPages()}
                      className={`px-3 py-1 rounded text-sm ${
                        currentPage === getTotalPages()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * transactionsPerPage + 1}-{Math.min(currentPage * transactionsPerPage, plaidTransactions.length)} of {plaidTransactions.length} transactions
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Detection Section */}
          <div>
            {(() => {
              console.log('📊 Dashboard: plaidTransactions.length =', plaidTransactions.length);
              console.log('📊 Sample transactions:', plaidTransactions.slice(0, 3));
              return null;
            })()}
            {plaidTransactions.length > 0 ? (
              <div className="mb-8">
                <SubscriptionDetector transactions={plaidTransactions} />
              </div>
            ) : (
              <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Subscription Detection</h2>
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-2">⏳ Waiting for transaction data...</div>
                  <p className="text-sm text-gray-400">
                    {isLoadingPlaidData ? 'Loading transactions...' : 'No transactions available'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;