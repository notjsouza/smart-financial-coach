const AI_HANDLER_URL = process.env.NEXT_PUBLIC_AI_HANDLER_URL || 'https://your-ai-lambda-url.lambda-url.us-west-1.on.aws';

export interface EnhancedInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  impact: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'subscriptions' | 'spending' | 'savings' | 'budgeting';
  source: 'ai' | 'rules';
  confidence: number;
}

export interface FinancialAnalysisData {
  totalMonthlySpending: number;
  subscriptions: Array<{
    name: string;
    amount: number;
    frequency: string;
    category: string;
    confidence: string;
  }>;
  topTransactions: Array<{
    description: string;
    amount: number;
    category: string;
    date: string;
  }>;
  spendingByCategory: Record<string, number>;
}

export class OpenAIFinancialService {
  private static instance: OpenAIFinancialService;
  
  public static getInstance(): OpenAIFinancialService {
    if (!OpenAIFinancialService.instance) {
      OpenAIFinancialService.instance = new OpenAIFinancialService();
    }
    return OpenAIFinancialService.instance;
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const url = `${AI_HANDLER_URL}/health`;      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();      
      const available = data.openaiAvailable === true;      
      return available;
    } catch (error) {
      console.error('❌ [OpenAI Service] Failed to check AI service availability:', error);
      return false;
    }
  }

  public async generateEnhancedInsights(data: FinancialAnalysisData): Promise<EnhancedInsight[]> {
    try {
      const response = await fetch(`${AI_HANDLER_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.insights || [];

    } catch (error) {
      console.error('OpenAI Analysis Error:', error);
      return [];
    }
  }

  public async askFinancialQuestion(question: string, context: FinancialAnalysisData): Promise<string> {
    try {
      const response = await fetch(`${AI_HANDLER_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ question, context }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.response || "I couldn't generate a response. Please try again.";

    } catch (error) {
      console.error('OpenAI Question Error:', error);
      return "Sorry, I encountered an error processing your question. Please try again.";
    }
  }
}

export const openaiService = OpenAIFinancialService.getInstance();
