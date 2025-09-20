import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get next receipt number
export async function GET() {
  try {
    // Get current date for daily reset
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Try to find today's counter
    let counter = await prisma.receiptCounter.findUnique({
      where: { date: dateStr }
    })
    
    if (!counter) {
      // Create new counter for today
      counter = await prisma.receiptCounter.create({
        data: {
          date: dateStr,
          count: 1
        }
      })
    } else {
      // Increment existing counter
      counter = await prisma.receiptCounter.update({
        where: { date: dateStr },
        data: { count: counter.count + 1 }
      })
    }
    
    // Generate receipt number: YYYYMMDD-XXX
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const sequence = String(counter.count).padStart(3, '0')
    
    const receiptNumber = `${year}${month}${day}-${sequence}`
    
    return NextResponse.json({ 
      receiptNumber,
      date: dateStr,
      sequence: counter.count
    })
    
  } catch (error) {
    console.error('Error generating receipt number:', error)
    
    // Fallback to timestamp-based number if database fails
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0')
    const fallbackNumber = `${year}${month}${day}-${time}`
    
    return NextResponse.json({ 
      receiptNumber: fallbackNumber,
      date: now.toISOString().split('T')[0],
      sequence: 0,
      fallback: true
    })
  }
}
