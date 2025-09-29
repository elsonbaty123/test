"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

interface ReprintReportButtonProps {
  order: {
    orderNo: string
    payload?: { 
      boxSummary?: any
      results?: any
      catData?: any
      foodData?: any
      pricing?: any
      costs?: any
    }
    catName?: string
  }
  client: { name: string; phone?: string; address?: string }
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export const ReprintReportButton: React.FC<ReprintReportButtonProps> = ({
  order,
  client,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const handlePrint = () => {
    // Prepare report data from saved order
    const reportData = {
      catData: {
        clientName: client.name,
        clientPhone: client.phone || '',
        clientAddress: client.address || '',
        name: order.catName || '',
        ...(order.payload?.catData || {})
      },
      foodData: order.payload?.foodData || {},
      results: order.payload?.results || null,
      costs: order.payload?.costs || {},
      pricing: order.payload?.pricing || {},
      boxSummary: order.payload?.boxSummary || {}
    }

    // Save to localStorage for report page
    localStorage.setItem(`report_${order.orderNo}`, JSON.stringify(reportData))

    // Open report in new tab
    const reportUrl = `/report?orderNo=${order.orderNo}`
    window.open(reportUrl, '_blank')
  }

  // Check if report data is available
  const hasReportData = order.payload?.results || order.payload?.boxSummary

  if (!hasReportData) {
    return null // Don't show button if no report data
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className} 
      onClick={handlePrint}
    >
      <FileText className="w-4 h-4 ml-2" />
      طباعة التقرير
    </Button>
  )
}
