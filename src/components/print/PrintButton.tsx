'use client'

import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'
import { PrintableReport } from './PrintableReport'
import ReactDOM from 'react-dom/client'

interface PrintButtonProps {
  catData: any
  foodData: any
  results: any
  costs: any
  pricing: any
  boxSummary: any
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  catData,
  foodData,
  results,
  costs,
  pricing,
  boxSummary,
  variant = 'outline',
  size = 'default',
  className = ''
}) => {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!results) {
      alert('لا توجد نتائج للطباعة. يرجى حساب النتائج أولاً.')
      return
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
        catData={catData}
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
          <title>تقرير تغذية القطة</title>
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
              
              .print-report {
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #000;
                background: white;
              }
              
              .print-header {
                text-align: center;
                border-bottom: 2px solid #0ea5e9;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }
              
              .print-title {
                font-size: 18px;
                font-weight: bold;
                color: #0ea5e9;
                margin-bottom: 5px;
              }
              
              .print-subtitle {
                font-size: 12px;
                color: #666;
              }
              
              .print-section {
                margin-bottom: 20px;
                page-break-inside: avoid;
              }
              
              .print-section-title {
                font-size: 14px;
                font-weight: bold;
                color: #0ea5e9;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 5px;
                margin-bottom: 10px;
              }
              
              .print-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin-bottom: 15px;
              }
              
              .print-field {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px dotted #ccc;
              }
              
              .print-field-label {
                font-weight: bold;
                color: #374151;
              }
              
              .print-field-value {
                color: #000;
              }
              
              .print-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
              }
              
              .print-table th,
              .print-table td {
                border: 1px solid #ccc;
                padding: 8px;
                text-align: center;
                font-size: 11px;
              }
              
              .print-table th {
                background-color: #f3f4f6;
                font-weight: bold;
              }
              
              .print-table .wet-day {
                background-color: #dbeafe;
              }
              
              .print-highlights {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin: 20px 0;
              }
              
              .print-highlight {
                text-align: center;
                padding: 10px;
                border: 2px solid #0ea5e9;
                border-radius: 8px;
              }
              
              .print-highlight-value {
                font-size: 16px;
                font-weight: bold;
                color: #0ea5e9;
              }
              
              .print-highlight-label {
                font-size: 10px;
                color: #666;
                margin-top: 5px;
              }
              
              .print-footer {
                margin-top: 30px;
                text-align: center;
                font-size: 10px;
                color: #666;
                border-top: 1px solid #e5e7eb;
                padding-top: 10px;
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

  const generatePrintData = () => {
    const formatDate = () => {
      return new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    return {
      title: `تقرير تغذية القطة - ${catData.name || 'غير محدد'} - ${formatDate()}`,
      content: {
        catData,
        foodData,
        results,
        costs,
        pricing,
        boxSummary
      }
    }
  }

  if (!results) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Printer className="w-4 h-4 ml-2" />
        طباعة التقرير
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handlePrint}
    >
      <Printer className="w-4 h-4 ml-2" />
      طباعة التقرير
    </Button>
  )
}