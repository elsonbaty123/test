'use client'

import React, { useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BoxPricing as NutritionBoxPricing, BoxTypeConfig as NutritionBoxTypeConfig, BoxVariant as NutritionBoxVariant } from '@/hooks/useCatNutrition'

type DisplayBoxTypeConfig = NutritionBoxTypeConfig
type DisplayBoxVariant = NutritionBoxVariant
type DisplayBoxPricing = NutritionBoxPricing

interface BoxPricingDisplayProps {
  boxPricings: DisplayBoxPricing[]
  currency: string
  formatNumber: (n: number, digits?: number) => string
  onSelectBox?: (boxPricing: DisplayBoxPricing) => void
}

const BoxPricingDisplay: React.FC<BoxPricingDisplayProps> = ({
  boxPricings,
  currency,
  formatNumber,
  onSelectBox
}) => {
  if (!boxPricings || boxPricings.length === 0) {
    return null
  }

  // Group by box type
  const groupedByType = boxPricings.reduce((acc: Record<string, DisplayBoxPricing[]>, pricing) => {
    const typeId = pricing.boxType.id
    if (!acc[typeId]) {
      acc[typeId] = []
    }
    acc[typeId].push(pricing)
    return acc
  }, {} as Record<string, DisplayBoxPricing[]>)

  const getBoxTypeColor = (typeId: string) => {
    switch (typeId) {
      case 'mimi':
        return 'border-green-200 bg-green-50'
      case 'toty':
        return 'border-blue-200 bg-blue-50'
      case 'qatty':
        return 'border-orange-200 bg-orange-50'
      case 'qatqoot_azam':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getBoxTypeIcon = (typeId: string) => {
    switch (typeId) {
      case 'mimi':
        return '💰'
      case 'toty':
        return '🐱'
      case 'qatty':
        return '🧡'
      case 'qatqoot_azam':
        return '👑'
      default:
        return '📦'
    }
  }

  const tableRef = useRef<HTMLDivElement>(null)

  const handlePrintBoxSchedule = (pricing: DisplayBoxPricing) => {
    const printWindow = window.open('', '_blank', 'width=900,height=1024')
    if (!printWindow) return

    const styles = `
      <style>
        body { font-family: 'Arial', sans-serif; direction: rtl; padding: 24px; background: #fff; color: #1f2937; }
        h1 { font-size: 22px; margin-bottom: 12px; color: #0f172a; }
        h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; color: #1f2937; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 13px; text-align: center; }
        th { background: #f8fafc; }
        .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 12px; }
        .meta-item { background: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
        .meta-item span { display: block; }
        .meta-item .label { color: #64748b; font-size: 12px; }
        .meta-item .value { font-weight: 600; }
        .totals { margin-top: 16px; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
        .totals div { border: 1px solid #cbd5f5; background: #eff6ff; padding: 10px; border-radius: 8px; font-size: 13px; }
      </style>
    `

    const headerHtml = `
      <h1>جدول تغذية بوكس ${pricing.boxType.name} - ${pricing.variant.durationLabel}</h1>
      <div class="meta">
        <div class="meta-item">
          <span class="label">المدة</span>
          <span class="value">${pricing.variant.durationLabel} (${pricing.durationDays} يوم)</span>
        </div>
        <div class="meta-item">
          <span class="label">إجمالي الدراي</span>
          <span class="value">${formatNumber(pricing.consumption.dryGrams, 0)} جم</span>
        </div>
        <div class="meta-item">
          <span class="label">إجمالي الويت</span>
          <span class="value">${pricing.boxType.includeWetFood ? formatNumber(pricing.consumption.wetGrams, 0) + ' جم' : 'لا يوجد'}</span>
        </div>
        <div class="meta-item">
          <span class="label">أكياس الويت المقترحة</span>
          <span class="value">${pricing.boxType.includeWetFood ? formatNumber(pricing.consumption.wetUnitsSuggested, 0) : '0'}</span>
        </div>
        <div class="meta-item">
          <span class="label">أكياس الويت المستخدمة</span>
          <span class="value">${pricing.boxType.includeWetFood ? formatNumber(pricing.consumption.wetUnitsUsed, 0) : '0'}</span>
        </div>
      </div>

      <div class="totals">
        <div>السعر قبل الخصم: ${formatNumber(pricing.costs.totalCostBeforeDiscount + pricing.costs.deliveryCost, 2)} ${currency}</div>
        <div>السعر بعد الخصم: ${formatNumber(pricing.costs.totalCostAfterDiscount + pricing.costs.deliveryCost, 2)} ${currency}</div>
        <div>المبلغ اليومي: ${formatNumber(pricing.costs.perDay, 2)} ${currency}</div>
      </div>
    `

    const tableHtml = `
      <h2>تفاصيل الأيام</h2>
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
          ${pricing.breakdown.map((day, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${day.type === 'wet' ? 'ويت' : 'دراي'}</td>
              <td>${formatNumber(day.der, 1)}</td>
              <td>${formatNumber(day.dryGrams, 0)}</td>
              <td>${formatNumber(day.wetGrams, 0)}</td>
              <td>${formatNumber(day.units, 2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8" />${styles}</head><body>${headerHtml}${tableHtml}</body></html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 400)
  }

  const handlePrintTable = () => {
    if (!tableRef.current) return
    const printWindow = window.open('', '_blank', 'width=1024,height=768')
    if (!printWindow) return

    const styles = `
      <style>
        body { font-family: 'Arial', sans-serif; padding: 24px; direction: rtl; background: #fff; color: #1f2937; }
        h2 { font-size: 20px; margin-bottom: 16px; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: center; font-size: 14px; }
        th { background: #f1f5f9; font-weight: 600; }
        td.features { text-align: right; }
        .highlight { color: #047857; font-weight: 600; }
      </style>
    `

    printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>جدول أسعار البوكسات</title>${styles}</head><body>${tableRef.current.innerHTML}</body></html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 300)
  }

  const tableRows = useMemo(() => {
    return boxPricings.map((pricing) => {
      const beforeDiscountWithDelivery = pricing.costs.totalCostBeforeDiscount + pricing.costs.deliveryCost
      const afterDiscountWithDelivery = pricing.costs.totalCostAfterDiscount + pricing.costs.deliveryCost
      const features: string[] = []
      if (pricing.boxType.includeDryFood) features.push('🥘 دراي فود')
      if (pricing.boxType.includeWetFood) features.push(`🥫 ويت فود (${pricing.boxType.wetFoodBagsPerWeek} كيس/أسبوع)`)
      if (pricing.boxType.includeTreat) features.push('🍪 تريت')
      return {
        id: `${pricing.boxType.id}-${pricing.variant.duration}`,
        name: pricing.boxType.name,
        duration: pricing.variant.durationLabel,
        features,
        before: beforeDiscountWithDelivery,
        after: afterDiscountWithDelivery,
        savings: pricing.costs.savings,
      }
    })
  }, [boxPricings])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📋</span>
          أسعار البوكسات المتاحة
        </CardTitle>
        <CardDescription>
          اختر البوكس المناسب لقطتك - الأسعار محسوبة حسب الاحتياجات الغذائية
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedByType).map(([typeId, pricings]) => {
            const boxType = pricings[0].boxType
            return (
              <div key={typeId} className={`border rounded-lg p-4 ${getBoxTypeColor(typeId)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getBoxTypeIcon(typeId)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {boxType.name}
                      </h3>
                      <p className="text-sm text-gray-600">{boxType.description}</p>
                    </div>
                  </div>
                </div>

                {/* Box contents */}
                <div className="mb-4 p-3 bg-white/50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">محتويات البوكس:</h4>
                  <div className="flex flex-wrap gap-2">
                    {boxType.includeDryFood && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        🥘 دراي فود
                      </Badge>
                    )}
                    {boxType.includeWetFood && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        🥫 ويت فود ({boxType.wetFoodBagsPerWeek} كيس/أسبوع)
                      </Badge>
                    )}
                    {boxType.includeTreat && (
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        🍪 تريت هدية
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Pricing variants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricings.map((pricing) => (
                    <div key={`${typeId}-${pricing.variant.duration}`} className="bg-white rounded-lg p-4 border shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">
                          {pricing.variant.durationLabel}
                        </h4>
                        {pricing.variant.duration === 'twoWeeks' && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            وفّر في التغليف
                          </Badge>
                        )}
                      </div>

                      {/* Consumption breakdown */}
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>إجمالي الدراي:</span>
                          <span>{formatNumber(pricing.consumption.dryGrams, 0)} جم</span>
                        </div>
                        {pricing.boxType.includeWetFood && (
                          <>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>إجمالي الويت:</span>
                              <span>{formatNumber(pricing.consumption.wetGrams, 0)} جم</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>عدد أكياس الويت المقترحة:</span>
                              <span>{formatNumber(pricing.consumption.wetUnitsSuggested, 0)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>عدد أكياس الويت المستخدمة:</span>
                              <span>{formatNumber(pricing.consumption.wetUnitsUsed, 0)}</span>
                            </div>
                          </>
                        )}

                        <div className="h-px bg-slate-200" />

                        {/* Cost breakdown */}
                        {pricing.costs.dryCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">دراي فود:</span>
                            <span>{formatNumber(pricing.costs.dryCost, 2)} {currency}</span>
                          </div>
                        )}
                        {pricing.costs.wetCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">ويت فود:</span>
                            <span>{formatNumber(pricing.costs.wetCost, 2)} {currency}</span>
                          </div>
                        )}
                        {pricing.costs.treatCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">تريت:</span>
                            <span>{formatNumber(pricing.costs.treatCost, 2)} {currency}</span>
                          </div>
                        )}
                        {pricing.boxType.includeTreat && (
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>عدد التريت:</span>
                            <span>
                              {pricing.variant.duration === 'week' && `${formatNumber(pricing.boxType.treatUnitsPerDuration.week, 0)} / الأسبوع`}
                              {pricing.variant.duration === 'twoWeeks' && `${formatNumber(pricing.boxType.treatUnitsPerDuration.twoWeeks, 0)} / أسبوعين`}
                              {pricing.variant.duration === 'month' && `${formatNumber(pricing.boxType.treatUnitsPerDuration.month, 0)} / الشهر`}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">تغليف:</span>
                          <span>{formatNumber(pricing.costs.packagingCost, 2)} {currency}</span>
                        </div>
                        {pricing.costs.additionalCosts > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">إضافي:</span>
                            <span>{formatNumber(pricing.costs.additionalCosts, 2)} {currency}</span>
                          </div>
                        )}

                        <div className="border-t pt-3 mt-3 space-y-2">
                          <div className="flex justify-between text-sm text-gray-700">
                            <span>السعر قبل الخصم:</span>
                            <span className="line-through text-gray-400">
                              {formatNumber(pricing.costs.totalCostBeforeDiscount + pricing.costs.deliveryCost, 2)} {currency}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>السعر بعد الخصم:</span>
                            <span className="text-lg text-green-600">
                              {formatNumber(pricing.costs.totalCostAfterDiscount + pricing.costs.deliveryCost, 2)} {currency}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-green-700">
                            <span>وفّرت:</span>
                            <span>{formatNumber(pricing.costs.savings, 2)} {currency}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>السعر اليومي:</span>
                            <span>{formatNumber(pricing.costs.perDay, 2)} {currency}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t mt-3">
                        {onSelectBox && (
                          <Button
                            onClick={() => onSelectBox(pricing)}
                            className="w-full"
                            variant="outline"
                          >
                            اختيار هذا البوكس
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => handlePrintBoxSchedule(pricing)}
                          className="w-full"
                        >
                          طباعة جدول هذا البوكس
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">ملاحظات مهمة:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• الأسعار محسوبة حسب الاحتياجات الغذائية الفعلية لقطتك</li>
            <li>• تكاليف التغليف لا تتكرر في خطة الأسبوعين</li>
            <li>• التريت متاح في بعض البوكسات حسب النوع والمدة</li>
            <li>• الأسعار الموضحة تشمل التوصيل بعد الخصم</li>
          </ul>
        </div>

        <div className="mt-6 bg-white border border-slate-200 rounded-lg p-4 space-y-4" ref={tableRef}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">جدول مقارنة البوكسات</h3>
              <p className="text-sm text-slate-500">عرض سريع لكل بوكس، المواصفات، والسعر قبل وبعد الخصم</p>
            </div>
            <Button variant="outline" onClick={handlePrintTable} className="whitespace-nowrap">طباعة الجدول</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 border border-slate-200">البوكس</th>
                  <th className="px-3 py-2 border border-slate-200">المدة</th>
                  <th className="px-3 py-2 border border-slate-200 text-right">المواصفات</th>
                  <th className="px-3 py-2 border border-slate-200">السعر قبل الخصم</th>
                  <th className="px-3 py-2 border border-slate-200">السعر بعد الخصم</th>
                  <th className="px-3 py-2 border border-slate-200">وفّرت</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.id} className="even:bg-slate-50">
                    <td className="px-3 py-2 border border-slate-200 font-semibold text-slate-800">{row.name}</td>
                    <td className="px-3 py-2 border border-slate-200 text-slate-600">{row.duration}</td>
                    <td className="px-3 py-2 border border-slate-200 text-slate-600 text-right">
                      {row.features.map((feature, idx) => (
                        <span key={feature}>
                          {feature}
                          {idx < row.features.length - 1 ? ' • ' : ''}
                        </span>
                      ))}
                    </td>
                    <td className="px-3 py-2 border border-slate-200 text-slate-600">
                      {formatNumber(row.before, 2)} {currency}
                    </td>
                    <td className="px-3 py-2 border border-slate-200 text-green-600 font-semibold">
                      {formatNumber(row.after, 2)} {currency}
                    </td>
                    <td className="px-3 py-2 border border-slate-200 text-emerald-600">
                      {formatNumber(row.savings, 2)} {currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BoxPricingDisplay
