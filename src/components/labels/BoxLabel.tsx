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
    <div className="box-label" dir="rtl">
      <style jsx>{`
        @media print {
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
            display: flex;
            flex-direction: column;
            gap: 4mm;
          }
          
          .label-info {
            display: flex;
            flex-direction: column;
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
          
          .label-total {
            display: flex;
            align-items: center;
            gap: 2mm;
            font-size: 10px;
          }
          .label-total .num {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 0.5mm 1.5mm;
            border-radius: 4px;
            font-weight: 600;
          }
          .label-total .final {
            background: #ecfeff;
            border: 1px solid #67e8f9;
            padding: 0.5mm 2mm;
            border-radius: 6px;
            color: #0ea5e9;
            font-weight: 700;
            font-size: 11px;
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
          .brand-header {
            display: grid;
            grid-template-columns: 50px 1fr 1fr;
            align-items: center;
            gap: 4mm;
          }
          .label-logo {
            width: 50px; height: 50px; object-fit: contain; border-radius: 6px; border: 1px solid #e5e7eb;
          }
          .store-name { font-size: 12px; font-weight: bold; color: #0ea5e9; }
          .store-meta { font-size: 8px; color: #555; }
          .order-no { font-size: 9px; color: #111; text-align: left; }
        }
        
        @media screen {
          .box-label {
            width: 400px;
            height: 280px;
            padding: 16px;
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
            border: 2px solid #0ea5e9;
            border-radius: 8px;
            box-sizing: border-box;
            margin: 20px auto;
            position: relative;
          }
          
          .label-header {
            text-align: center;
            border-bottom: 1px solid #0ea5e9;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          
          .label-title {
            font-size: 16px;
            font-weight: bold;
            color: #0ea5e9;
            margin-bottom: 4px;
          }
          
          .label-subtitle {
            font-size: 10px;
            color: #666;
          }
          
          .label-content {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .label-info {
            display: flex;
            flex-direction: column;
          }
          
          .label-section {
            margin-bottom: 6px;
          }
          
          .label-section-title {
            font-weight: bold;
            color: #0ea5e9;
            font-size: 10px;
            margin-bottom: 2px;
            border-bottom: 1px dotted #ccc;
          }
          
          .label-field {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 9px;
          }
          
          .label-field-name {
            font-weight: bold;
            color: #333;
          }
          
          .label-field-value {
            color: #000;
          }
          
          .label-contents {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 4px;
            margin-top: 4px;
          }
          
          .label-contents-title {
            font-weight: bold;
            color: #0ea5e9;
            font-size: 10px;
            margin-bottom: 2px;
          }
          
          .label-contents-item {
            font-size: 9px;
            margin-bottom: 1px;
            display: flex;
            justify-content: space-between;
          }
          
          .label-total {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
          }
          .label-total .num {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 600;
          }
          .label-total .final {
            background: #ecfeff;
            border: 1px solid #67e8f9;
            padding: 2px 10px;
            border-radius: 8px;
            color: #0ea5e9;
            font-weight: 700;
            font-size: 14px;
          }
          
          .label-footer {
            position: absolute;
            bottom: 4px;
            left: 4px;
            right: 4px;
            text-align: center;
            font-size: 8px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 2px;
          }
          .brand-header {
            display: grid;
            grid-template-columns: 60px 1fr 1fr;
            align-items: center;
            gap: 8px;
          }
          .label-logo { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; }
          .store-name { font-size: 14px; font-weight: bold; color: #0ea5e9; }
          .store-meta { font-size: 10px; color: #555; }
          .order-no { font-size: 10px; color: #111; text-align: left; }
        }
      `}</style>

      {/* Header */}
      <div className="label-header">
        <div className="brand-header">
          <img src={branding.logoUrl} alt="Logo" className="label-logo" />
          <div>
            <div className="store-name">{branding.storeName}</div>
            <div className="store-meta">{branding.storeAddress}</div>
            <div className="store-meta">{branding.storePhone}</div>
          </div>
          <div className="order-no">
            <div>رقم الطلب:</div>
            <div style={{ fontWeight: 600 }}>{orderNo}</div>
            <div style={{ color: '#666', fontSize: '8px' }}>التاريخ: {formatDate()}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="label-content">
        <div className="label-info">
          {/* Client Information */}
          <div className="label-section">
            <div className="label-section-title">بيانات العميل</div>
            <div className="label-field">
              <span className="label-field-name">الاسم:</span>
              <span className="label-field-value">{catData.clientName || 'غير محدد'}</span>
            </div>
            {catData.clientPhone && (
              <div className="label-field">
                <span className="label-field-name">رقم الهاتف:</span>
                <span className="label-field-value">{catData.clientPhone}</span>
              </div>
            )}
            {catData.clientAddress && (
              <div className="label-field">
                <span className="label-field-name">العنوان:</span>
                <span className="label-field-value">{catData.clientAddress}</span>
              </div>
            )}
          </div>

          {/* Receipt Section - simplified formula only */}
          <div className="label-section">
            <div className="label-section-title">الإيصال</div>
            <div className="label-total">
              <span className="label-field-name">المبلغ النهائي =</span>
              <span className="num">{formatNumber(costs.totalCostAfterDiscount, 0)} {pricing.currency}</span>
              <span className="label-field-name">+ الدلفري =</span>
              <span className="final">{formatNumber(costs.totalCostWithDelivery, 0)} {pricing.currency}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="label-footer">
        حاسبة تغذية القطة - نظام علمي معتمد
      </div>
    </div>
  )
}