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
            line-height: 1.5;
            color: #1f2937;
            background: white;
            padding: 20px;
          }
          
          .print-header {
            text-align: center;
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .print-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          
          .print-subtitle {
            font-size: 13px;
            opacity: 0.95;
            margin-top: 4px;
          }
          
          .print-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
            background: #f9fafb;
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
          }
          
          .print-section-title {
            font-size: 16px;
            font-weight: bold;
            color: #0ea5e9;
            border-bottom: 2px solid #0ea5e9;
            padding-bottom: 8px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .print-section-title::before {
            content: '●';
            color: #0ea5e9;
            font-size: 20px;
          }
          
          .print-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 15px;
          }
          
          .print-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 15px;
          }
          
          .print-field {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            gap: 10px;
          }
          
          .print-field-label {
            font-weight: 600;
            color: #374151;
            min-width: 100px;
            flex-shrink: 0;
            font-size: 11px;
          }
          
          .print-field-value {
            color: #111827;
            text-align: right;
            flex: 1;
            font-weight: 500;
            font-size: 12px;
          }
          
          .print-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 15px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #d1d5db;
            padding: 10px 8px;
            text-align: center;
            font-size: 11px;
          }
          
          .print-table th {
            background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          
          .print-table tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .print-table tbody tr:hover {
            background-color: #f0f9ff;
          }
          
          .print-table .wet-day {
            background-color: #dbeafe !important;
            font-weight: 600;
          }
          
          .print-highlights {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          
          .print-highlight {
            text-align: center;
            padding: 18px 12px;
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);
          }
          
          .print-highlight-value {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 6px;
          }
          
          .print-highlight-label {
            font-size: 11px;
            opacity: 0.95;
            line-height: 1.3;
          }
          
          .print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
          }
          
          .no-print {
            display: none !important;
          }
          
          .meal-details-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px;
            margin-top: 15px;
          }
          
          .meal-day-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .meal-day-header {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 2px solid #0ea5e9;
            color: #0ea5e9;
            text-align: center;
          }
          
          .meal-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 6px;
            margin-bottom: 6px;
          }
          
          .meal-card:last-child {
            margin-bottom: 0;
          }
          
          .meal-title {
            font-weight: bold;
            font-size: 9px;
            color: #374151;
            margin-bottom: 4px;
          }
          
          .meal-info {
            font-size: 8px;
            line-height: 1.4;
            color: #6b7280;
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

        {/* Meal Details - Enhanced Layout */}
        <div style={{ marginTop: '20px' }}>
          <div className="print-section-title">تفاصيل الوجبات اليومية</div>
          <div className="meal-details-grid">
            {results.weeklyData.map((day: any, dayIndex: number) => (
              <div key={dayIndex} className="meal-day-card">
                <div className="meal-day-header">
                  <div>{day.day}</div>
                  <div style={{ 
                    backgroundColor: day.type === 'wet' ? '#dbeafe' : '#f3f4f6',
                    color: day.type === 'wet' ? '#1e40af' : '#374151',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    marginTop: '4px',
                    display: 'inline-block'
                  }}>
                    {day.type === 'wet' ? '🥫 ويت' : '🥘 دراي'}
                  </div>
                </div>
                <div>
                  {day.mealsBreakdown.map((meal: any, mealIndex: number) => {
                    const isPouch = foodData.wetPackType === 'pouch'
                    
                    return (
                      <div key={mealIndex} className="meal-card">
                        <div className="meal-title">وجبة {meal.mealIndex}</div>
                        <div className="meal-info">
                          <div>⚡ {formatNumber(meal.kcal, 0)} ك.ك</div>
                          {meal.wetGrams > 0 && (
                            <div>
                              {isPouch 
                                ? `🥫 ${formatNumber(meal.wetUnits || 0, 1)} باوتش`
                                : `🥫 ${formatNumber(meal.wetGrams, 0)} جرام`
                              }
                            </div>
                          )}
                          {meal.dryGrams > 0 && <div>🥘 {formatNumber(meal.dryGrams, 0)} جرام</div>}
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
          <div className="print-section-title">التوصيات الهامة</div>
          <ul style={{ margin: 0, paddingRight: '20px', fontSize: '11px', lineHeight: '1.8' }}>
            {results.recommendations.map((rec: string, index: number) => (
              <li key={index} style={{ marginBottom: '8px', color: '#374151' }}>
                <strong style={{ color: '#0ea5e9' }}>●</strong> {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="print-footer">
        <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0ea5e9' }}>
          🐱 Bastet Pet - نظام تغذية القطط الاحترافي
        </div>
        <div style={{ marginBottom: '5px' }}>
          تم إنشاء هذا التقرير بواسطة نظام حساب علمي دقيق معتمد على معايير FEDIAF
        </div>
        <div style={{ fontSize: '9px', color: '#9ca3af' }}>
          للاستفسارات والدعم، تواصل معنا | تاريخ الطباعة: {formatDate()}
        </div>
      </div>

    </div>
  )
}