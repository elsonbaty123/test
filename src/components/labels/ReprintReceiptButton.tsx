"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Tag } from 'lucide-react'

interface ReprintReceiptButtonProps {
  client: { name: string; phone?: string; address?: string }
  order: {
    orderNo: string
    createdAt?: string
    currency?: string
    totals: {
      totalCostWithProfit?: number
      totalCostAfterDiscount?: number
      deliveryCost?: number
      totalCostWithDelivery?: number
    }
    catName?: string
    payload?: { boxSummary?: any }
  }
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export const ReprintReceiptButton: React.FC<ReprintReceiptButtonProps> = ({
  client,
  order,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const handlePrint = () => {
    const catData = {
      clientName: client.name,
      clientPhone: client.phone || '',
      clientAddress: client.address || '',
      name: order.catName || ''
    }

    const pricing = { currency: order.currency || '' }
    const costs = {
      totalCostWithProfit: order.totals.totalCostWithProfit || 0,
      totalCostAfterDiscount: order.totals.totalCostAfterDiscount || 0,
      deliveryCost: order.totals.deliveryCost || 0,
      totalCostWithDelivery: order.totals.totalCostWithDelivery || 0,
    }
    const boxSummary = order.payload?.boxSummary || { 
      totalDays: 30, 
      items: [],
      boxCount: 1
    }

    // Prepare receipt data
    const receiptData = {
      orderNo: order.orderNo,
      catData,
      boxSummary: {
        ...boxSummary,
        boxCount: boxSummary?.boxCount || 1
      },
      pricing,
      costs,
      paidAmount: 0, // Default to 0, can be updated in receipt page
      timestamp: order.createdAt || new Date().toISOString()
    }

    // Save receipt data to localStorage
    localStorage.setItem(`receipt_${order.orderNo}`, JSON.stringify(receiptData))

    // Open receipt page in new tab
    const receiptUrl = `/receipt?orderNo=${order.orderNo}`
    window.open(receiptUrl, '_blank')
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handlePrint}>
      <Tag className="w-4 h-4 ml-2" />
      إعادة طباعة
    </Button>
  )
}
