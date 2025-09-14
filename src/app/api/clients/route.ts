import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const clientName = (body?.clientName || '').trim()
    const data = body?.data
    if (!clientName) {
      return NextResponse.json({ error: 'اسم العميل مطلوب' }, { status: 400 })
    }
    if (!data) {
      return NextResponse.json({ error: 'بيانات العميل مطلوبة' }, { status: 400 })
    }

    const exists = await db.customer.findUnique({ where: { name: clientName } })

    await db.customer.upsert({
      where: { name: clientName },
      create: { name: clientName, data },
      update: { data }
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
      const item = await db.customer.findUnique({ where: { name } })
      if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(item)
    }
    const items = await db.customer.findMany({
      select: { id: true, name: true, createdAt: true, updatedAt: true }
    })
    return NextResponse.json(items)
  } catch (e) {
    console.error('GET /api/clients error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
