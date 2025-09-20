'use client'

import React from 'react'
import { formatNumber } from '@/lib/utils'
import branding from '@/config/branding'

interface BoxLabelProps {
  catData: any
  foodData: any
  results: any
  boxSummary: any
  pricing: any
  costs: any
  orderNo?: string
}

export const BoxLabel: React.FC<BoxLabelProps> = ({
  catData,
  foodData,
  results,
  boxSummary,
  pricing,
  costs,
  orderNo: orderNoProp
}) => {
  const formatDate = () => {
    return new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Due date: +2 days from invoice date
  const formatDueDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // QR Codes removed as requested

  const breedLabel = (code: string) => {
    const map: Record<string, string> = {
      domestic_shorthair: 'منزلية شعر قصير',
      domestic_longhair: 'منزلية شعر طويل',
      persian: 'Persian (شيرازي)',
      british_shorthair: 'British Shorthair',
      maine_coon: 'Maine Coon',
      ragdoll: 'Ragdoll',
      siamese: 'Siamese',
      bengal: 'Bengal',
      sphynx: 'Sphynx',
      scottish_fold: 'Scottish Fold',
      norwegian_forest: 'Norwegian Forest',
      american_shorthair: 'American Shorthair',
      abyssinian: 'Abyssinian',
      turkish_angora: 'Turkish Angora',
      russian_blue: 'Russian Blue',
      oriental: 'Oriental',
      burmese: 'Burmese (بورميز)',
      tonkinese: 'Tonkinese (تونكينيز)',
      himalayan: 'Himalayan (هيمالايا)',
      devon_rex: 'Devon Rex (ديفون ريكس)',
      cornish_rex: 'Cornish Rex (كورنيش ريكس)',
      manx: 'Manx (مانكس)',
      savannah: 'Savannah (سافانا)',
      bombay: 'Bombay (بومباي)',
      egyptian_mau: 'Egyptian Mau (مصري ماو)',
      egyptian_baladi: 'بلدي مصري (Baladi)'
    }
    return map[code] || code
  }

  if (!results || !boxSummary) return null

  // Build order number (prefix + date + short id)
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
  const orderNo = (orderNoProp && String(orderNoProp).trim()) ? String(orderNoProp).trim() : buildOrderNo()

  // Pricing helpers
  const currency = pricing?.currency || ''
  const total = Number(costs?.totalCostWithProfit || 0)
  const afterDiscount = Number(costs?.totalCostAfterDiscount || 0)
  const delivery = Number(costs?.deliveryCost || 0)
  const amountDue = Number(costs?.totalCostWithDelivery || (afterDiscount + delivery))
  const discountValue = Math.max(0, total - afterDiscount)
  const discountPercent = total > 0 ? (discountValue / total) * 100 : 0

  return (
    <div className="invoice-receipt" dir="rtl">
      <style jsx>{`
        @media print {
          .invoice-receipt {
            width: 8.5cm;
            height: auto;
            min-height: 12cm;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background: white;
            border: 2px solid #ddd;
            border-radius: 12px;
            box-sizing: border-box;
            page-break-after: always;
            margin: 0 auto;
            overflow: hidden;
          }
          
          .invoice-header {
            background: #e9edf5;
            color: #2b5b8e;
            padding: 8mm 8mm 6mm 8mm;
            text-align: center;
            position: relative;
          }
          
          .invoice-title {
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 1mm;
            letter-spacing: 1.2px;
            text-transform: uppercase;
          }
          
          .invoice-subtitle {
            font-size: 10px;
            opacity: 0.9;
          }
          
          .invoice-logo {
            position: absolute;
            top: 4mm;
            right: 4mm;
            width: 25px;
            height: 25px;
            background: rgba(255,255,255,0.8);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .invoice-logo img {
            width: 20px;
            height: 20px;
            filter: brightness(0) invert(1);
          }
          
          .invoice-body {
            padding: 6mm;
          }
          
          .invoice-meta {
            margin-bottom: 6mm;
            font-size: 8px;
          }

          .meta-item {
            display: flex;
            flex-direction: column;
          }
          
          .meta-label {
            color: #666;
            font-weight: bold;
            margin-bottom: 1mm;
          }
          
          .meta-value {
            color: #333;
            font-weight: normal;
          }
          
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6mm;
            font-size: 8px;
          }
          
          .invoice-table th {
            background: #f8f9fa;
            padding: 2mm;
            text-align: center;
            font-weight: bold;
            color: #4a90e2;
            border-bottom: 1px solid #ddd;
            border-top: 2px solid #4a90e2;
          }
          
          .invoice-table td {
            padding: 2mm;
            text-align: center;
            border-bottom: 1px solid #eee;
          }
          
          .invoice-summary {
            margin-top: 2mm;
            background: #f1f5fb;
            border: 1px solid #dbe3f2;
            border-radius: 6px;
            padding: 3mm;
          }
          .invoice-summary .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2mm;
            font-size: 9px;
          }
          .invoice-summary .summary-row.due {
            font-weight: bold;
            color: #2b5b8e;
            font-size: 11px;
          }

          /* New meta layout (v2) */
          .invoice-meta.v2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4mm;
          }
          .meta-block {
            background: #fafbff;
            border: 1px solid #e6ecf7;
            border-radius: 6px;
            padding: 3mm;
          }
          .meta-block.to { background: #f7fafc; }
          .meta-row { display: flex; justify-content: space-between; gap: 4mm; margin-bottom: 1.5mm; }
          .meta-title { font-weight: 700; color: #2b5b8e; margin-bottom: 1.5mm; }
          .meta-muted { color: #6b7280; }

          .invoice-footer {
            text-align: center;
            margin-top: 6mm;
            padding-top: 4mm;
            border-top: 1px solid #eee;
          }
          
          .cat-icon {
            width: 20px;
            height: 20px;
            fill: #4a90e2;
            margin: 0 auto 2mm;
          }
          
          .thank-you {
            font-size: 10px;
            font-weight: bold;
            color: #4a90e2;
            margin-bottom: 1mm;
          }
          
          .footer-note {
            font-size: 7px;
            color: #666;
          }
        }
        
        @media screen {
          .invoice-receipt {
            width: 340px;
            height: auto;
            min-height: 480px;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background: white;
            border: 2px solid #ddd;
            border-radius: 12px;
            box-sizing: border-box;
            margin: 20px auto;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .invoice-header {
            background: #e9edf5;
            color: #2b5b8e;
            padding: 20px 20px 16px 20px;
            text-align: center;
            position: relative;
          }
          
          .invoice-title {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 6px;
            letter-spacing: 1.2px;
            text-transform: uppercase;
          }
          
          .invoice-subtitle {
            font-size: 12px;
            opacity: 0.9;
          }
          
          .invoice-logo {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 35px;
            height: 35px;
            background: rgba(255,255,255,0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .invoice-logo img {
            width: 28px;
            height: 28px;
            filter: brightness(0) invert(1);
          }
          
          .invoice-body {
            padding: 20px;
          }
          
          .invoice-meta { margin-bottom: 20px; font-size: 11px; }
          
          .meta-item {
            display: flex;
            flex-direction: column;
          }
          
          .meta-label {
            color: #666;
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .meta-value {
            color: #333;
            font-weight: normal;
          }
          
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
          }
          
          .invoice-table th {
            background: #f8f9fa;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            color: #4a90e2;
            border-bottom: 1px solid #ddd;
            border-top: 3px solid #4a90e2;
          }
          
          .invoice-table td {
            padding: 8px;
            text-align: center;
            border-bottom: 1px solid #eee;
          }
          
          .invoice-summary {
            margin-top: 8px;
            background: #f1f5fb;
            border: 1px solid #dbe3f2;
            border-radius: 8px;
            padding: 12px;
          }
          .invoice-summary .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            font-size: 13px;
          }
          .invoice-summary .summary-row.due {
            font-weight: 800;
            color: #2b5b8e;
            font-size: 15px;
          }

          /* New meta layout (v2) */
          .invoice-meta.v2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          .meta-block {
            background: #fafbff;
            border: 1px solid #e6ecf7;
            border-radius: 8px;
            padding: 12px;
          }
          .meta-block.to { background: #f7fafc; }
          .meta-row { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
          .meta-title { font-weight: 800; color: #2b5b8e; margin-bottom: 6px; }
          .meta-muted { color: #6b7280; }
          
          .invoice-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #eee;
          }
          
          .cat-icon {
            width: 32px;
            height: 32px;
            fill: #4a90e2;
            margin: 0 auto 8px;
          }
          
          .thank-you {
            font-size: 14px;
            font-weight: bold;
            color: #4a90e2;
            margin-bottom: 4px;
          }
          
          .footer-note {
            font-size: 10px;
            color: #666;
          }
        }
      `}</style>

      {/* Header */}
      <div className="invoice-header">
        <div className="invoice-logo">
          <img src={branding.logoUrl} alt="Logo" />
        </div>
        <div className="invoice-title">INVOICE</div>
        <div className="invoice-subtitle">{branding.storeName}</div>
      </div>

      {/* Body */}
      <div className="invoice-body">
        {/* Meta Information - redesigned */}
        <div className="invoice-meta v2">
          {/* Dates block */}
          <div className="meta-block">
            <div className="meta-title">بيانات الفاتورة</div>
            <div className="meta-row">
              <span className="meta-label">تاريخ الفاتورة:</span>
              <span className="meta-value">{formatDate()}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">تاريخ الاستحقاق:</span>
              <span className="meta-value">{formatDueDate()}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">رقم الفاتورة:</span>
              <span className="meta-value">{orderNo}</span>
            </div>
          </div>

          {/* Invoice to block */}
          <div className="meta-block to">
            <div className="meta-title">إلى:</div>
            <div className="meta-row">
              <span className="meta-label meta-muted">العميل</span>
              <span className="meta-value">{catData.clientName || 'غير محدد'}</span>
            </div>
            {catData.clientPhone && (
              <div className="meta-row">
                <span className="meta-label meta-muted">الهاتف</span>
                <span className="meta-value">{catData.clientPhone}</span>
              </div>
            )}
            {catData.clientAddress && (
              <div className="meta-row">
                <span className="meta-label meta-muted">العنوان</span>
                <span className="meta-value">{catData.clientAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Service Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الوصف</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{formatNumber(total, 0)}</td>
              <td>خطة تغذية القطة</td>
              <td>{formatNumber(total, 0)}</td>
            </tr>
            <tr>
              <td>1</td>
              <td>{formatNumber(costs.deliveryCost, 0)}</td>
              <td>خدمة التوصيل</td>
              <td>{formatNumber(costs.deliveryCost, 0)}</td>
            </tr>
          </tbody>
        </table>

        {/* Summary */}
        <div className="invoice-summary">
          <div className="summary-row">
            <span>الإجمالي:</span>
            <span>{formatNumber(total, 0)} {currency}</span>
          </div>
          <div className="summary-row">
            <span>الخصم:</span>
            <span>{formatNumber(discountPercent, 0)}%</span>
          </div>
          {delivery > 0 && (
            <div className="summary-row">
              <span>التوصيل:</span>
              <span>{formatNumber(delivery, 0)} {currency}</span>
            </div>
          )}
          <div className="summary-row due">
            <span>المبلغ المستحق:</span>
            <span>{formatNumber(amountDue, 0)} {currency}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <svg className="cat-icon" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 9H14V4H19V9Z"/>
          </svg>
          <div className="thank-you">شكراً لك على الشراء</div>
          <div className="footer-note">نظام تغذية علمي معتمد للقطط</div>
        </div>
      </div>
    </div>
  )
}