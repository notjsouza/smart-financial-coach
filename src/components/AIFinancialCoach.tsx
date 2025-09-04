'use client';

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/types/financial';

// Import the DetectedSubscription type from SubscriptionDetector
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

interface FinancialInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  impact: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'subscriptions' | 'spending' | 'savings' | 'budgeting';
}

interface AIFinancialCoachProps {
  transactions: Transaction[];
  subscriptions: DetectedSubscription[];
  totalMonthlySpending: number;
}

export default function AIFinancialCoach({ 
  transactions, 
  subscriptions, 
  totalMonthlySpending 
}: AIFinancialCoachProps) {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const analyzeFinancialData = () => {
      setIsAnalyzing(true);
      const generatedInsights: FinancialInsight[] = [];

      // 1. Subscription Analysis
      const highValueSubscriptions = subscriptions.filter(sub => sub.amount > 50);
      const lowConfidenceSubscriptions = subscriptions.filter(sub => sub.confidence === 'low');
      const duplicateCategories = findDuplicateCategories(subscriptions);

      // High-value subscription warning
      if (highValueSubscriptions.length > 0) {
        const totalHighValue = highValueSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
        generatedInsights.push({
          id: 'high-value-subs',
          type: 'warning',
          title: 'High-Value Subscriptions Detected',
          description: `You have ${highValueSubscriptions.length} subscription(s) over $50/month, totaling $${totalHighValue.toFixed(2)}.`,
          impact: `Potential annual savings: $${(totalHighValue * 12).toFixed(2)}`,
          actionable: true,
          priority: 'high',
          category: 'subscriptions'
        });
      }

      // Low confidence subscriptions review
      if (lowConfidenceSubscriptions.length > 0) {
        generatedInsights.push({
          id: 'review-subs',
          type: 'opportunity',
          title: 'Subscriptions Need Review',
          description: `${lowConfidenceSubscriptions.length} detected subscriptions need verification.`,
          impact: 'Ensure accurate expense tracking',
          actionable: true,
          priority: 'medium',
          category: 'subscriptions'
        });
      }

      // Duplicate category analysis
      if (duplicateCategories.length > 0) {
        generatedInsights.push({
          id: 'duplicate-categories',
          type: 'opportunity',
          title: 'Multiple Services in Same Category',
          description: `You have multiple ${duplicateCategories.join(', ')} subscriptions.`,
          impact: 'Consider consolidating for potential savings',
          actionable: true,
          priority: 'medium',
          category: 'subscriptions'
        });
      }

      // 2. Spending Pattern Analysis
      const monthlySubscriptionTotal = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      const subscriptionPercentage = (monthlySubscriptionTotal / totalMonthlySpending) * 100;

      if (subscriptionPercentage > 30) {
        generatedInsights.push({
          id: 'high-subscription-ratio',
          type: 'warning',
          title: 'High Subscription-to-Spending Ratio',
          description: `Subscriptions represent ${subscriptionPercentage.toFixed(1)}% of your monthly spending.`,
          impact: 'Consider reducing recurring expenses',
          actionable: true,
          priority: 'high',
          category: 'budgeting'
        });
      }

      // 3. Positive reinforcement
      const streamingServices = subscriptions.filter(sub => 
        sub.category === 'Streaming' && sub.amount < 20
      );
      
      if (streamingServices.length > 0) {
        generatedInsights.push({
          id: 'smart-streaming',
          type: 'achievement',
          title: 'Smart Streaming Choices',
          description: `You're keeping streaming costs reasonable with ${streamingServices.length} affordable service(s).`,
          impact: 'Good budget management!',
          actionable: false,
          priority: 'low',
          category: 'subscriptions'
        });
      }

      // 4. AI-powered recommendations
      const recommendations = generatePersonalizedRecommendations(subscriptions);
      generatedInsights.push(...recommendations);

      setInsights(generatedInsights);
      setIsAnalyzing(false);
    };

    if (transactions.length > 0 || subscriptions.length > 0) {
      // Simulate AI processing time
      setTimeout(analyzeFinancialData, 1500);
    }
  }, [transactions, subscriptions, totalMonthlySpending]);

  const findDuplicateCategories = (subs: DetectedSubscription[]): string[] => {
    const categoryCount: Record<string, number> = {};
    subs.forEach(sub => {
      categoryCount[sub.category] = (categoryCount[sub.category] || 0) + 1;
    });
    return Object.entries(categoryCount)
      .filter(([, count]) => count > 1)
      .map(([category]) => category);
  };

  const generatePersonalizedRecommendations = (
    subs: DetectedSubscription[]
  ): FinancialInsight[] => {
    const recommendations: FinancialInsight[] = [];

    const streamingSubs = subs.filter(sub => sub.category === 'Streaming');
    if (streamingSubs.length >= 3) {
      const streamingTotal = streamingSubs.reduce((sum, sub) => sum + sub.amount, 0);
      recommendations.push({
        id: 'streaming-bundle',
        type: 'recommendation',
        title: 'Consider Streaming Bundles',
        description: `You spend $${streamingTotal.toFixed(2)}/month on ${streamingSubs.length} streaming services.`,
        impact: 'Bundles could save $10-20/month',
        actionable: true,
        priority: 'medium',
        category: 'subscriptions'
      });
    }

    const monthlyHighValueSubs = subs.filter(sub => 
      sub.amount > 20 && sub.frequency === 'monthly'
    );
    if (monthlyHighValueSubs.length > 0) {
      recommendations.push({
        id: 'annual-savings',
        type: 'recommendation',
        title: 'Switch to Annual Billing',
        description: `Consider annual payments for ${monthlyHighValueSubs.length} high-value subscription(s).`,
        impact: 'Typically save 10-20% with annual billing',
        actionable: true,
        priority: 'medium',
        category: 'savings'
      });
    }

    return recommendations;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'opportunity': return '💡';
      case 'achievement': return '🎉';
      case 'recommendation': return '🚀';
      default: return '📊';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">🤖 AI Coach Analyzing...</h3>
              <p className="text-sm text-gray-600 mt-1">
                Reviewing your financial patterns and generating personalized insights
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">🤖 AI Financial Coach</h2>
        <span className="text-sm text-gray-500">
          {insights.length} insight{insights.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Looking Good!</h3>
          <p className="text-gray-600">
            Your financial patterns look healthy. Keep up the great work!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights
            .sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            })
            .map((insight) => (
              <div
                key={insight.id}
                className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getInsightIcon(insight.type)}</span>
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                        insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.priority} priority
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{insight.description}</p>
                    <p className="text-sm font-medium text-blue-600">{insight.impact}</p>
                  </div>
                  {insight.actionable && (
                    <button className="ml-4 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">💬</span>
          <h4 className="font-semibold text-blue-900">AI Coach Summary</h4>
        </div>
        <p className="text-blue-800 text-sm">
          Based on your spending patterns, you&apos;re managing ${totalMonthlySpending.toFixed(2)}/month 
          with {subscriptions.length} tracked subscriptions. Focus on high-priority items first 
          for maximum financial impact!
        </p>
      </div>
    </div>
  );
}
