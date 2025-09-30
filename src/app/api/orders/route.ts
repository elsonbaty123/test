import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = (body?.name || '').trim() // customer name
    const orderNo = (body?.orderNo || '').trim()
    const totals = body?.totals || {}
    const currency = body?.currency || ''
    const catName = body?.catName || ''
    const boxName = body?.boxName || ''
    const boxDuration = body?.boxDuration || ''
    const boxPrice = body?.boxPrice || 0
    const planDuration = body?.planDuration || ''
    const paidAmount = Number(body?.paidAmount || 0)
    const payload = body?.payload || {}

    if (!name) return NextResponse.json({ error: 'اسم العميل مطلوب' }, { status: 400 })
    if (!orderNo) return NextResponse.json({ error: 'رقم الطلب مطلوب' }, { status: 400 })

    const db = getDb()
    let customer = await db.customer.findUnique({ where: { name } })

    if (!customer) {
      // Create a bare customer if not exists
      customer = await db.customer.create({
        data: {
          name,
          phone: '',
          address: '',
          data: JSON.stringify({})
        }
      })
    }

    let dataObj: any = {}
    try { dataObj = JSON.parse((customer.data as unknown as string) || '{}') } catch {}
    if (!dataObj || typeof dataObj !== 'object') dataObj = {}

    const orders: any[] = Array.isArray(dataObj.orders) ? dataObj.orders : []

    const orderRecord = {
      orderNo,
      createdAt: new Date().toISOString(),
      totals,
      currency,
      catName,
      boxName,
      boxDuration,
      boxPrice,
      planDuration,
      paidAmount,
      payload, // Keep payload as a nested object
    }

    // Avoid duplicates by orderNo
    const existsIdx = orders.findIndex(o => o && o.orderNo === orderNo)
    if (existsIdx >= 0) {
      orders[existsIdx] = orderRecord
    } else {
      orders.push(orderRecord)
    }

    dataObj.orders = orders

    await db.customer.update({
      where: { name },
      data: { data: JSON.stringify(dataObj) }
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('POST /api/orders error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const name = (searchParams.get('name') || '').trim()
    if (!name) return NextResponse.json({ error: 'اسم العميل مطلوب' }, { status: 400 })

    const db = getDb()
    const customer = await db.customer.findUnique({ where: { name } })
    if (!customer) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

    let dataObj: any = {}
    try { dataObj = JSON.parse((customer.data as unknown as string) || '{}') } catch {}
    const orders = Array.isArray(dataObj?.orders) ? dataObj.orders : []

    return NextResponse.json({ orders })
  } catch (e) {
    console.error('GET /api/orders error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const orderNo = (body?.orderNo || '').trim()
    const updates = body?.updates || {}
    
    if (!orderNo) return NextResponse.json({ error: 'رقم الطلب مطلوب' }, { status: 400 })

    const db = getDb()
    
    // Find the customer that has this order
    const customers = await db.customer.findMany()
    let targetCustomer: typeof customers[0] | null = null
    
    for (const customer of customers) {
      let dataObj: any = {}
      try { dataObj = JSON.parse((customer.data as unknown as string) || '{}') } catch {}
      const orders: any[] = Array.isArray(dataObj?.orders) ? dataObj.orders : []
      
      if (orders.some(o => o && o.orderNo === orderNo)) {
        targetCustomer = customer
        break
      }
    }

    if (!targetCustomer) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    let dataObj: any = {}
    try { dataObj = JSON.parse((targetCustomer.data as unknown as string) || '{}') } catch {}
    const orders: any[] = Array.isArray(dataObj?.orders) ? dataObj.orders : []
    
    // Find and update the order
    const orderIndex = orders.findIndex(o => o && o.orderNo === orderNo)
    if (orderIndex >= 0) {
      orders[orderIndex] = {
        ...orders[orderIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      dataObj.orders = orders
      
      await db.customer.update({
        where: { name: targetCustomer.name },
        data: { data: JSON.stringify(dataObj) }
      })
      
      return NextResponse.json({ ok: true, order: orders[orderIndex] })
    }
    
    return NextResponse.json({ error: 'فشل في تحديث الطلب' }, { status: 500 })
  } catch (e) {
    console.error('PUT /api/orders error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const name = (body?.name || '').trim()
    const orderNo = (body?.orderNo || '').trim()
    if (!name || !orderNo) return NextResponse.json({ error: 'اسم العميل ورقم الطلب مطلوبان' }, { status: 400 })

    const db = getDb()
    const customer = await db.customer.findUnique({ where: { name } })
    if (!customer) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

    let dataObj: any = {}
    try { dataObj = JSON.parse((customer.data as unknown as string) || '{}') } catch {}
    const orders: any[] = Array.isArray(dataObj?.orders) ? dataObj.orders : []
    const filtered = orders.filter(o => o && o.orderNo !== orderNo)
    dataObj.orders = filtered

    await db.customer.update({ where: { name }, data: { data: JSON.stringify(dataObj) } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/orders error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
