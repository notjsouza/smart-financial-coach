"use client";

// Mock data for demonstration
const mockData = {
  account: {
    balance: 12847.50,
    monthlyIncome: 5200.00,
    monthlyExpenses: 3180.75,
    monthlySavings: 2019.25
  },
  recentTransactions: [
    { id: 1, description: "Grocery Store", amount: -87.42, date: "2025-09-02", category: "Food" },
    { id: 2, description: "Salary Deposit", amount: 2600.00, date: "2025-09-01", category: "Income" },
    { id: 3, description: "Electric Bill", amount: -124.50, date: "2025-08-31", category: "Utilities" },
    { id: 4, description: "Coffee Shop", amount: -15.75, date: "2025-08-30", category: "Food" },
    { id: 5, description: "Gas Station", amount: -52.30, date: "2025-08-29", category: "Transportation" }
  ],
  budgetCategories: [
    { name: "Food", budgeted: 600, spent: 342.17, color: "#10b981" },
    { name: "Transportation", budgeted: 300, spent: 185.40, color: "#3b82f6" },
    { name: "Utilities", budgeted: 250, spent: 124.50, color: "#f59e0b" },
    { name: "Entertainment", budgeted: 200, spent: 89.30, color: "#ef4444" },
    { name: "Shopping", budgeted: 400, spent: 267.85, color: "#8b5cf6" }
  ],
  financialGoals: [
    { name: "Emergency Fund", target: 10000, current: 6500, color: "#10b981" },
    { name: "Vacation", target: 3000, current: 1200, color: "#3b82f6" },
    { name: "New Car", target: 15000, current: 4800, color: "#f59e0b" }
  ]
};

function Dashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s your financial overview.</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockData.account.balance)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(mockData.account.monthlyIncome)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(mockData.account.monthlyExpenses)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Savings</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(mockData.account.monthlySavings)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
              <div className="space-y-4">
                {mockData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Overview */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Overview</h2>
              <div className="space-y-4">
                {mockData.budgetCategories.map((category) => (
                  <div key={category.name}>
                    <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                      <span>{category.name}</span>
                      <span>{formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(category.spent, category.budgeted)}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Goals */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Goals</h2>
              <div className="space-y-4">
                {mockData.financialGoals.map((goal) => (
                  <div key={goal.name}>
                    <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                      <span>{goal.name}</span>
                      <span>{Math.round(getProgressPercentage(goal.current, goal.target))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(goal.current, goal.target)}%`,
                          backgroundColor: goal.color
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">{formatCurrency(goal.current)} of {formatCurrency(goal.target)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;