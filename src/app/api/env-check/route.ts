import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  return NextResponse.json({
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseAnonKey,
    hasGeminiKey: !!geminiApiKey,
    supabaseUrlLength: supabaseUrl?.length || 0,
    supabaseKeyLength: supabaseAnonKey?.length || 0,
    geminiKeyLength: geminiApiKey?.length || 0,
    supabaseUrlStart: supabaseUrl?.substring(0, 20) || 'Not found',
  })
}
