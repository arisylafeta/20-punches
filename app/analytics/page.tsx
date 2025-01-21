'use server'

import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart } from "@/components/ui/bar-chart"
import { format, subDays } from 'date-fns'

interface DailyStats {
  date: string
  messageCount: number
  tradeCount: number
  uniqueMessageUsers: number
  uniqueTradeUsers: number
}

interface MessageRecord {
  created_at: string
  user_id: string
}

interface TradeRecord {
  transaction_date: string
  user_id: string
}

async function getAnalytics(): Promise<DailyStats[]> {
  const supabase = await createClient()
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

  console.log('Fetching data since:', thirtyDaysAgo)

  // Get daily message counts
  const { data: messageData, error: messageError } = await supabase
    .from('conversation_history')
    .select('created_at, user_id')
    .gte('created_at', thirtyDaysAgo)
    .order('created_at')

  if (messageError) {
    console.error('Error fetching messages:', messageError)
    throw new Error(messageError.message)
  }

  console.log('Message data:', messageData?.length || 0, 'records found')

  // Get daily trade counts
  const { data: tradeData, error: tradeError } = await supabase
    .from('trades')
    .select('transaction_date, user_id')
    .gte('transaction_date', thirtyDaysAgo)
    .order('transaction_date')

  if (tradeError) {
    console.error('Error fetching trades:', tradeError)
    throw new Error(tradeError.message)
  }

  console.log('Trade data:', tradeData?.length || 0, 'records found')

  // Process data for the last 30 days
  const dailyStats = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const messages = (messageData as MessageRecord[] || []).filter(msg => 
      format(new Date(msg.created_at), 'yyyy-MM-dd') === dateStr
    )
    
    const trades = (tradeData as TradeRecord[] || []).filter(trade => 
      format(new Date(trade.transaction_date), 'yyyy-MM-dd') === dateStr
    )

    return {
      date: dateStr,
      messageCount: messages.length,
      tradeCount: trades.length,
      uniqueMessageUsers: new Set(messages.map(m => m.user_id)).size,
      uniqueTradeUsers: new Set(trades.map(t => t.user_id)).size,
    }
  }).reverse()

  console.log('Processed daily stats:', dailyStats)
  return dailyStats
}

export default async function AnalyticsPage() {
  let analytics: DailyStats[] = []
  let error: Error | null = null

  try {
    analytics = await getAnalytics()
  } catch (e) {
    console.error('Error in analytics page:', e)
    error = e as Error
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                {error.message}
              </div>
              <div className="mt-4">
                <p className="text-sm text-red-700">
                  This might be due to insufficient database permissions. Please check the server logs for more details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No data available</h3>
              <div className="mt-2 text-sm text-yellow-700">
                No analytics data was found for the past 30 days. This could mean either:
                <ul className="list-disc list-inside mt-2">
                  <li>There is no activity in the system yet</li>
                  <li>The database permissions need to be configured</li>
                  <li>The tables haven&apos;t been created yet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const chartData = {
    messages: {
      labels: analytics.map(day => format(new Date(day.date), 'MMM d')),
      datasets: [
        {
          label: 'Messages',
          data: analytics.map(day => day.messageCount),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        }
      ]
    },
    trades: {
      labels: analytics.map(day => format(new Date(day.date), 'MMM d')),
      datasets: [
        {
          label: 'Trades',
          data: analytics.map(day => day.tradeCount),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
        }
      ]
    },
    users: {
      labels: analytics.map(day => format(new Date(day.date), 'MMM d')),
      datasets: [
        {
          label: 'Users Sending Messages',
          data: analytics.map(day => day.uniqueMessageUsers),
          backgroundColor: 'rgba(245, 158, 11, 0.5)',
          borderColor: 'rgb(245, 158, 11)',
          borderWidth: 1,
        },
        {
          label: 'Users Adding Trades',
          data: analytics.map(day => day.uniqueTradeUsers),
          backgroundColor: 'rgba(139, 92, 246, 0.5)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 1,
        }
      ]
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={chartData.messages} height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={chartData.trades} height={300} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={chartData.users} height={300} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
