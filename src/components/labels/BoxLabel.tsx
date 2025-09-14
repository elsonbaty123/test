'use client'

import React from 'react'
import { QRCode } from './QRCode'
import { formatNumber } from '@/lib/utils'

interface BoxLabelProps {
  catData: any
  foodData: any
  results: any
  boxSummary: any
  pricing: any
  costs: any
}

export const BoxLabel: React.FC<BoxLabelProps> = ({
  catData,
  foodData,
  results,
  boxSummary,
  pricing,
  costs
}) => {
  const formatDate = () => {
    return new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateQRData = () => {
    return JSON.stringify({
      client: catData.clientName,
      cat: catData.name,
      period: boxSummary.totalDays,
      created: new Date().toISOString().split('T')[0]
    })
  }

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
            display: grid;
            grid-template-columns: 1fr 100px;
            gap: 8px;
            height: calc(100% - 60px);
          }
          
          .label-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
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
          
          .label-qr {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            gap: 4px;
          }
          
          .label-qr-code {
            width: 80px;
            height: 80px;
          }
          
          .label-qr-text {
            font-size: 8px;
            text-align: center;
            color: #666;
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
        }
      `}</style>

      {/* Header */}
      <div className="label-header">
        <div className="label-title">ملصق بوكس التغذية</div>
        <div className="label-subtitle">تاريخ الإنشاء: {formatDate()}</div>
      </div>

      {/* Content */}
      <div className="label-content">
        <div className="label-info">
          {/* Client Information */}
          <div className="label-section">
            <div className="label-section-title">العميل</div>
            <div className="label-field">
              <span className="label-field-name">الاسم:</span>
              <span className="label-field-value">{catData.clientName || 'غير محدد'}</span>
            </div>
            {catData.clientPhone && (
              <div className="label-field">
                <span className="label-field-name">الهاتف:</span>
                <span className="label-field-value">{catData.clientPhone}</span>
              </div>
            )}
          </div>

          {/* Cat Information */}
          <div className="label-section">
            <div className="label-section-title">القطة</div>
            <div className="label-field">
              <span className="label-field-name">الاسم:</span>
              <span className="label-field-value">{catData.name || 'غير محدد'}</span>
            </div>
            <div className="label-field">
              <span className="label-field-name">العمر:</span>
              <span className="label-field-value">{catData.ageValue} {catData.ageUnit === 'months' ? 'ش' : 'س'}</span>
            </div>
            <div className="label-field">
              <span className="label-field-name">الوزن:</span>
              <span className="label-field-value">{catData.weight} كجم</span>
            </div>
            <div className="label-field">
              <span className="label-field-name">السلالة:</span>
              <span className="label-field-value">{breedLabel(catData.breed).substring(0, 15)}</span>
            </div>
          </div>

          {/* Box Information */}
          <div className="label-section">
            <div className="label-section-title">البوكس</div>
            <div className="label-field">
              <span className="label-field-name">المدة:</span>
              <span className="label-field-value">{boxSummary.totalDays} يوم</span>
            </div>
            <div className="label-field">
              <span className="label-field-name">DER يومي:</span>
              <span className="label-field-value">{formatNumber(results.der, 0)} ك.ك</span>
            </div>
          </div>

          {/* Contents */}
          <div className="label-contents">
            <div className="label-contents-title">المحتويات:</div>
            <div className="label-contents-item">
              <span>دراي فود:</span>
              <span>{formatNumber(boxSummary.totalDryGrams / 1000, 2)} كجم</span>
            </div>
            <div className="label-contents-item">
              <span>ويت فود:</span>
              <span>{formatNumber(boxSummary.unitsUsed, 0)} وحدة</span>
            </div>
            {costs && costs.totalCost > 0 && (
              <div className="label-contents-item">
                <span>التكلفة:</span>
                <span>{formatNumber(costs.totalCost, 0)} {pricing.currency}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="label-qr">
          <QRCode 
            data={generateQRData()} 
            size={80} 
            className="label-qr-code"
          />
          <div className="label-qr-text">
            مسح للمعلومات<br/>الكاملة
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