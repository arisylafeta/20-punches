import { createClient } from "@/utils/supabase/client"
import { TradeFormValues } from '@/utils/types'

export async function createTrade(trade: TradeFormValues) {
  const supabase = createClient()
  console.log('Creating trade with values:', trade)
  
  // Get the current user's ID
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('Auth response:', { user, userError })
  
  if (!user) throw new Error('Not authenticated')

  const tradeData = {
    user_id: user.id,
    symbol: trade.symbol,
    type: trade.type,
    shares: trade.shares,
    price_per_share: trade.pricePerShare,
    transaction_date: trade.transactionDate.toISOString(),
  }
  console.log('Inserting trade data:', tradeData)

  const { data, error } = await supabase
    .from('trades')
    .insert([tradeData])
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    throw error
  }
  
  console.log('Trade created successfully:', data)
  return data
}

export async function getUserTrades() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('transaction_date', { ascending: false })

  if (error) throw error
  return data
}

export async function getUserPositions() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .order('symbol')

  if (error) throw error
  return data
}

export async function getTradeErrors() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('trade_errors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}