"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Tag } from 'lucide-react'
import { BoxLabel } from './BoxLabel'
import ReactDOM from 'react-dom/client'

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
    const printWindow = window.open('', '_blank', 'width=600,height=400')
    if (!printWindow) {
      alert('تعذر فتح نافذة الطباعة. يرجى السماح للنوافذ المنبثقة.')
      return
    }

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
    const boxSummary = order.payload?.boxSummary || { totalDays: '' }

    // Create the print content
    const printContent = document.createElement('div')
    const root = ReactDOM.createRoot(printContent)
    root.render(
      <BoxLabel
        catData={catData}
        foodData={{}}
        results={{}}
        boxSummary={boxSummary}
        pricing={pricing}
        costs={costs}
        orderNo={order.orderNo}
      />
    )

    setTimeout(() => {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>إعادة طباعة الإيصال</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; background: white; padding: 10mm; direction: rtl; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
              .print-controls { display: none !important; }
              @page { size: A4; margin: 10mm; }
              .box-label { width: 10cm; height: 7cm; padding: 8mm; font-size: 10px; line-height: 1.2; color: #000; background: white; border: 2px solid #0ea5e9; border-radius: 8px; box-sizing: border-box; page-break-after: always; margin: 0 auto; }
              body.thermal .box-label { width: 80mm !important; height: auto !important; padding: 6mm !important; border-width: 1px !important; }
            }
            @media screen {
              .print-controls { text-align: center; margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
              .print-btn { background: #0ea5e9; color: white; border: none; padding: 10px 20px; margin: 0 10px; border-radius: 5px; cursor: pointer; font-size: 14px; }
              .print-btn:hover { background: #0284c7; }
              .print-btn.secondary { background: #6b7280; }
              .print-btn.secondary:hover { background: #4b5563; }
              .print-toggle { display: inline-flex; align-items: center; gap: 8px; margin: 0 10px; font-size: 14px; }
            }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <button class="print-btn" onclick="window.print()">🧾 طباعة الإيصال</button>
            <button class="print-btn secondary" onclick="window.close()">❌ إغلاق</button>
            <label class="print-toggle">
              <input type="checkbox" id="thermalToggle" /> إيصال حراري 80مم
            </label>
          </div>
          ${printContent.innerHTML}

          <script>
            (function() {
              const toggle = document.getElementById('thermalToggle');
              function applyThermal(on) {
                if (on) {
                  document.body.classList.add('thermal');
                  let s = document.getElementById('thermalPageStyle');
                  if (!s) { s = document.createElement('style'); s.id = 'thermalPageStyle'; document.head.appendChild(s); }
                  s.textContent = '@media print { @page { size: 80mm auto; margin: 4mm; } }';
                } else {
                  document.body.classList.remove('thermal');
                  const s = document.getElementById('thermalPageStyle');
                  if (s) s.textContent = '';
                }
              }
              if (toggle) { toggle.addEventListener('change', function() { applyThermal(this.checked); }); }
            })();
          </script>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => { printWindow.print() }, 500)
    }, 100)
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handlePrint}>
      <Tag className="w-4 h-4 ml-2" />
      إعادة طباعة
    </Button>
  )
}
