import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// Configure route for dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    
    const db = getDb()
    
    let clients
    if (search && search.trim()) {
      // Search by name or phone
      const searchTerm = search.trim()
      clients = await db.customer.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        select: { 
          id: true, 
          name: true, 
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true 
        },
        orderBy: { updatedAt: 'desc' }
      })
    } else {
      // Get all clients
      clients = await db.customer.findMany({
        select: { 
          id: true, 
          name: true, 
          phone: true,
          address: true,
          createdAt: true,
          updatedAt: true 
        },
        orderBy: { updatedAt: 'desc' }
      })
    }
    
    return NextResponse.json(clients)
  } catch (e) {
    console.error('GET /api/clients/list error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}