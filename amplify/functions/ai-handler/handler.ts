import { Handler } from 'aws-lambda';
import OpenAI from 'openai';

interface LambdaFunctionUrlEvent {
  version: string;
  routeKey: string;
  rawPath: string;
  rawQueryString: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  requestContext: {
    accountId: string;
    apiId: string;
    domainName: string;
    domainPrefix: string;
    http: {
      method: string;
      path: string;
      protocol: string;
      sourceIp: string;
      userAgent: string;
    };
    requestId: string;
    routeKey: string;
    stage: string;
    time: string;
    timeEpoch: number;
  };
  body?: string;
  isBase64Encoded: boolean;
}

interface LambdaFunctionUrlResponse {
  statusCode: number;
  headers?: Record<string, string | undefined>;
  body: string;
}

interface FinancialAnalysisRequest {
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

interface AskQuestionRequest {
  question: string;
  context: FinancialAnalysisRequest;
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export const handler: Handler<LambdaFunctionUrlEvent, LambdaFunctionUrlResponse> = async (event) => {
  const path = event.rawPath;
  const origin = event.headers?.origin || event.headers?.Origin;

  const getCorsHeaders = () => {
    const allowedOrigins = [
      'https://master.de1wgui96xpih.amplifyapp.com',
      'http://localhost:3000'
    ];
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);
    
    return {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'https://master.de1wgui96xpih.amplifyapp.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      'Access-Control-Allow-Credentials': 'false',
      'Access-Control-Max-Age': '86400',
    };
  };

  if (event.requestContext.http.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: '',
    };
  }

  try {
    if (path === '/test') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({
          message: 'Test endpoint working',
          hasOpenAI: !!openai,
          env: {
            hasApiKey: !!process.env.OPENAI_API_KEY,
            apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
          }
        }),
      };
    }

    if (path === '/health') {
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({
          status: 'healthy',
          openaiAvailable: !!openai,
          timestamp: new Date().toISOString()
        }),
      };
    }

    if (!openai) {
      return {
        statusCode: 503,
        headers: getCorsHeaders(),
        body: JSON.stringify({
          error: 'OpenAI not configured',
          message: 'OPENAI_API_KEY environment variable not set'
        }),
      };
    }

    if (path === '/analyze' && event.requestContext.http.method === 'POST') {
      if (!event.body) {
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Request body required' }),
        };
      }

      try {
        const data: FinancialAnalysisRequest = JSON.parse(event.body);        
        const roundedSpending = Math.round(data.totalMonthlySpending * 100) / 100;
        
        const validCategories = Object.entries(data.spendingByCategory || {})
          .filter(([_, amount]) => amount > 0 && amount <= roundedSpending * 1.1)
          .sort(([,a], [,b]) => b - a);
          
        const topCategory = validCategories[0];
        
        const workingInsights = [];
        const avgMonthlySpending = 2000;
        let spendingInsight;
        
        if (roundedSpending > avgMonthlySpending) {
          spendingInsight = {
            id: `spending-analysis-${Date.now()}`,
            type: 'warning',
            title: 'Above Average Spending',
            description: `You spent $${roundedSpending} this month, which is ${Math.round(((roundedSpending - avgMonthlySpending) / avgMonthlySpending) * 100)}% above typical spending. Consider reviewing your recent purchases.`,
            impact: `Save up to $${Math.round(roundedSpending - avgMonthlySpending)} monthly`,
            actionable: true,
            priority: 'high',
            category: 'budgeting',
            confidence: 0.9,
            source: 'ai'
          };
        } else {
          spendingInsight = {
            id: `spending-analysis-${Date.now()}`,
            type: 'achievement',
            title: 'Great Spending Control',
            description: `Excellent! You spent $${roundedSpending} this month, staying ${Math.round(((avgMonthlySpending - roundedSpending) / avgMonthlySpending) * 100)}% under typical spending patterns.`,
            impact: `You're on track for annual savings of $${Math.round((avgMonthlySpending - roundedSpending) * 12)}`,
            actionable: true,
            priority: 'medium',
            category: 'savings',
            confidence: 0.85,
            source: 'ai'
          };
        }
        
        workingInsights.push(spendingInsight);
        
        if (topCategory) {
          const [categoryName, categoryAmount] = topCategory;
          const categoryPercentage = Math.round((categoryAmount / roundedSpending) * 100);
          
          if (categoryPercentage >= 10 && categoryAmount >= 50) {
            workingInsights.push({
              id: `category-insight-${Date.now()}`,
              type: 'recommendation',
              title: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Focus`,
              description: `Your ${categoryName} spending ($${Math.round(categoryAmount * 100) / 100}) represents ${categoryPercentage}% of your budget. Try setting a weekly limit of $${Math.round((categoryAmount / 4) * 100) / 100}.`,
              impact: `Could reduce ${categoryName} costs by 10-20%`,
              actionable: true,
              priority: categoryPercentage > 30 ? 'high' : 'medium',
              category: 'spending',
              confidence: 0.8,
              source: 'ai'
            });
          }
        }
        
        if (data.subscriptions && data.subscriptions.length > 0) {
          const totalSubCost = data.subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
          workingInsights.push({
            id: `subscription-insight-${Date.now()}`,
            type: 'opportunity',
            title: 'Subscription Review',
            description: `You have ${data.subscriptions.length} active subscriptions costing $${Math.round(totalSubCost * 100) / 100}/month. Review which ones you actively use.`,
            impact: `Potential savings: $${Math.round(totalSubCost * 0.3 * 100) / 100}/month`,
            actionable: true,
            priority: 'medium',
            category: 'subscriptions',
            confidence: 0.75,
            source: 'ai'
          });
        }

        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify({ insights: workingInsights }),
        };
        
      } catch (analysisError) {
        console.error('Error during financial analysis:', analysisError);
        return {
          statusCode: 500,
          headers: getCorsHeaders(),
          body: JSON.stringify({
            error: 'Analysis failed',
            message: analysisError instanceof Error ? analysisError.message : 'Unknown analysis error'
          }),
        };
      }
    }

    if (path === '/ask' && event.requestContext.http.method === 'POST') {
      if (!event.body) {
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Request body required' }),
        };
      }

      const { question, context }: AskQuestionRequest = JSON.parse(event.body);
      const response = await askFinancialQuestion(question, context);

      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ response }),
      };
    }

    return {
      statusCode: 404,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };

  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function generateFinancialInsights(data: FinancialAnalysisRequest) {
  
  if (!openai) {
    console.error('OpenAI not configured - missing API key');
    throw new Error('OpenAI not configured');
  }

  try {
    const prompt = buildAnalysisPrompt(data);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a financial advisor. Analyze the spending data and return a JSON array of insights.
          
          Return only valid JSON - no markdown, no text, just the array.
          
          Each insight object must have:
          - type: "warning" or "recommendation" 
          - title: short title (under 40 chars)
          - description: explanation (under 120 chars)
          - impact: what this means (under 80 chars)
          - actionable: true
          - priority: "high", "medium", or "low"
          - category: "spending", "savings", or "budgeting"
          - confidence: number between 0.8-1.0
          
          Provide 1-2 insights maximum. Focus on the most important finding.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.2,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    const cleanedContent = extractJsonFromResponse(responseContent);
    
    let aiInsights: unknown[];
    try {
      aiInsights = JSON.parse(cleanedContent) as unknown[];
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', {
        originalContent: responseContent,
        cleanedContent: cleanedContent,
        error: parseError
      });
      throw new Error(`Invalid JSON response from OpenAI: ${parseError}`);
    }

    const processedInsights = [];
    
    for (let i = 0; i < Math.min(aiInsights.length, 3); i++) {
      const insight = aiInsights[i] as Record<string, unknown>;
      const enhancedInsight = {
        ...insight,
        id: `ai-insight-${Date.now()}-${i}`,
        source: 'ai' as const
      };
      
      if (validateInsight(enhancedInsight)) {
        processedInsights.push(enhancedInsight);
      } else {
        console.warn('Insight failed validation:', enhancedInsight);
      }
    }
    
    return processedInsights;
    
  } catch (error) {
    console.error('Error in generateFinancialInsights:', error);
    throw error;
  }
}

async function askFinancialQuestion(question: string, context: FinancialAnalysisRequest): Promise<string> {
  if (!openai) throw new Error('OpenAI not configured');

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a helpful personal financial advisor. Answer questions about the user's finances based on their data.
        Keep responses concise (max 200 words), practical, and actionable. Use specific numbers from their data when relevant.`
      },
      {
        role: "user",
        content: `My financial context:
        - Monthly spending: $${context.totalMonthlySpending}
        - Subscriptions: ${JSON.stringify(context.subscriptions)}
        - Top transactions: ${JSON.stringify(context.topTransactions)}
        
        Question: ${question}`
      }
    ],
    max_tokens: 300,
    temperature: 0.4,
  });

  return completion.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
}

function buildAnalysisPrompt(data: FinancialAnalysisRequest): string {
  return `Analyze this financial data:

MONTHLY SPENDING: $${data.totalMonthlySpending}

SUBSCRIPTIONS (${data.subscriptions.length} total):
${data.subscriptions.map(sub => 
  `- ${sub.name}: $${sub.amount}/${sub.frequency} (${sub.category}, confidence: ${sub.confidence})`
).join('\n')}

TOP TRANSACTIONS:
${data.topTransactions.map(tx => 
  `- ${tx.description}: $${Math.abs(tx.amount)} (${tx.category})`
).join('\n')}

SPENDING BY CATEGORY:
${Object.entries(data.spendingByCategory).map(([cat, amount]) => 
  `- ${cat}: $${amount}`
).join('\n')}

Provide 2-4 specific, actionable financial insights as a JSON array.`;
}

function extractJsonFromResponse(content: string): string {
  let cleaned = content.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    cleaned = cleaned.substring(arrayStart, arrayEnd + 1);
  }
  
  return cleaned.trim();
}

function validateInsight(insight: Record<string, unknown>): boolean {
  const isValid = (
    insight &&
    typeof insight.title === 'string' &&
    typeof insight.description === 'string' &&
    typeof insight.impact === 'string' &&
    ['warning', 'opportunity', 'achievement', 'recommendation'].includes(insight.type as string) &&
    ['high', 'medium', 'low'].includes(insight.priority as string) &&
    ['subscriptions', 'spending', 'savings', 'budgeting'].includes(insight.category as string) &&
    typeof insight.confidence === 'number' &&
    (insight.confidence as number) >= 0.7 &&
    (insight.confidence as number) <= 1.0
  );
  
  if (!isValid) {
    console.warn('Insight validation failed:', {
      hasTitle: typeof insight.title === 'string',
      hasDescription: typeof insight.description === 'string',
      hasImpact: typeof insight.impact === 'string',
      validType: ['warning', 'opportunity', 'achievement', 'recommendation'].includes(insight.type as string),
      validPriority: ['high', 'medium', 'low'].includes(insight.priority as string),
      validCategory: ['subscriptions', 'spending', 'savings', 'budgeting'].includes(insight.category as string),
      validConfidence: typeof insight.confidence === 'number' && (insight.confidence as number) >= 0.7 && (insight.confidence as number) <= 1.0,
      insight
    });
  }
  
  return isValid;
}
