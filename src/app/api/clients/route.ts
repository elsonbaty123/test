import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// Configure route for dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const clientName = (body?.clientName || '').trim()
    const clientPhone = (body?.clientPhone || '').trim()
    const dataObj = body?.data
    if (!clientName) {
      return NextResponse.json({ error: 'اسم العميل مطلوب' }, { status: 400 })
    }
    if (!dataObj) {
      return NextResponse.json({ error: 'بيانات العميل مطلوبة' }, { status: 400 })
    }

    const db = getDb()
    const exists = await db.customer.findUnique({ where: { name: clientName } })

    const data = JSON.stringify(dataObj)
    await db.customer.upsert({
      where: { name: clientName },
      create: { name: clientName, phone: clientPhone, data },
      update: { phone: clientPhone, data }
    })

    return NextResponse.json({ ok: true, created: !exists })
  } catch (e: any) {
    console.error('POST /api/clients error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get('name')
    if (name) {
      const db = getDb()
      const item = await db.customer.findUnique({ where: { name } })
      if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      let parsed: any = null
      try { parsed = JSON.parse(item.data as unknown as string) } catch {}
      return NextResponse.json({ data: parsed })
    }
    const db = getDb()
    const items = await db.customer.findMany({
      select: { id: true, name: true, phone: true, createdAt: true, updatedAt: true }
    })
    return NextResponse.json(items)
  } catch (e) {
    console.error('GET /api/clients error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
