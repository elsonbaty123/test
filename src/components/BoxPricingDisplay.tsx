'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BoxTypeConfig {
  id: string;
  name: string;
  description: string;
  includeDryFood: boolean;
  includeWetFood: boolean;
  wetFoodBagsPerWeek: number;
  includeTreat: boolean;
  isPremium?: boolean;
  premiumWetBagsPerWeek?: number;
}

interface BoxVariant {
  duration: 'week' | 'twoWeeks';
  durationLabel: string;
  multiplier: number;
  packagingMultiplier: number;
}

interface BoxPricing {
  boxType: BoxTypeConfig;
  variant: BoxVariant;
  costs: {
    dryCost: number;
    wetCost: number;
    treatCost: number;
    packagingCost: number;
    additionalCosts: number;
    totalCostBeforeProfit: number;
    profitAmount: number;
    totalCostWithProfit: number;
    discountAmount: number;
    totalCostAfterDiscount: number;
    totalCostWithDelivery: number;
    deliveryCost: number;
    perDay: number;
  };
}

interface BoxPricingDisplayProps {
  boxPricings: BoxPricing[]
  currency: string
  formatNumber: (n: number, digits?: number) => string
  onSelectBox?: (boxPricing: BoxPricing) => void
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
  const groupedByType = boxPricings.reduce((acc, pricing) => {
    const typeId = pricing.boxType.id
    if (!acc[typeId]) {
      acc[typeId] = []
    }
    acc[typeId].push(pricing)
    return acc
  }, {} as Record<string, BoxPricing[]>)

  const getBoxTypeColor = (typeId: string) => {
    switch (typeId) {
      case 'mimi':
        return 'border-green-200 bg-green-50'
      case 'toty':
        return 'border-blue-200 bg-blue-50'
      case 'qatqoot_azam':
        return 'border-purple-200 bg-purple-50'
      case 'qatqoot_azam_premium':
        return 'border-gold-200 bg-gradient-to-br from-yellow-50 to-orange-50'
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
      case 'qatqoot_azam':
        return '👑'
      case 'qatqoot_azam_premium':
        return '💎'
      default:
        return '📦'
    }
  }

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
                        {boxType.isPremium && (
                          <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                            بريميم
                          </Badge>
                        )}
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
                        🥫 ويت فود ({boxType.isPremium ? boxType.premiumWetBagsPerWeek : boxType.wetFoodBagsPerWeek} كيس/أسبوع)
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

                      {/* Cost breakdown */}
                      <div className="space-y-2 text-sm mb-4">
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
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>السعر النهائي:</span>
                            <span className="text-lg text-green-600">
                              {formatNumber(pricing.costs.totalCostWithDelivery, 2)} {currency}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>يومياً:</span>
                            <span>{formatNumber(pricing.costs.perDay, 2)} {currency}</span>
                          </div>
                        </div>
                      </div>

                      {onSelectBox && (
                        <Button
                          onClick={() => onSelectBox(pricing)}
                          className="w-full"
                          variant="outline"
                        >
                          اختيار هذا البوكس
                        </Button>
                      )}
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
            <li>• جميع البوكسات تشمل تريت هدية</li>
            <li>• البوكس البريميم متاح لأسبوع واحد فقط</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default BoxPricingDisplay
