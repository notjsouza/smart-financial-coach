'use client';

import { useState, useEffect } from 'react';
import { PlaidTransaction } from '../lib/plaid';
import { Transaction } from '../types/financial';
import SubscriptionDetector from './SubscriptionDetector';
import AIFinancialCoach from './AIFinancialCoach';

interface DetectedSubscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'biweekly';
  lastCharge: string;
  nextEstimatedCharge: string;
  merchantName: string;
  category: string;
  monthlyEquivalent: number;
  confidence: 'high' | 'medium' | 'low';
  transactions: Transaction[];
  detectionMethod: string;
  averageInterval?: number;
}

interface SmartFinancialAnalysisProps {
  transactions: PlaidTransaction[];
}

export default function SmartFinancialAnalysis({ transactions }: SmartFinancialAnalysisProps) {
  const [detectedSubscriptions, setDetectedSubscriptions] = useState<DetectedSubscription[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const convertTransactions = (plaidTransactions: PlaidTransaction[]): Transaction[] => {
    return plaidTransactions.map((pt, index) => ({
      id: index + 1,
      description: pt.name,
      amount: Math.abs(pt.amount),
      date: pt.date,
      category: pt.category?.[0] || 'Other'
    }));
  };

  const totalMonthlySpending = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  useEffect(() => {
    if (transactions.length > 0) {
      setIsAnalyzing(true);
      setDetectedSubscriptions([]);
    }
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div>
        <SubscriptionDetectorWithCallback 
          transactions={transactions} 
          onSubscriptionsDetected={setDetectedSubscriptions}
          onAnalysisComplete={() => setIsAnalyzing(false)}
        />
      </div>

      <div>
        {!isAnalyzing && (
          <AIFinancialCoach
            transactions={convertTransactions(transactions)}
            subscriptions={detectedSubscriptions}
            totalMonthlySpending={totalMonthlySpending}
          />
        )}
      </div>
    </div>
  );
}

interface SubscriptionDetectorWithCallbackProps {
  transactions: PlaidTransaction[];
  onSubscriptionsDetected: (subscriptions: DetectedSubscription[]) => void;
  onAnalysisComplete: () => void;
}

function SubscriptionDetectorWithCallback({ 
  transactions, 
  onSubscriptionsDetected, 
  onAnalysisComplete 
}: SubscriptionDetectorWithCallbackProps) {
  useEffect(() => {
    const handleSubscriptionUpdate = (event: CustomEvent<DetectedSubscription[]>) => {
      onSubscriptionsDetected(event.detail);
      onAnalysisComplete();
    };

    window.addEventListener('subscriptions-detected', handleSubscriptionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('subscriptions-detected', handleSubscriptionUpdate as EventListener);
    };
  }, [onSubscriptionsDetected, onAnalysisComplete]);

  return <SubscriptionDetector transactions={transactions} />;
}
