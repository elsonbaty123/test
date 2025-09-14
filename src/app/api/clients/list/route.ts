import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// Configure route for dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'

export async function GET() {
  try {
    const db = getDb()
    const clients = await db.customer.findMany({
      select: { 
        id: true, 
        name: true, 
        phone: true,
        createdAt: true,
        updatedAt: true 
      },
      orderBy: { updatedAt: 'desc' }
    })
    
    return NextResponse.json(clients)
  } catch (e) {
    console.error('GET /api/clients/list error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}