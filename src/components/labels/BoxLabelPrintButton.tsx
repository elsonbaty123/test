'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Tag, Printer } from 'lucide-react'
import { CustomerReceipt } from './CustomerReceipt'
import ReactDOM from 'react-dom/client'
import branding from '@/config/branding'

interface BoxLabelPrintButtonProps {
  catData: any
  foodData: any
  results: any
  boxSummary: any
  pricing: any
  costs: any
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export const BoxLabelPrintButton: React.FC<BoxLabelPrintButtonProps> = ({
  catData,
  foodData,
  results,
  boxSummary,
  pricing,
  costs,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const handlePrintLabel = async () => {
    if (!results || !boxSummary) {
      alert('لا توجد بيانات بوكس للطباعة. يرجى حساب النتائج أولاً.')
      return
    }

    const name = (catData?.clientName || '').trim()
    if (!name) {
      alert('الرجاء إدخال اسم العميل قبل الطباعة لحفظ رقم الطلب')
      return
    }

    // Get sequential receipt number from API
    let orderNo = ''
    try {
      const response = await fetch('/api/receipt-number')
      const data = await response.json()
      orderNo = data.receiptNumber
    } catch (error) {
      console.error('Failed to get receipt number:', error)
      // Fallback to timestamp-based number
      const d = new Date()
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      orderNo = `${y}${m}${day}-${hh}${mm}`
    }

    // Get selected box name and duration from localStorage
    const selectedBoxName = localStorage.getItem('selectedBoxName') || ''
    const selectedBoxDuration = localStorage.getItem('selectedBoxDuration') || ''
    const selectedBoxPrice = localStorage.getItem('selectedBoxPrice') || ''
    
    // Prepare receipt data with box count and full cost details
    const receiptData = {
      orderNo,
      catData,
      boxName: selectedBoxName || boxSummary?.selectedBoxName || '',
      boxDuration: selectedBoxDuration || boxSummary?.selectedBoxDuration || boxSummary?.planDuration || '',
      boxPrice: parseFloat(selectedBoxPrice) || costs?.totalCostWithDelivery || 0,
      boxSummary: {
        ...boxSummary,
        boxCount: boxSummary?.boxCount || 1
      },
      pricing,
      costs,
      paidAmount: parseFloat(pricing.paidAmount || '0'), // Use the paid amount from pricing
      timestamp: new Date().toISOString()
    }

    // Save receipt data to localStorage
    localStorage.setItem(`receipt_${orderNo}`, JSON.stringify(receiptData))

    // Persist order number linked to the client with full cost breakdown
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          orderNo,
          currency: pricing?.currency,
          catName: catData?.name,
          boxName: selectedBoxName || boxSummary?.selectedBoxName || '',
          boxDuration: selectedBoxDuration || boxSummary?.selectedBoxDuration || boxSummary?.planDuration || '',
          boxPrice: parseFloat(selectedBoxPrice) || costs?.totalCostWithDelivery || 0,
          planDuration: boxSummary?.planDuration,
          paidAmount: parseFloat(pricing?.paidAmount || '0'),
          totals: {
            dryCost: costs?.dryCost || 0,
            wetCost: costs?.wetCost || 0,
            treatCost: costs?.treatCost || 0,
            packagingCost: costs?.packagingCost || 0,
            additionalCosts: costs?.additionalCosts || 0,
            subtotalCost: costs?.subtotalCost || 0,
            totalCostBeforeProfit: costs?.totalCostBeforeProfit || 0,
            profitAmount: costs?.profitAmount || 0,
            totalCostWithProfit: costs?.totalCostWithProfit || 0,
            discountAmount: costs?.discountAmount || 0,
            totalCostAfterDiscount: costs?.totalCostAfterDiscount || 0,
            deliveryCost: costs?.deliveryCost || 0,
            totalCostWithDelivery: costs?.totalCostWithDelivery || 0,
          },
          payload: {
            boxSummary,
          }
        })
      })
      // ignore response errors; printing can proceed regardless
    } catch (e) {
      console.warn('Failed to save order number, will continue printing:', e)
    }

    // Open receipt page in new tab
    const receiptUrl = `/receipt?orderNo=${orderNo}`
    window.open(receiptUrl, '_blank')
  }

  if (!results || !boxSummary) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Tag className="w-4 h-4 ml-2" />
        طباعة الإيصال
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handlePrintLabel}
    >
      <Tag className="w-4 h-4 ml-2" />
      طباعة الإيصال
    </Button>
  )
}