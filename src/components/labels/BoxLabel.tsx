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
            background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
            color: white;
            padding: 8mm;
            text-align: center;
            position: relative;
          }
          
          .invoice-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 2mm;
            letter-spacing: 1px;
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
            background: rgba(255,255,255,0.2);
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
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4mm;
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
          }
          
          .invoice-table td {
            padding: 2mm;
            text-align: center;
            border-bottom: 1px solid #eee;
          }
          
          .invoice-totals {
            border-top: 2px solid #4a90e2;
            padding-top: 4mm;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
            font-size: 9px;
          }
          
          .total-row.final {
            font-size: 12px;
            font-weight: bold;
            color: #4a90e2;
            border-top: 1px solid #ddd;
            padding-top: 2mm;
          }
          
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
            background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
          }
          
          .invoice-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 8px;
            letter-spacing: 1px;
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
            background: rgba(255,255,255,0.2);
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
          
          .invoice-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
            font-size: 11px;
          }
          
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
          }
          
          .invoice-table td {
            padding: 8px;
            text-align: center;
            border-bottom: 1px solid #eee;
          }
          
          .invoice-totals {
            border-top: 2px solid #4a90e2;
            padding-top: 16px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
          }
          
          .total-row.final {
            font-size: 16px;
            font-weight: bold;
            color: #4a90e2;
            border-top: 1px solid #ddd;
            padding-top: 8px;
          }
          
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
        <div className="invoice-title">إيصال دفع</div>
        <div className="invoice-subtitle">{branding.storeName}</div>
      </div>

      {/* Body */}
      <div className="invoice-body">
        {/* Meta Information */}
        <div className="invoice-meta">
          <div className="meta-item">
            <div className="meta-label">رقم الإيصال:</div>
            <div className="meta-value">{orderNo}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">التاريخ:</div>
            <div className="meta-value">{formatDate()}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">العميل:</div>
            <div className="meta-value">{catData.clientName || 'غير محدد'}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">الهاتف:</div>
            <div className="meta-value">{catData.clientPhone || '-'}</div>
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
              <td>{formatNumber(costs.totalCostAfterDiscount, 0)}</td>
              <td>خطة تغذية القطة</td>
              <td>{formatNumber(costs.totalCostAfterDiscount, 0)}</td>
            </tr>
            <tr>
              <td>1</td>
              <td>{formatNumber(costs.deliveryCost, 0)}</td>
              <td>خدمة التوصيل</td>
              <td>{formatNumber(costs.deliveryCost, 0)}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="total-row">
            <span>المجموع الفرعي:</span>
            <span>{formatNumber(costs.totalCostAfterDiscount, 0)} {pricing.currency}</span>
          </div>
          <div className="total-row">
            <span>التوصيل:</span>
            <span>{formatNumber(costs.deliveryCost, 0)} {pricing.currency}</span>
          </div>
          <div className="total-row final">
            <span>المبلغ الإجمالي:</span>
            <span>{formatNumber(costs.totalCostWithDelivery, 0)} {pricing.currency}</span>
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