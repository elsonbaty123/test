"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import ReactDOM from 'react-dom/client'
import { PrintableReport } from '@/components/print/PrintableReport'

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
    boxName?: string
    boxDuration?: string
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
    const results = order.payload?.results
    const catData = order.payload?.catData || {}
    const foodData = order.payload?.foodData || {}
    const costs = order.payload?.costs || {}
    const pricing = order.payload?.pricing || {}
    const boxSummary = order.payload?.boxSummary || {}

    // Check if data is available
    if (!results) {
      alert('⚠️ البيانات الكاملة للتقرير غير متوفرة لهذا الطلب.\n\nهذا طلب قديم تم حفظه قبل إضافة ميزة التقارير.\nيمكنك فقط طباعة الإيصال.')
      return
    }

    // Merge client data with catData
    const fullCatData = {
      ...catData,
      clientName: client.name,
      clientPhone: client.phone || catData.clientPhone || '',
      clientAddress: client.address || catData.clientAddress || '',
      name: order.catName || catData.name || ''
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (!printWindow) {
      alert('تعذر فتح نافذة الطباعة. يرجى السماح للنوافذ المنبثقة.')
      return
    }

    // Create the print content
    const printContent = document.createElement('div')
    const root = ReactDOM.createRoot(printContent)
    
    root.render(
      <PrintableReport
        catData={fullCatData}
        foodData={foodData}
        results={results}
        costs={costs}
        pricing={pricing}
        boxSummary={boxSummary}
      />
    )

    // Wait for React to render, then set up the print window
    setTimeout(() => {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>تقرير تغذية القطة - ${order.orderNo}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 20px;
              direction: rtl;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              .no-print {
                display: none !important;
              }
            }
            
            @media screen {
              .print-buttons {
                text-align: center;
                margin: 20px 0;
                padding: 20px;
                background: #f9f9f9;
                border-radius: 8px;
              }
              
              .print-btn {
                background: #0ea5e9;
                color: white;
                border: none;
                padding: 10px 20px;
                margin: 0 10px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
              }
              
              .print-btn:hover {
                background: #0284c7;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-buttons no-print">
            <button class="print-btn" onclick="window.print()">🖨️ طباعة التقرير</button>
            <button class="print-btn" onclick="window.close()">❌ إغلاق</button>
          </div>
          ${printContent.innerHTML}
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Focus the print window and trigger print dialog
      printWindow.focus()
      
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }, 100)
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
