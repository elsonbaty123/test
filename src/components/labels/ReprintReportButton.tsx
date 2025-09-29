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
  const formatNumber = (n: number, digits = 2) => {
    return n.toFixed(digits)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1024')
    if (!printWindow) return

    const boxSummary = order.payload?.boxSummary || {}
    const results = order.payload?.results
    const currency = order.payload?.pricing?.currency || 'جنيه'

    // Build the weekly plan table
    let tableHtml = ''
    if (results?.weeklyPlan) {
      tableHtml = `
        <h2>الجدول الأسبوعي للتغذية</h2>
        <table>
          <thead>
            <tr>
              <th>اليوم</th>
              <th>النوع</th>
              <th>السعرات</th>
              <th>دراي (جم)</th>
              <th>ويت (جم)</th>
              <th>وحدات ويت</th>
            </tr>
          </thead>
          <tbody>
            ${results.weeklyPlan.map((day: any) => `
              <tr>
                <td>${day.day}</td>
                <td>${day.type === 'wet' ? 'ويت' : 'دراي'}</td>
                <td>${formatNumber(day.der, 1)}</td>
                <td>${formatNumber(day.dryGrams, 0)}</td>
                <td>${formatNumber(day.wetGrams, 0)}</td>
                <td>${day.meals?.reduce((sum: number, m: any) => sum + (m.wetUnits || 0), 0).toFixed(2) || '0.00'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }

    const styles = `
      <style>
        body { font-family: 'Arial', sans-serif; direction: rtl; padding: 24px; background: #fff; color: #1f2937; }
        h1 { font-size: 22px; margin-bottom: 12px; color: #0f172a; text-align: center; }
        h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; color: #1f2937; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 13px; text-align: center; }
        th { background: #f8fafc; }
        .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 20px 0; }
        .meta-item { background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
        .meta-item span { display: block; }
        .meta-item .label { color: #64748b; font-size: 12px; }
        .meta-item .value { font-weight: 600; margin-top: 4px; }
        @media print {
          body { padding: 10px; }
          @page { margin: 10mm; }
        }
      </style>
    `

    const headerHtml = `
      <h1>تقرير التغذية - طلب رقم ${order.orderNo}</h1>
      <div class="meta">
        <div class="meta-item">
          <span class="label">العميل</span>
          <span class="value">${client.name}</span>
        </div>
        <div class="meta-item">
          <span class="label">اسم القطة</span>
          <span class="value">${order.catName || 'غير محدد'}</span>
        </div>
        ${order.boxName ? `
        <div class="meta-item">
          <span class="label">نوع البوكس</span>
          <span class="value">${order.boxName}</span>
        </div>
        ` : ''}
        ${order.boxDuration ? `
        <div class="meta-item">
          <span class="label">المدة</span>
          <span class="value">${order.boxDuration}</span>
        </div>
        ` : ''}
        ${boxSummary?.totalDays ? `
        <div class="meta-item">
          <span class="label">إجمالي الأيام</span>
          <span class="value">${boxSummary.totalDays} يوم</span>
        </div>
        ` : ''}
      </div>
    `

    printWindow.document.write(`
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>تقرير التغذية - ${order.orderNo}</title>
          ${styles}
        </head>
        <body>
          ${headerHtml}
          ${tableHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
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
