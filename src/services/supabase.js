import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client only if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'gamble-free-auth',
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

// Auth helpers
export const signInWithEmail = async (email) => {
  if (!supabase) return { error: 'Supabase not configured' }
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    }
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) return { error: 'Supabase not configured' }
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (!supabase) return { user: null }
  
  const { data: { user } } = await supabase.auth.getUser()
  return { user }
}

// Database helpers
export const saveCheckIn = async (checkInData) => {
  if (!supabase) {
    // Fallback to localStorage if Supabase not configured
    const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]')
    const newCheckIn = { ...checkInData, id: Date.now(), created_at: new Date().toISOString() }
    checkIns.push(newCheckIn)
    localStorage.setItem('checkIns', JSON.stringify(checkIns))
    return { data: newCheckIn, error: null }
  }
  
  const { data, error } = await supabase
    .from('check_ins')
    .insert([checkInData])
    .select()
    .single()
  
  return { data, error }
}

export const getCheckIns = async (userId, days = 7) => {
  if (!supabase) {
    // Fallback to localStorage
    const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]')
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    return { 
      data: checkIns.filter(c => new Date(c.created_at) >= cutoffDate),
      error: null 
    }
  }
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString())
    .order('date', { ascending: false })
  
  return { data, error }
}

export const saveGoal = async (goalData) => {
  if (!supabase) {
    localStorage.setItem('userGoal', JSON.stringify(goalData))
    return { data: goalData, error: null }
  }
  
  const { data, error } = await supabase
    .from('goals')
    .upsert([goalData])
    .select()
    .single()
  
  return { data, error }
}

export const getGoal = async (userId) => {
  if (!supabase) {
    const goal = JSON.parse(localStorage.getItem('userGoal') || 'null')
    return { data: goal, error: null }
  }
  
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const savePlan = async (planData) => {
  if (!supabase) {
    localStorage.setItem('userPlan', JSON.stringify(planData))
    return { data: planData, error: null }
  }
  
  const { data, error } = await supabase
    .from('plans')
    .upsert([planData])
    .select()
    .single()
  
  return { data, error }
}

export const getPlan = async (userId) => {
  if (!supabase) {
    const plan = JSON.parse(localStorage.getItem('userPlan') || 'null')
    return { data: plan, error: null }
  }
  
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const logEvent = async (eventData) => {
  if (!supabase) {
    const events = JSON.parse(localStorage.getItem('events') || '[]')
    events.push({ ...eventData, timestamp: new Date().toISOString() })
    localStorage.setItem('events', JSON.stringify(events))
    return { error: null }
  }
  
  const { error } = await supabase
    .from('events')
    .insert([{
      ...eventData,
      timestamp: new Date().toISOString()
    }])
  
  return { error }
}
