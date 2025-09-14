'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Tag, Printer } from 'lucide-react'
import { BoxLabel } from './BoxLabel'
import ReactDOM from 'react-dom/client'

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
  const handlePrintLabel = () => {
    if (!results || !boxSummary) {
      alert('لا توجد بيانات بوكس للطباعة. يرجى حساب النتائج أولاً.')
      return
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    
    if (!printWindow) {
      alert('تعذر فتح نافذة الطباعة. يرجى السماح للنوافذ المنبثقة.')
      return
    }

    // Create the print content
    const printContent = document.createElement('div')
    const root = ReactDOM.createRoot(printContent)
    
    root.render(
      <BoxLabel
        catData={catData}
        foodData={foodData}
        results={results}
        boxSummary={boxSummary}
        pricing={pricing}
        costs={costs}
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
          <title>ملصق بوكس التغذية</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              background: white;
              padding: 10mm;
              direction: rtl;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              .no-print {
                display: none !important;
              }
              
              .print-controls {
                display: none !important;
              }
              
              @page {
                size: A4;
                margin: 10mm;
              }
              
              .box-label {
                width: 10cm;
                height: 7cm;
                padding: 8mm;
                font-family: 'Arial', sans-serif;
                font-size: 10px;
                line-height: 1.2;
                color: #000;
                background: white;
                border: 2px solid #0ea5e9;
                border-radius: 8px;
                box-sizing: border-box;
                page-break-after: always;
                margin: 0 auto;
              }
              
              .label-header {
                text-align: center;
                border-bottom: 1px solid #0ea5e9;
                padding-bottom: 4mm;
                margin-bottom: 4mm;
              }
              
              .label-title {
                font-size: 14px;
                font-weight: bold;
                color: #0ea5e9;
                margin-bottom: 2px;
              }
              
              .label-subtitle {
                font-size: 9px;
                color: #666;
              }
              
              .label-content {
                display: grid;
                grid-template-columns: 1fr 80px;
                gap: 4mm;
                height: calc(100% - 30px);
              }
              
              .label-info {
                display: flex;
                flex-direction: column;
                gap: 2mm;
              }
              
              .label-section {
                margin-bottom: 3mm;
              }
              
              .label-section-title {
                font-weight: bold;
                color: #0ea5e9;
                font-size: 9px;
                margin-bottom: 1mm;
                border-bottom: 1px dotted #ccc;
              }
              
              .label-field {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1mm;
                font-size: 8px;
              }
              
              .label-field-name {
                font-weight: bold;
                color: #333;
              }
              
              .label-field-value {
                color: #000;
              }
              
              .label-qr {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                gap: 2mm;
              }
              
              .label-qr-code {
                width: 60px;
                height: 60px;
              }
              
              .label-qr-text {
                font-size: 7px;
                text-align: center;
                color: #666;
              }
              
              .label-contents {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                padding: 2mm;
                margin-top: 2mm;
              }
              
              .label-contents-title {
                font-weight: bold;
                color: #0ea5e9;
                font-size: 9px;
                margin-bottom: 1mm;
              }
              
              .label-contents-item {
                font-size: 8px;
                margin-bottom: 0.5mm;
                display: flex;
                justify-content: space-between;
              }
              
              .label-footer {
                position: absolute;
                bottom: 2mm;
                left: 2mm;
                right: 2mm;
                text-align: center;
                font-size: 7px;
                color: #999;
                border-top: 1px solid #eee;
                padding-top: 1mm;
              }
            }
            
            @media screen {
              .print-controls {
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
              
              .print-btn.secondary {
                background: #6b7280;
              }
              
              .print-btn.secondary:hover {
                background: #4b5563;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">🏷️ طباعة الملصق</button>
            <button class="print-btn secondary" onclick="window.close()">❌ إغلاق</button>
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

  if (!results || !boxSummary) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Tag className="w-4 h-4 ml-2" />
        طباعة ملصق البوكس
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
      طباعة ملصق البوكس
    </Button>
  )
}