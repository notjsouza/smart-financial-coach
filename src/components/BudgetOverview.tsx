"use client";

import { BudgetCategory } from '../types/financial';
import { formatCurrency, getProgressPercentage, getCategoryStatus } from '../lib/utils';

interface BudgetOverviewProps {
  categories: BudgetCategory[];
}

export default function BudgetOverview({ categories }: BudgetOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under': return 'text-green-600';
      case 'near': return 'text-yellow-600';
      case 'over': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Overview</h2>
      <div className="space-y-4">
        {categories.map((category) => {
          const status = getCategoryStatus(category.spent, category.budgeted);
          const percentage = getProgressPercentage(category.spent, category.budgeted);
          
          return (
            <div key={category.name}>
              <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                <span>{category.name}</span>
                <span className={getStatusColor(status)}>
                  {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: category.color
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{Math.round(percentage)}% used</span>
                <span>{formatCurrency(category.budgeted - category.spent)} remaining</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
