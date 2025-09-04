export interface Account {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface BudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  color: string;
}

export interface FinancialGoal {
  name: string;
  target: number;
  current: number;
  color: string;
}

export interface DashboardData {
  account: Account;
  recentTransactions: Transaction[];
  budgetCategories: BudgetCategory[];
  financialGoals: FinancialGoal[];
}
