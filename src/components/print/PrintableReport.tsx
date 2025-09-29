'use client'

import React from 'react'
import { formatNumber } from '@/lib/utils'

interface PrintableReportProps {
  catData: any
  foodData: any
  results: any
  costs: any
  pricing: any
  boxSummary: any
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  catData,
  foodData,
  results,
  costs,
  pricing,
  boxSummary
}) => {
  const formatDate = () => {
    return new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const breedDisplay = () => {
    if (catData?.breedMode === 'mixed') {
      const a = breedLabel(catData?.breedMixA || catData?.breed)
      const b = breedLabel(catData?.breedMixB || catData?.breed)
      return `${a} × ${b} (خليط)`
    }
    if (catData?.breedMode === 'other') {
      return catData?.breedOther || 'غير محدد'
    }
    return breedLabel(catData?.breed)
  }

  const getBCSDescription = (bcs: number) => {
    const descriptions: Record<number, string> = {
      1: 'نحيف جداً - ضلوع وعظام واضحة جداً',
      2: 'نحيف - ضلوع وعظام واضحة', 
      3: 'تحت الوزن - ضلوع محسوسة بسهولة',
      4: 'أقل من المثالي - ضلوع محسوسة بلمسة خفيفة',
      5: 'مثالي - وزن مثالي وشكل متناسق',
      6: 'فوق المثالي قليلاً - صعوبة في الإحساس بالضلوع',
      7: 'زيادة وزن - دهون واضحة على الجسم',
      8: 'بدانة - دهون كثيرة وصعوبة في الحركة',
      9: 'بدانة مفرطة - دهون مفرطة تؤثر على الصحة'
    }
    return descriptions[bcs] || 'غير محدد'
  }

  if (!results) return null

  return (
    <div className="print-report" dir="rtl">
      <style jsx>{`
        @media print {
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
          
          .print-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .print-field {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 5px 0;
            border-bottom: 1px dotted #ccc;
            gap: 10px;
          }
          
          .print-field-label {
            font-weight: bold;
            color: #374151;
            min-width: 80px;
            flex-shrink: 0;
          }
          
          .print-field-value {
            color: #000;
            text-align: right;
            flex: 1;
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
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="print-header">
        <div className="print-title">تقرير تغذية القطة</div>
        <div className="print-subtitle">حساب علمي للسعرات اليومية وخطة التغذية الأسبوعية</div>
        <div className="print-subtitle">{formatDate()}</div>
      </div>

      {/* Client Information */}
      <div className="print-section">
        <div className="print-section-title">معلومات العميل</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">اسم العميل:</span>
            <span className="print-field-value">{catData.clientName || 'غير محدد'}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">رقم الهاتف:</span>
            <span className="print-field-value">{catData.clientPhone || 'غير محدد'}</span>
          </div>
        </div>
        {catData.clientAddress && (
          <div className="print-field">
            <span className="print-field-label">العنوان:</span>
            <span className="print-field-value">{catData.clientAddress}</span>
          </div>
        )}
      </div>

      {/* Cat Information */}
      <div className="print-section">
        <div className="print-section-title">بيانات القطة</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">الاسم:</span>
            <span className="print-field-value">{catData.name || 'غير محدد'}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">العمر:</span>
            <span className="print-field-value">{catData.ageValue} {catData.ageUnit === 'months' ? 'شهور' : 'سنوات'}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">الوزن:</span>
            <span className="print-field-value">{catData.weight} كجم</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">الجنس:</span>
            <span className="print-field-value">{catData.sex === 'female' ? 'أنثى' : 'ذكر'}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">السلالة:</span>
            <span className="print-field-value">{breedDisplay()}</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">التعقيم:</span>
            <span className="print-field-value">
              {catData.neuter === 'neutered' 
                ? (catData.sex === 'male' ? 'معقم' : 'معقمة') 
                : (catData.sex === 'male' ? 'غير معقم' : 'غير معقمة')
              }
            </span>
          </div>
          <div className="print-field">
            <span className="print-field-label">حالة الجسم (BCS):</span>
            <span className="print-field-value">{catData.bcs}/9 - {getBCSDescription(catData.bcs)}</span>
          </div>
        </div>
      </div>

      {/* Nutrition Calculations */}
      <div className="print-section">
        <div className="print-section-title">الحسابات الغذائية</div>
        <div className="print-highlights">
          <div className="print-highlight">
            <div className="print-highlight-value">{formatNumber(results.der, 1)}</div>
            <div className="print-highlight-label">DER - الطاقة اليومية<br/>(كيلو كالوري/يوم)</div>
          </div>
          <div className="print-highlight">
            <div className="print-highlight-value">{catData.meals}</div>
            <div className="print-highlight-label">عدد الوجبات<br/>في اليوم</div>
          </div>
          <div className="print-highlight">
            <div className="print-highlight-value">{formatNumber(results.usedWeight, 1)} كجم</div>
            <div className="print-highlight-label">الوزن الحالي<br/>للقطة</div>
          </div>
        </div>
      </div>

      {/* Weight Status */}
      <div className="print-section">
        <div className="print-section-title">حالة الوزن</div>
        <div className="print-grid">
          <div className="print-field">
            <span className="print-field-label">الوزن الحالي:</span>
            <span className="print-field-value">{formatNumber(results.usedWeight, 1)} كجم</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">الوزن المثالي:</span>
            <span className="print-field-value">{formatNumber(results.idealWeight, 1)} كجم</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">النطاق الطبيعي:</span>
            <span className="print-field-value">{formatNumber(results.weightRange[0], 1)} - {formatNumber(results.weightRange[1], 1)} كجم</span>
          </div>
          <div className="print-field">
            <span className="print-field-label">حالة الوزن:</span>
            <span className="print-field-value">
              {results.weightStatus === 'ok' && 'طبيعي'}
              {results.weightStatus === 'low' && 'منخفض'}
              {results.weightStatus === 'high' && 'مرتفع'}
              {results.weightStatus === 'na' && 'غير محدد'}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="print-section">
        <div className="print-section-title">الجدول الأسبوعي</div>
        <table className="print-table">
          <thead>
            <tr>
              <th>اليوم</th>
              <th>النوع</th>
              <th>DER</th>
              <th>ويت (ك.ك)</th>
              <th>دراي (ك.ك)</th>
              <th>ويت (جرام)</th>
              <th>دراي (جرام)</th>
              <th>عدد الوحدات</th>
            </tr>
          </thead>
          <tbody>
            {results.weeklyData.map((day: any, index: number) => (
              <tr key={index} className={day.type === 'wet' ? 'wet-day' : ''}>
                <td>{day.day}</td>
                <td>{day.type === 'wet' ? 'ويت' : 'دراي'}</td>
                <td>{formatNumber(day.der, 0)}</td>
                <td>{formatNumber(day.wetKcal, 0)}</td>
                <td>{formatNumber(day.dryKcal, 0)}</td>
                <td>{formatNumber(day.wetGrams, 0)}</td>
                <td>{formatNumber(day.dryGrams, 0)}</td>
                <td>{formatNumber(day.units, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Meal Details - Compact Layout */}
        <div style={{ marginTop: '15px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', color: '#0ea5e9' }}>تفاصيل الوجبات</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
            {results.weeklyData.map((day: any, dayIndex: number) => (
              <div key={dayIndex} style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '8px', fontSize: '10px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{day.day}</span>
                  <span style={{ 
                    backgroundColor: day.type === 'wet' ? '#dbeafe' : '#f3f4f6',
                    color: day.type === 'wet' ? '#1e40af' : '#374151',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontSize: '9px'
                  }}>
                    {day.type === 'wet' ? 'ويت' : 'دراي'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '4px' }}>
                  {day.mealsBreakdown.map((meal: any, mealIndex: number) => {
                    // Determine display based on package type
                    const isPouch = foodData.wetPackType === 'pouch'
                    
                    return (
                      <div key={mealIndex} style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '3px', padding: '4px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '9px', marginBottom: '2px' }}>وجبة {meal.mealIndex}</div>
                        <div style={{ fontSize: '8px', lineHeight: '1.2' }}>
                          <div>{formatNumber(meal.kcal, 0)} ك.ك</div>
                          {meal.wetGrams > 0 && (
                            <div>
                              {isPouch 
                                ? `باوتش: ${formatNumber(meal.wetUnits || 0, 1)} وحدة`
                                : `ويت: ${formatNumber(meal.wetGrams, 0)}ج`
                              }
                            </div>
                          )}
                          {meal.dryGrams > 0 && <div>دراي: {formatNumber(meal.dryGrams, 0)}ج</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="print-section">
          <div className="print-section-title">التوصيات</div>
          <ul style={{ margin: 0, paddingRight: '20px', fontSize: '11px' }}>
            {results.recommendations.map((rec: string, index: number) => (
              <li key={index} style={{ marginBottom: '3px' }}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}