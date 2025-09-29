"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface EditReceiptButtonProps {
  order: {
    orderNo: string
    createdAt?: string
    currency?: string
    totals: {
      dryCost?: number
      wetCost?: number
      treatCost?: number
      packagingCost?: number
      additionalCosts?: number
      subtotalCost?: number
      totalCostBeforeProfit?: number
      profitAmount?: number
      totalCostWithProfit?: number
      discountAmount?: number
      totalCostAfterDiscount?: number
      deliveryCost?: number
      totalCostWithDelivery?: number
    }
    catName?: string
    boxName?: string
    boxDuration?: string
    planDuration?: string
    paidAmount?: number
    payload?: { boxSummary?: any }
  }
  client: { name: string; phone?: string; address?: string }
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export const EditReceiptButton: React.FC<EditReceiptButtonProps> = ({
  order,
  client,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const handleEdit = () => {
    const catData = {
      clientName: client.name,
      clientPhone: client.phone || '',
      clientAddress: client.address || '',
      name: order.catName || ''
    }

    const pricing = { currency: order.currency || '' }
    const costs = {
      dryCost: order.totals.dryCost || 0,
      wetCost: order.totals.wetCost || 0,
      treatCost: order.totals.treatCost || 0,
      packagingCost: order.totals.packagingCost || 0,
      additionalCosts: order.totals.additionalCosts || 0,
      subtotalCost: order.totals.subtotalCost || 0,
      totalCostBeforeProfit: order.totals.totalCostBeforeProfit || 0,
      profitAmount: order.totals.profitAmount || 0,
      totalCostWithProfit: order.totals.totalCostWithProfit || 0,
      discountAmount: order.totals.discountAmount || 0,
      totalCostAfterDiscount: order.totals.totalCostAfterDiscount || 0,
      deliveryCost: order.totals.deliveryCost || 0,
      totalCostWithDelivery: order.totals.totalCostWithDelivery || 0,
    }
    const boxSummary = order.payload?.boxSummary || { 
      totalDays: 30, 
      items: [],
      boxCount: 1
    }

    // Prepare receipt data for editing
    const receiptData = {
      orderNo: order.orderNo,
      catData,
      boxName: order.boxName || '',
      boxDuration: order.boxDuration || order.planDuration || '',
      boxSummary: {
        ...boxSummary,
        boxCount: boxSummary?.boxCount || 1
      },
      pricing,
      costs,
      paidAmount: order.paidAmount || 0,
      timestamp: order.createdAt || new Date().toISOString(),
      editMode: true // Flag to enable edit mode
    }

    // Save receipt data to localStorage
    localStorage.setItem(`receipt_${order.orderNo}`, JSON.stringify(receiptData))

    // Open receipt page in edit mode
    const receiptUrl = `/receipt?orderNo=${order.orderNo}&edit=true`
    window.open(receiptUrl, '_blank')
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={handleEdit}
    >
      <Edit className="w-4 h-4 ml-2" />
      تعديل الإيصال
    </Button>
  )
}
