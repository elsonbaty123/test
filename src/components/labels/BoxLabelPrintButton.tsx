'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Tag, Printer } from 'lucide-react'
import { Receipt } from './Receipt'
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

    const buildOrderNo = () => {
      const d = new Date()
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
      return `${branding.orderPrefix}-${y}${m}${day}-${hh}${mm}-${rand}`
    }
    const orderNo = buildOrderNo()

    // Persist order number linked to the client
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          orderNo,
          currency: pricing?.currency,
          catName: catData?.name,
          totals: {
            totalCostWithProfit: costs?.totalCostWithProfit,
            totalCostAfterDiscount: costs?.totalCostAfterDiscount,
            deliveryCost: costs?.deliveryCost,
            totalCostWithDelivery: costs?.totalCostWithDelivery,
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
      <Receipt
        catData={catData}
        foodData={foodData}
        results={results}
        boxSummary={boxSummary}
        pricing={pricing}
        costs={costs}
        orderNo={orderNo}
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
          <title>إيصال خدمة تغذية القطط</title>
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

              /* Thermal receipt overrides */
              body.thermal .box-label {
                width: 80mm !important;
                height: auto !important;
                padding: 6mm !important;
                border-width: 1px !important;
              }
              body.thermal .label-content {
                grid-template-columns: 1fr 60px !important;
                gap: 3mm !important;
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
              .print-toggle {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                margin: 0 10px;
                font-size: 14px;
              }
              /* Make thermal toggle affect screen size too for image export */
              body.thermal .box-label { width: 320px; height: auto; border-width: 1px; }
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
            <button class="print-btn" id="saveImgBtn">💾 حفظ كصورة</button>
          </div>
          ${printContent.innerHTML}

          <script>
            var __ORDER_NO__ = ${JSON.stringify(orderNo)};
            (function() {
              const toggle = document.getElementById('thermalToggle');
              function applyThermal(on) {
                if (on) {
                  document.body.classList.add('thermal');
                  // Append a style tag to override @page to 80mm
                  let s = document.getElementById('thermalPageStyle');
                  if (!s) {
                    s = document.createElement('style');
                    s.id = 'thermalPageStyle';
                    document.head.appendChild(s);
                  }
                  s.textContent = '@media print { @page { size: 80mm auto; margin: 4mm; } }';
                } else {
                  document.body.classList.remove('thermal');
                  const s = document.getElementById('thermalPageStyle');
                  if (s) s.textContent = '';
                }
              }
              if (toggle) {
                toggle.addEventListener('change', function() { applyThermal(this.checked); });
              }

              // Save receipt as image using html2canvas CDN
              function ensureHtml2Canvas(cb){
                if (window.html2canvas) return cb();
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
                s.onload = () => cb();
                document.head.appendChild(s);
              }
              function downloadImage(){
                const el = document.querySelector('.box-label');
                if(!el){ alert('لم يتم العثور على الإيصال'); return }
                ensureHtml2Canvas(function(){
                  window.html2canvas(el, {scale: 2, useCORS: true, backgroundColor: '#ffffff'}).then(function(canvas){
                    const url = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'receipt-' + __ORDER_NO__ + '.png';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  });
                });
              }
              const btn = document.getElementById('saveImgBtn');
              if(btn){ btn.addEventListener('click', downloadImage); }
            })();
          </script>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Focus the print window and trigger print dialog automatically
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