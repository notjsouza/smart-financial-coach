"use client";

import { Account } from '../types/financial';
import { formatCurrency } from '../lib/utils';

interface OverviewCardsProps {
  account: Account;
}

export default function OverviewCards({ account }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Balance',
      value: account.balance,
      color: 'text-gray-900',
      bgColor: 'bg-white'
    },
    {
      title: 'Monthly Income',
      value: account.monthlyIncome,
      color: 'text-green-600',
      bgColor: 'bg-white'
    },
    {
      title: 'Monthly Expenses',
      value: account.monthlyExpenses,
      color: 'text-red-600',
      bgColor: 'bg-white'
    },
    {
      title: 'Monthly Savings',
      value: account.monthlySavings,
      color: 'text-blue-600',
      bgColor: 'bg-white'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.title} className={`${card.bgColor} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>
                {formatCurrency(card.value)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
