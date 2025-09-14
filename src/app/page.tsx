'use client'

import { useState, useEffect } from 'react'

import { useCatNutrition } from '@/hooks/useCatNutrition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function CatNutritionCalculator() {
  const {
    catData,
    handleCatDataChange,
    foodData,
    handleFoodDataChange,
    weeklyPlan,
    handleWeeklyPlanChange,
    handleWetDayToggle,
    boxBuilder,
    handleBoxBuilderChange,
    pricing,
    handlePricingChange,
    results,
    errors,
    costs,
    isCalculating,
    dayNames,
    ACTIVITY_LEVELS,
    BREED_WEIGHT_RANGES,
    DEFAULT_RANGE,
    autoDistributeWetDays,
    calculateNutrition,
    formatNumber
  } = useCatNutrition()

  const [isSaving, setIsSaving] = useState(false)
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

  const loadClient = async () => {
    try {
      const clientName = (catData.clientName || '').trim()
      if (!clientName) {
        alert('أدخل اسم العميل أولاً')
        return
      }
      const res = await fetch(`/api/clients?name=${encodeURIComponent(clientName)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'غير موجود')
      const data = json?.data
      if (data?.catData) {
        Object.entries(data.catData).forEach(([k, v]) => {
          // @ts-ignore
          handleCatDataChange(k as any, v as any)
        })
      }
      if (data?.foodData) {
        Object.entries(data.foodData).forEach(([k, v]) => {
          // @ts-ignore
          handleFoodDataChange(k as any, v as any)
        })
      }
      if (data?.weeklyPlan) {
        const wp = data.weeklyPlan
        if (Array.isArray(wp.wetDays)) {
          handleWeeklyPlanChange('wetDays', wp.wetDays)
          handleWeeklyPlanChange('wetDaysCount', wp.wetDays.filter((b: boolean) => !!b).length)
        }
        if (typeof wp.wetMealIndex !== 'undefined') handleWeeklyPlanChange('wetMealIndex', wp.wetMealIndex)
      }
      if (data?.boxBuilder) {
        Object.entries(data.boxBuilder).forEach(([k, v]) => {
          // @ts-ignore
          handleBoxBuilderChange(k as any, v as any)
        })
      }
      if (data?.pricing) {
        Object.entries(data.pricing).forEach(([k, v]) => {
          // @ts-ignore
          handlePricingChange(k as any, v as any)
        })
      }
      alert('تم تحميل بيانات العميل')
    } catch (e) {
      console.error('Load client failed:', e)
      alert('فشل تحميل بيانات العميل')
    }
  }

  // Auto-load saved data on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('catNutritionData')
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.catData) {
        Object.entries(data.catData).forEach(([k, v]) => {
          // @ts-ignore
          handleCatDataChange(k as any, v as any)
        })
      }
      if (data?.foodData) {
        Object.entries(data.foodData).forEach(([k, v]) => {
          // @ts-ignore
          handleFoodDataChange(k as any, v as any)
        })
      }
      if (data?.weeklyPlan) {
        const wp = data.weeklyPlan
        if (Array.isArray(wp.wetDays)) {
          handleWeeklyPlanChange('wetDays', wp.wetDays)
          handleWeeklyPlanChange('wetDaysCount', wp.wetDays.filter((b: boolean) => !!b).length)
        }
        if (typeof wp.wetMealIndex !== 'undefined') handleWeeklyPlanChange('wetMealIndex', wp.wetMealIndex)
      }
      if (data?.boxBuilder) {
        Object.entries(data.boxBuilder).forEach(([k, v]) => {
          // @ts-ignore
          handleBoxBuilderChange(k as any, v as any)
        })
      }
      if (data?.pricing) {
        Object.entries(data.pricing).forEach(([k, v]) => {
          // @ts-ignore
          handlePricingChange(k as any, v as any)
        })
      }
    } catch (e) {
      console.error('Load failed:', e)
    }
  }, [])

  const saveData = async () => {
    setIsSaving(true)
    try {
      const clientName = (catData.clientName || '').trim()
      if (!clientName) {
        alert('الرجاء إدخال اسم العميل')
        return
      }
      const dataToSave = {
        catData,
        foodData,
        weeklyPlan,
        boxBuilder,
        pricing
      }
      // Save to server (persistent)
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, data: dataToSave })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'خطأ غير معروف')
      alert(json.created ? 'تم إنشاء ملف جديد للعميل' : 'تم تحديث ملف العميل')
      // Fallback local cache
      localStorage.setItem('catNutritionData', JSON.stringify(dataToSave))
    } catch (error) {
      console.error('Save failed:', error)
      alert('فشل الحفظ. تحقق من الاتصال بالسيرفر.')
    } finally {
      setIsSaving(false)
    }
  }

  const resetData = () => {
    if (confirm('هل أنت متأكد من إعادة الضبط؟')) {
      localStorage.removeItem('catNutritionData')
      window.location.reload()
    }
  }

  const printReport = () => {
    window.print()
  }

  const printBoxLabel = () => {
    if (!results) {
      alert('الرجاء حساب الجدول أولاً')
      return
    }
    
    const labelContent = `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 15px; color: #333;">ملصق بوكس تغذية القطة</h2>
        <div style="border: 2px solid #333; padding: 15px; border-radius: 8px;">
          <p><strong>اسم العميل:</strong> ${catData.clientName || 'غير محدد'}</p>
          <p><strong>اسم القطة:</strong> ${catData.name || 'غير محدد'}</p>
          <p><strong>الوزن:</strong> ${catData.weight} كجم</p>
          <p><strong>السلالة:</strong> ${catData.breed === 'other' ? (catData.breedOther || '—') : breedLabel(catData.breed)}</p>
          <p><strong>التعقيم:</strong> ${catData.neuter === 'neutered' ? 'معقّم/مخصي' : 'غير معقّم/سليم'}</p>
          <p><strong>مستوى النشاط:</strong> ${results.activityInfo.label}</p>
          <p><strong>مدة البوكس:</strong> ${results.boxSummary.totalDays} يوم</p>
          <p><strong>السعرات اليومية:</strong> ${results.der} كيلو كالوري</p>
          <hr style="margin: 10px 0;">
          <p><strong>الدراي الإجمالي:</strong> ${formatNumber(results.boxSummary.totalDryGrams, 1)} جم</p>
          <p><strong>الويت الإجمالي:</strong> ${formatNumber(results.boxSummary.totalWetGrams, 1)} جم</p>
          <p><strong>عدد وحدات الويت:</strong> ${results.boxSummary.unitsUsed}</p>
          <p><strong>حجم كل وجبة ويت:</strong> ${formatNumber(results.boxSummary.servingSize, 1)} جم</p>
          <hr style="margin: 10px 0;">
          <p style="font-size: 12px; color: #666;">
            <strong>ملاحظات:</strong><br>
            • قسم الدراي إلى حصص يومية ≈ ${Math.round(results.boxSummary.totalDryGrams / results.boxSummary.totalDays / 5) * 5} جم/يوم<br>
            • اتبع تعليمات التوزيع الأسبوعية<br>
            • راجع طبيب بيطري لأي استفسارات
          </p>
          <p style="text-align: center; margin-top: 15px; font-size: 11px; color: #999;">
            تم التحضير: ${new Date().toLocaleDateString('ar-EG')}
          </p>
        </div>
      </div>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow?.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ملصق بوكس تغذية القطة</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          @media print { body { margin: 0; padding: 10px; } }
        </style>
      </head>
      <body>
        ${labelContent}
      </body>
      </html>
    `)
    printWindow?.document.close()
    printWindow?.print()
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-sky-500 to-teal-500 text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-2">حاسبة تغذية القطة + صانع البوكسات</h1>
          <p className="text-sm md:text-base opacity-90">سعرات محسوبة علميًا + جدول أسبوعي + بوكس شهري 30 يوم</p>
        </div>
      </header>
      {/* Advisory removed per user request */}

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Cat Data */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات القطة</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">اسم العميل</Label>
              <Input
                id="clientName"
                placeholder="مثال: د. أحمد"
                value={catData.clientName}
                onChange={(e) => handleCatDataChange('clientName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">اسم القطة</Label>
              <Input
                id="name"
                placeholder="مثال: لولا"
                value={catData.name}
                onChange={(e) => handleCatDataChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>العمر</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="رقم"
                  value={catData.ageValue}
                  onChange={(e) => handleCatDataChange('ageValue', e.target.value)}
                  className="flex-1"
                />
                <Select value={catData.ageUnit} onValueChange={(value) => handleCatDataChange('ageUnit', value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">شهور</SelectItem>
                    <SelectItem value="years">سنين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500">تُشتق المرحلة العمرية تلقائيًا ويمكن تعديلها.</p>
            </div>

            <div className="space-y-2">
              <Label>المرحلة العمرية</Label>
              <Select value={catData.lifeStage} onValueChange={(value) => handleCatDataChange('lifeStage', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">تلقائي من العمر</SelectItem>
                  <SelectItem value="kitten_young">قطة صغيرة جدًا (0-4 شهور)</SelectItem>
                  <SelectItem value="kitten_older">قطة صغيرة (4-12 شهر)</SelectItem>
                  <SelectItem value="adult">بالغة</SelectItem>
                  <SelectItem value="senior">كبيرة سنًا (7+ سنوات)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الوزن الحالي (كجم)</Label>
              <Input
                type="number"
                placeholder="مثال: 4.2"
                value={catData.weight}
                onChange={(e) => handleCatDataChange('weight', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>درجة حالة الجسم (BCS 1-9)</Label>
              <Select value={catData.bcs.toString()} onValueChange={(value) => handleCatDataChange('bcs', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - نحيل جداً (Underweight severe)</SelectItem>
                  <SelectItem value="2">2 - نحيل (Underweight)</SelectItem>
                  <SelectItem value="3">3 - نحيف قليلاً (Slightly underweight)</SelectItem>
                  <SelectItem value="4">4 - نحيف (Thin)</SelectItem>
                  <SelectItem value="5">5 - مثالي (Ideal)</SelectItem>
                  <SelectItem value="6">6 - بدين قليلاً (Slightly overweight)</SelectItem>
                  <SelectItem value="7">7 - بدين (Overweight)</SelectItem>
                  <SelectItem value="8">8 - سمين (Obese)</SelectItem>
                  <SelectItem value="9">9 - سمين جداً (Obese severe)</SelectItem>
                </SelectContent>
              </Select>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-gray-500">BCS: 1-3 تحت الوزن، 4-5 مثالي، 6-9 فوق الوزن (WSAVA 2011).</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Body Condition Score (BCS) نظام تقييم حالة الجسم</p>
                    <p className="text-xs text-gray-500">يؤثر BCS على السعرات بزيادة/نقصان 10% - WSAVA 2011</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <Label>الجنس</Label>
              <Select value={catData.sex} onValueChange={(value) => handleCatDataChange('sex', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">أنثى</SelectItem>
                  <SelectItem value="male">ذكر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>السلالة</Label>
              <Select value={catData.breed} onValueChange={(value) => handleCatDataChange('breed', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domestic_shorthair">منزلية شعر قصير</SelectItem>
                  <SelectItem value="domestic_longhair">منزلية شعر طويل</SelectItem>
                  <SelectItem value="persian">Persian (شيرازي)</SelectItem>
                  <SelectItem value="british_shorthair">British Shorthair</SelectItem>
                  <SelectItem value="maine_coon">Maine Coon</SelectItem>
                  <SelectItem value="ragdoll">Ragdoll</SelectItem>
                  <SelectItem value="siamese">Siamese</SelectItem>
                  <SelectItem value="bengal">Bengal</SelectItem>
                  <SelectItem value="sphynx">Sphynx</SelectItem>
                  <SelectItem value="scottish_fold">Scottish Fold</SelectItem>
                  <SelectItem value="norwegian_forest">Norwegian Forest</SelectItem>
                  <SelectItem value="american_shorthair">American Shorthair</SelectItem>
                  <SelectItem value="abyssinian">Abyssinian</SelectItem>
                  <SelectItem value="turkish_angora">Turkish Angora</SelectItem>
                  <SelectItem value="russian_blue">Russian Blue</SelectItem>
                  <SelectItem value="oriental">Oriental</SelectItem>
                  {/* New breeds added */}
                  <SelectItem value="burmese">Burmese (بورميز)</SelectItem>
                  <SelectItem value="tonkinese">Tonkinese (تونكينيز)</SelectItem>
                  <SelectItem value="himalayan">Himalayan (هيمالايا)</SelectItem>
                  <SelectItem value="devon_rex">Devon Rex (ديفون ريكس)</SelectItem>
                  <SelectItem value="cornish_rex">Cornish Rex (كورنيش ريكس)</SelectItem>
                  <SelectItem value="manx">Manx (مانكس)</SelectItem>
                  <SelectItem value="savannah">Savannah (سافانا)</SelectItem>
                  <SelectItem value="bombay">Bombay (بومباي)</SelectItem>
                  <SelectItem value="egyptian_mau">Egyptian Mau (مصري ماو)</SelectItem>
                  <SelectItem value="egyptian_baladi">بلدي مصري (Baladi)</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
              {catData.breed === 'other' && (
                <Input
                  placeholder="اكتب السلالة"
                  value={catData.breedOther}
                  onChange={(e) => handleCatDataChange('breedOther', e.target.value)}
                />
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-gray-500">نقدّر الوزن المثالي حسب السلالة والجنس (للبالغين/الكبار).</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">السلالة تؤثر على نطاق الوزن المثالي</p>
                    <p className="text-xs text-gray-500">يتم تقدير النطاق بناءً على Merck Veterinary Manual 2020</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label>حالة التعقيم</Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">التعقيم يقلل متطلبات الطاقة</p>
                    <p className="text-xs text-gray-500">القطط المعقمة: MER أقل بنسبة 10-20% (NRC 2006)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select value={catData.neuter} onValueChange={(value) => handleCatDataChange('neuter', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutered">معقّمة/مخصي</SelectItem>
                  <SelectItem value="intact">غير معقّمة/سليمة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>مستوى النشاط</Label>
              <Select value={catData.activity} onValueChange={(value) => handleCatDataChange('activity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ACTIVITY_LEVELS).map(([key, level]) => (
                    <SelectItem key={key} value={level.value}>
                      <div className="flex flex-col">
                        <span>{level.label}</span>
                        <span className="text-xs text-gray-500">{level.examples?.join('، ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="p-2 bg-blue-50 rounded text-xs">
                <p className="font-medium">{ACTIVITY_LEVELS[catData.activity]?.description}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="mt-1 text-blue-700">{ACTIVITY_LEVELS[catData.activity]?.scientificNote}</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">عوامل MER (متطلبات الطاقة الحافظة) تستند إلى:</p>
                      <p className="text-xs text-gray-500">NRC 2006 و WSAVA 2011 للإرشادات العلمية</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-2">
              <Label>عدد الوجبات في اليوم</Label>
              <Select value={catData.meals.toString()} onValueChange={(value) => handleCatDataChange('meals', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-gray-500">في أيام الويت توجد وجبة ويت واحدة والباقي دراي.</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">تعدد الوجبات يحسن الهضم ويمنع السمنة</p>
                    <p className="text-xs text-gray-500">2-4 وجبات يوميًا موصى بها (WSAVA 2011)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <Label>هدف الوزن</Label>
              <Select value={catData.weightGoal} onValueChange={(value) => handleCatDataChange('weightGoal', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintain">حفاظ على الوزن الحالي</SelectItem>
                  <SelectItem value="loss">تخسيس</SelectItem>
                  <SelectItem value="gain">تسمين</SelectItem>
                </SelectContent>
              </Select>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-gray-500">التخسيس/التسمين تُحسب على الوزن المثالي المُقدّر.</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">تعديلات هدف الوزن تستند إلى:</p>
                    <p className="text-xs text-gray-500">فقدان الوزن: 0.8×RER - زيادة الوزن: 1.4×RER (AAFP 2014)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        {/* Special Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>حالات خاصة (إن وجدت)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={catData.specialCond} onValueChange={(value) => handleCatDataChange('specialCond', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">لا توجد</SelectItem>
                  <SelectItem value="pregnant">حامل (Queen)</SelectItem>
                  <SelectItem value="lactating">مرضعة (Queen)</SelectItem>
                  <SelectItem value="ckd">مرض الكلى المزمن (CKD)</SelectItem>
                  <SelectItem value="hyperthyroid">فرط نشاط الغدة الدرقية</SelectItem>
                  <SelectItem value="diabetes">السكري</SelectItem>
                  <SelectItem value="recovery">الاستشفاء بعد جراحة/مرض</SelectItem>
                  <SelectItem value="cardiac">أمراض القلب</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {catData.specialCond === 'pregnant' && (
              <div className="space-y-2">
                <Label>أسبوع الحمل</Label>
                <Select value={catData.pregWeek.toString()} onValueChange={(value) => handleCatDataChange('pregWeek', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(week => (
                      <SelectItem key={week} value={week.toString()}>{week}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-gray-500">حتى ~1.6×RER قرب الولادة (WSAVA/NRC).</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">الحمل: زيادة تدريجية في السعرات</p>
                      <p className="text-xs text-gray-500">الأسبوع 1-4: 1.1×RER, الأسبوع 5-9: 1.6×RER (NRC 2006)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {catData.specialCond === 'lactating' && (
              <>
                <div className="space-y-2">
                  <Label>أسبوع الرضاعة</Label>
                  <Select value={catData.lacWeek.toString()} onValueChange={(value) => handleCatDataChange('lacWeek', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(week => (
                        <SelectItem key={week} value={week.toString()}>{week}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-gray-500">الذروة بالأسبوع 3–4 (~2.5–3.0×RER).</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">الرضاعة: أعلى متطلبات طاقة</p>
                        <p className="text-xs text-gray-500">تصل إلى 2-3×RER حسب عدد الصغار (WSAVA 2011)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-2">
                  <Label>عدد الصغار</Label>
                  <Select value={catData.lacKittens.toString()} onValueChange={(value) => handleCatDataChange('lacKittens', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {catData.specialCond === 'ckd' && (
              <div className="space-y-2">
                <Label>مرحلة IRIS (1-4)</Label>
                <Select value={(catData.specialDetails.ckdStage || 2).toString()} onValueChange={(value) => handleCatDataChange('specialDetails', { ...catData.specialDetails, ckdStage: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(stage => (
                      <SelectItem key={stage} value={stage.toString()}>المرحلة {stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-gray-500">انخفاض DER 20-30% (IRIS Guidelines).</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">مرض الكلى المزمن (CKD): تقليل البروتين والفوسفور</p>
                      <p className="text-xs text-gray-500">تعديل السعرات حسب المرحلة IRIS 1-4</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {catData.specialCond === 'hyperthyroid' && (
              <div className="space-y-2">
                <Label>حالة العلاج</Label>
                <Select value={(catData.specialDetails.hyperthyroidTreated ? 'true' : 'false')} onValueChange={(value) => handleCatDataChange('specialDetails', { ...catData.specialDetails, hyperthyroidTreated: value === 'true' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">غير معالج</SelectItem>
                    <SelectItem value="true">معالج</SelectItem>
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-gray-500">زيادة 30% إذا غير معالج (ISFM).</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">فرط نشاط الغدة الدرقية: زيادة الأيض</p>
                      <p className="text-xs text-gray-500">غير معالج: +30% DER, معالج: طبيعي (ISFM 2016)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {catData.specialCond === 'diabetes' && (
              <div className="space-y-2">
                <Label>السيطرة على السكر</Label>
                <Select value={(catData.specialDetails.diabetesControlled ? 'true' : 'false')} onValueChange={(value) => handleCatDataChange('specialDetails', { ...catData.specialDetails, diabetesControlled: value === 'true' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">مسيطر</SelectItem>
                    <SelectItem value="false">غير مسيطر</SelectItem>
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-gray-500">تعديل لفقدان الوزن إذا بدين (AAHA).</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">السكري: إدارة الوزن والجلوكوز</p>
                      <p className="text-xs text-gray-500">السيطرة على السكر تحدد تعديل السعرات (AAHA 2018)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {catData.specialCond === 'recovery' && (
              <div className="space-y-2">
                <Label>عدد الأسابيع من الشفاء</Label>
                <Select value={(catData.specialDetails.recoveryWeeks || 2).toString()} onValueChange={(value) => handleCatDataChange('specialDetails', { ...catData.specialDetails, recoveryWeeks: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(week => (
                      <SelectItem key={week} value={week.toString()}>{week}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-gray-500">زيادة 30% في الأسابيع الأولى (NRC).</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">الاستشفاء: زيادة البروتين والطاقة</p>
                      <p className="text-xs text-gray-500">+30% DER للأسابيع 1-2 بعد الجراحة (NRC 2006)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {catData.specialCond === 'cardiac' && (
              <div className="space-y-2">
                <Label>حالة القلب</Label>
                <Select value={(catData.specialDetails.cardiacStable ? 'true' : 'false')} onValueChange={(value) => handleCatDataChange('specialDetails', { ...catData.specialDetails, cardiacStable: value === 'true' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">مستقر</SelectItem>
                    <SelectItem value="false">فشل</SelectItem>
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-xs text-gray-500">لا توجد تقليل تلقائي للسعرات.</p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">أمراض القلب: تقليل الصوديوم + أوميغا-3 وتورين</p>
                      <p className="text-xs text-gray-500">الطاقة تُعدّل حسب BCS وهدف الوزن؛ تجنب الهزال (ACVIM)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {catData.specialCond !== 'none' && catData.specialCond !== 'pregnant' && catData.specialCond !== 'lactating' && (
              <Alert className="col-span-full border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-xs text-yellow-700">
                  راجع طبيب بيطري لتأكيد الحالة وتعديل الخطة. هذه إرشادية علمية فقط.
                </AlertDescription>
              </Alert>
            )}

            {catData.specialCond === 'lactating' && (
              <>
                <div className="space-y-2">
                  <Label>أسبوع الرضاعة</Label>
                  <Select value={catData.lacWeek.toString()} onValueChange={(value) => handleCatDataChange('lacWeek', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(week => (
                        <SelectItem key={week} value={week.toString()}>{week}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">الذروة بالأسبوع 3–4 (~2.5–3.0×RER).</p>
                </div>
   
                <div className="space-y-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label>عدد أيام الويت في الأسبوع</Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">الويت فود مهم للترطيب والصحة البولية</p>
                        <p className="text-xs text-gray-500">يوصى بـ 2-3 أيام ويت أسبوعيًا للوقاية من أمراض المسالك البولية (AAFP 2014)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Select value={weeklyPlan.wetDaysCount.toString()} onValueChange={(value) => handleWeeklyPlanChange('wetDaysCount', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>عدد الصغار</Label>
                  <Select value={catData.lacKittens.toString()} onValueChange={(value) => handleCatDataChange('lacKittens', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Food and Calories */}
        <Card>
          <CardHeader>
            <CardTitle>الطعام والسعرات</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label>سعرات الدراي (كيلو كالوري لكل 100 جم)</Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">السعرات الحرارية في الطعام الجاف لكل 100 جرام</p>
                    <p className="text-xs text-gray-500">عادةً بين 350-450 كيلو كالوري/100 جم للطعام الجاف عالي الجودة (NRC 2006)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Input
                type="number"
                placeholder="مثال: 380"
                value={foodData.dry100}
                onChange={(e) => handleFoodDataChange('dry100', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label>الويت فود</Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">الطعام الرطب مهم للترطيب والصحة البولية</p>
                    <p className="text-xs text-gray-500">يوصى بـ 2-3 أيام ويت أسبوعيًا للوقاية من أمراض المسالك البولية (AAFP 2014)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex gap-2 flex-wrap mb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Select value={foodData.wetMode} onValueChange={(value) => handleFoodDataChange('wetMode', value)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="per100">سعرات لكل 100 جم</SelectItem>
                          <SelectItem value="perUnit">سعرات لكل وحدة</SelectItem>
                        </SelectContent>
                      </Select>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">اختر طريقة إدخال سعرات الويت</p>
                      <p className="text-xs text-gray-500">لكل 100 جم: للمنتجات التي توضح السعرات/100جم</p>
                      <p className="text-xs text-gray-500">لكل وحدة: للمنتجات التي توضح السعرات/كيس أو علبة</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Select value={foodData.wetPackType} onValueChange={(value) => handleFoodDataChange('wetPackType', value)}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pouch">كيس</SelectItem>
                          <SelectItem value="can">علبة</SelectItem>
                        </SelectContent>
                      </Select>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">نوع عبوة الويت فود</p>
                      <p className="text-xs text-gray-500">الكيس: عادةً 85-100 جم، العلبة: عادةً 150-400 جم</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        type="number"
                        placeholder="وزن الوحدة (جم)"
                        value={foodData.wetUnitGrams}
                        onChange={(e) => handleFoodDataChange('wetUnitGrams', e.target.value)}
                        className="w-32"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">وزن كل وحدة ويت فود بالجرام</p>
                      <p className="text-xs text-gray-500">مهم للحساب الدقيق عند استخدام وضع "سعرات لكل وحدة"</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        type="number"
                        placeholder="kcal/100g"
                        value={foodData.wet100}
                        onChange={(e) => handleFoodDataChange('wet100', e.target.value)}
                        className={`flex-1 ${foodData.wetMode === 'per100' ? '' : 'hidden'}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">السعرات الحرارية لكل 100 جرام من الويت فود</p>
                      <p className="text-xs text-gray-500">عادةً بين 70-120 كيلو كالوري/100جم للطعام الرطب (NRC 2006)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        type="number"
                        placeholder="kcal/وحدة"
                        value={foodData.wetKcalPerUnit}
                        onChange={(e) => handleFoodDataChange('wetKcalPerUnit', e.target.value)}
                        className={`flex-1 ${foodData.wetMode === 'perUnit' ? '' : 'hidden'}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">السعرات الحرارية لكل وحدة ويت فود</p>
                      <p className="text-xs text-gray-500">مفيد عندما يكون الوزن الدقيق للوحدة غير معروف</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-gray-500">اختر نظام السعرات للويت: إما لكل 100 جم أو لكل وحدة (كيس/علبة).</p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Plan */}
        <Card>
          <CardHeader>
            <CardTitle>خطة الأسبوع (وجبة ويت واحدة في أيام الويت)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label>عدد أيام الويت في الأسبوع</Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">الويت فود مهم للترطيب والصحة البولية</p>
                    <p className="text-xs text-gray-500">يوصى بـ 2-3 أيام ويت أسبوعيًا (AAFP 2014)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select value={weeklyPlan.wetDaysCount.toString()} onValueChange={(value) => handleWeeklyPlanChange('wetDaysCount', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label>أي وجبة ستكون ويت؟</Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">توزيع الوجبات يحسن الهضم ويمنع السمنة</p>
                    <p className="text-xs text-gray-500">2-4 وجبات يوميًا موصى بها (WSAVA 2011)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select value={weeklyPlan.wetMealIndex.toString()} onValueChange={(value) => handleWeeklyPlanChange('wetMealIndex', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: catData.meals || 2 }, (_, i) => i + 1).map(meal => (
                    <SelectItem key={meal} value={meal.toString()}>الوجبة {meal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">يوضع كامل الويت في الوجبة المختارة، والباقي دراي.</p>
            </div>

            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label>أيام الأسبوع التي بها ويت</Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">التوزيع المتوازن يضمن تغذية متوازنة</p>
                    <p className="text-xs text-gray-500">تجنب التركيز في أيام متتالية (AAFP 2014)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex flex-wrap gap-2 mt-2">
                {dayNames.map((day, index) => (
                  <div key={index} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`day-${index}`}
                      checked={weeklyPlan.wetDays[index]}
                      onCheckedChange={() => handleWetDayToggle(index)}
                    />
                    <Label htmlFor={`day-${index}`} className="cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => autoDistributeWetDays(weeklyPlan.wetDaysCount)}
                className="mt-2"
              >
                توزيع تلقائي متوازن
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Box Builder */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>صانع البوكسات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>نوع البوكس</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">مدة التخطيط تؤثر على الكميات الإجمالية</p>
                      <p className="text-xs text-gray-500">الشهري (30 يوم) يوفر تخطيطًا طويل الأمد</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={boxBuilder.boxType} onValueChange={(value) => handleBoxBuilderChange('boxType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">أسبوعي (7 أيام)</SelectItem>
                    <SelectItem value="monthly30">شهري (30 يوم)</SelectItem>
                    <SelectItem value="custom">مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {boxBuilder.boxType === 'custom' && (
                <div className="space-y-2">
                  <Label>عدد الأيام</Label>
                  <Input
                    type="number"
                    value={boxBuilder.customDays}
                    onChange={(e) => handleBoxBuilderChange('customDays', parseInt(e.target.value))}
                  />
                </div>
              )}
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>هامش أمان للتعبئة</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">هامش أمان لتغطية التباينات في الاستهلاك</p>
                      <p className="text-xs text-gray-500">+10% يضمن عدم النقص (WSAVA 2011)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={boxBuilder.safety.toString()} onValueChange={(value) => handleBoxBuilderChange('safety', parseFloat(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">بدون</SelectItem>
                    <SelectItem value="0.05">+5%</SelectItem>
                    <SelectItem value="0.10">+10%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CardHeader className="mt-6">
              <CardTitle>إدارة الويت في البوكس</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>وضع الويت للبوكس</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">تلقائي: يحسب حسب أيام الويت، ثابت: كمية محددة</p>
                      <p className="text-xs text-gray-500">التلقائي يضمن التوازن الغذائي (AAFP 2014)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select value={boxBuilder.boxWetMode} onValueChange={(value) => handleBoxBuilderChange('boxWetMode', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto_total">تلقائي إجمالي للبوكس</SelectItem>
                    <SelectItem value="fixed_total">كمية ثابتة (بالوحدات) للبوكس</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تقسيم كل وحدة على عدد أيام</Label>
                <Input
                  type="number"
                  value={boxBuilder.boxSplitDays}
                  onChange={(e) => handleBoxBuilderChange('boxSplitDays', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">مثال: العلبة تُستهلك على 3 أيام ويت (بنفس الكمية كل يوم).</p>
              </div>
              {boxBuilder.boxWetMode === 'fixed_total' && (
                <div className="space-y-2">
                  <Label>عدد وحدات الويت في البوكس</Label>
                  <Input
                    type="number"
                    placeholder="مثال: 10"
                    value={boxBuilder.boxTotalUnits}
                    onChange={(e) => handleBoxBuilderChange('boxTotalUnits', parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>التسعير (للحساب الداخلي فقط)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>العملة</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">العملة للحسابات المالية</p>
                      <p className="text-xs text-gray-500">للاستخدام الداخلي في التسعير</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  placeholder="مثال: ج.م"
                  value={pricing.currency}
                  onChange={(e) => handlePricingChange('currency', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>سعر الدراي (لكل 1 كجم)</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">سعر الكيلوجرام من الطعام الجاف</p>
                      <p className="text-xs text-gray-500">للحساب الإجمالي للتكلفة</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  type="number"
                  placeholder="مثال: 180"
                  value={pricing.priceDryPerKg}
                  onChange={(e) => handlePricingChange('priceDryPerKg', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label>سعر وحدة الويت (كيس/علبة)</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">سعر كل وحدة ويت فود (كيس أو علبة)</p>
                      <p className="text-xs text-gray-500">للحساب الدقيق للتكلفة الإجمالية</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  type="number"
                  placeholder="مثال: 25"
                  value={pricing.priceWetUnit}
                  onChange={(e) => handlePricingChange('priceWetUnit', e.target.value)}
                />
              </div>
            </div>
            
            {/* Cost Summary */}
            {results && (pricing.priceDryPerKg || pricing.priceWetUnit) && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">تكلفة الدراي: </span>
                      <span>{costs.dryCost > 0 ? costs.dryCost.toFixed(2) + ' ' + pricing.currency : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium">تكلفة الويت: </span>
                      <span>{costs.wetCost > 0 ? costs.wetCost.toFixed(2) + ' ' + pricing.currency + (results.boxSummary.unitsForCost ? ` (وحدات = ${results.boxSummary.unitsForCost})` : '') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium">إجمالي تقديري: </span>
                      <span>{costs.totalCost > 0 ? costs.totalCost.toFixed(2) + ' ' + pricing.currency : '—'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Control Buttons */}
        <Card className="print:hidden">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button onClick={calculateNutrition} disabled={isCalculating}>
                {isCalculating ? 'جاري الحساب...' : 'حساب الجدول'}
              </Button>
              <Button variant="outline" onClick={saveData} disabled={isSaving}>
                {isSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}
              </Button>
              <Button variant="outline" onClick={loadClient}>
                تحميل بيانات العميل
              </Button>
              <Button variant="outline" onClick={resetData}>
                إعادة الضبط
              </Button>
              <Button variant="outline" onClick={printReport}>
                طباعة التقرير
              </Button>
              <Button variant="outline" onClick={printBoxLabel}>
                طباعة ملصق البوكس
              </Button>
            </div>
            {errors.length > 0 && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card id="resultsCard">
            <CardHeader className="print:hidden">
              <CardTitle>نتائج الحساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Details */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">الاسم: {catData.name || '—'}</Badge>
                <Badge variant="secondary">اسم العميل: {catData.clientName || '—'}</Badge>
                <Badge variant="secondary">العمر: {catData.ageValue} {catData.ageUnit === 'years' ? 'سنة' : 'شهر'}</Badge>
                <Badge variant="secondary">الوزن: {catData.weight} كجم</Badge>
                <Badge variant="secondary">الجنس: {catData.sex === 'female' ? 'أنثى' : 'ذكر'}</Badge>
                <Badge variant="outline">النشاط: {results.activityInfo.label}</Badge>
                <Badge variant="secondary">السلالة: {catData.breed === 'other' ? (catData.breedOther || '—') : breedLabel(catData.breed)}</Badge>
                <Badge variant="secondary">التعقيم: {catData.neuter === 'neutered' ? 'معقّم/مخصي' : 'غير معقّم/سليم'}</Badge>
                {results.weightStatus !== 'na' && (
                  <Badge variant={results.weightStatus === 'ok' ? "default" : results.weightStatus === 'low' ? "secondary" : "destructive"}>
                    {results.weightStatus === 'ok'
                      ? 'وزنه مثالي'
                      : `الوزن: ${results.weightStatus === 'low' ? 'أقل من المثالي' : 'أعلى من المثالي'} (الوزن المثالي: ${results.idealWeight} كجم)`}
                  </Badge>
                )}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* RER - on screen only */}
                <Card className="bg-gray-50 print:hidden">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">RER (Resting)</p>
                    <p className="text-xl font-bold">{formatNumber(results.rer, 1)}</p>
                  </CardContent>
                </Card>
                {/* MER factor - on screen only */}
                <Card className="bg-gray-50 print:hidden">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">MER (العامل)</p>
                    <p className="text-xl font-bold">{results.factor.toFixed(1)}×RER</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">السعرات اليومية المطلوبة (DER)</p>
                    <p className="text-xl font-bold">{formatNumber(results.der, 1)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">الوزن المُستخدم للحساب</p>
                    <p className="text-xl font-bold">{results.usedWeight} كجم</p>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Details */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">تفاصيل مستوى النشاط</h3>
                  <p className="text-sm mb-2"><strong>{results.activityInfo.label}</strong></p>
                  <p className="text-sm mb-2">{results.activityInfo.description}</p>
                  {/* Removed RER mention and examples line as requested */}
                </CardContent>
              </Card>

              {/* Weight Gauge - Simplified as text for now */}
              {results.weightStatus !== 'na' && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-2">حالة الوزن: {results.weightStatus === 'ok' ? 'ضمن النطاق المثالي' : results.weightStatus === 'low' ? 'أقل من المثالي' : 'أعلى من المثالي'}</p>
                    <p className="text-sm">نطاق مثالي: {results.weightRange[0]}-{results.weightRange[1]} كجم</p>
                  </CardContent>
                </Card>
              )}

              {results.weightStatus === 'na' && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertDescription>مؤشر الوزن: غير مُطبق للقطط الصغيرة (أقل من 12 شهر).</AlertDescription>
                </Alert>
              )}

              <div className="border-t pt-6" />

              {/* Weekly Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">الجدول الأسبوعي</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اليوم</TableHead>
                        <TableHead>نوع اليوم</TableHead>
                        <TableHead>DER (كcal)</TableHead>
                        <TableHead>سعرات ويت</TableHead>
                        <TableHead>سعرات دراي</TableHead>
                        <TableHead>فطار (كcal)</TableHead>
                        <TableHead>عشاء (كcal)</TableHead>
                        <TableHead>الفطار (مكونات)</TableHead>
                        <TableHead>العشاء (مكونات)</TableHead>
                        <TableHead>جرامات ويت</TableHead>
                        <TableHead>جرامات دراي</TableHead>
                        <TableHead>وحدات ويت</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.weeklyData.map((day, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-center">{day.day}</TableCell>
                          <TableCell className="text-center">{day.type}</TableCell>
                          <TableCell className="text-center">{formatNumber(day.der, 1)}</TableCell>
                          <TableCell className="text-center">{formatNumber(day.wetKcal, 1)}</TableCell>
                          <TableCell className="text-center">{formatNumber(day.dryKcal, 1)}</TableCell>
                          <TableCell className="text-center">{formatNumber(day.breakfastKcal, 1)}</TableCell>
                          <TableCell className="text-center">{formatNumber(day.dinnerKcal, 1)}</TableCell>
                          <TableCell className="text-center">
                            {(() => {
                              const round5 = (n: number) => Math.round(n / 5) * 5
                              const packLabel = foodData.wetPackType === 'can' ? 'علبة ويت' : 'كيس ويت'
                              if (day.breakfastWetGrams > 0) {
                                const dry = round5(day.breakfastDryGrams)
                                let base = `ويت ${formatNumber(day.breakfastWetGrams, 0)} جم`
                                if (foodData.wetMode === 'perUnit') {
                                  const fullUnit = Math.abs(day.breakfastWetGrams - day.servingSize) <= 1
                                  base = fullUnit ? packLabel : `ويت ${formatNumber(day.breakfastWetGrams, 0)} جم`
                                }
                                return dry > 0 ? `${base} + ${dry} جم دراي` : base
                              } else {
                                const dry = round5(day.breakfastDryGrams)
                                return dry > 0 ? `دراي ${dry} جم` : '-'
                              }
                            })()}
                          </TableCell>
                          <TableCell className="text-center">
                            {(() => {
                              const round5 = (n: number) => Math.round(n / 5) * 5
                              const packLabel = foodData.wetPackType === 'can' ? 'علبة ويت' : 'كيس ويت'
                              if (day.dinnerWetGrams > 0) {
                                const dry = round5(day.dinnerDryGrams)
                                let base = `ويت ${formatNumber(day.dinnerWetGrams, 0)} جم`
                                if (foodData.wetMode === 'perUnit') {
                                  const fullUnit = Math.abs(day.dinnerWetGrams - day.servingSize) <= 1
                                  base = fullUnit ? packLabel : `ويت ${formatNumber(day.dinnerWetGrams, 0)} جم`
                                }
                                return dry > 0 ? `${base} + ${dry} جم دراي` : base
                              } else {
                                const dry = round5(day.dinnerDryGrams)
                                return dry > 0 ? `دراي ${dry} جم` : '-'
                              }
                            })()}
                          </TableCell>
                          <TableCell className="text-center">{formatNumber(day.wetGrams, 1)}</TableCell>
                          <TableCell className="text-center">{formatNumber(day.dryGrams, 1)}</TableCell>
                          <TableCell className="text-center">{day.units.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="border-t pt-6 mt-6 print:hidden" />

              {/* Box Summary */}
              <div className="print:hidden">
                <h3 className="text-lg font-semibold mb-4">ملخص البوكس</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-gray-50">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">مدة البوكس</p>
                      <p className="text-xl font-bold">{results.boxSummary.totalDays} يوم</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">أيام الويت</p>
                      <p className="text-xl font-bold">{results.boxSummary.wetDaysCount} يوم</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">إجمالي السعرات</p>
                      <p className="text-xl font-bold">{results.boxSummary.totalDER} كcal</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">وحدات الويت المستهلكة</p>
                      <p className="text-xl font-bold">{results.boxSummary.unitsUsed}</p>
                    </CardContent>
                  </Card>
                </div>

                <h4 className="text-md font-semibold mb-4">قائمة التعبئة</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <p className="font-semibold">الدراي الإجمالي: <span className="text-lg">{formatNumber(results.boxSummary.totalDryGrams, 1)} جم</span></p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <p className="font-semibold">الويت الإجمالي: <span className="text-lg">{formatNumber(results.boxSummary.totalWetGrams, 1)} جم</span></p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <p className="font-semibold">عدد وحدات الويت: <span className="text-lg">{results.boxSummary.unitsUsed}</span></p>
                    </CardContent>
                  </Card>
                </div>
                <p className="text-sm text-gray-600">نصيحة: قسّم الدراي إلى باكات يومية ≈ {formatNumber(Math.round(results.boxSummary.totalDryGrams / results.boxSummary.totalDays / 5) * 5)} جم/يوم.</p>
                <p className="text-sm text-gray-600 mt-1">حجم كل وجبة ويت: {formatNumber(results.boxSummary.servingSize)} جم (تقسيم كل وحدة على {boxBuilder.boxSplitDays} أيام).</p>
              </div>

              <div className="border-t pt-6 mt-6" />

              <Alert className="border-yellow-200 bg-yellow-50 print:hidden">
                <AlertDescription>هذه أداة إرشادية—تابع حالة الجسم BCS مع طبيب بيطري وعدّل الكميات حسب الاستجابة.</AlertDescription>
              </Alert>

              <div className="border-t pt-6 mt-6 print:hidden" />

              <div className="text-sm text-gray-600 print:hidden">
                <h4 className="font-semibold mb-2">المراجع العلمية:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>NRC (National Research Council). 2006. Nutrient Requirements of Dogs and Cats.</li>
                  <li>WSAVA Global Nutrition Guidelines. 2011.</li>
                  <li>AAFP Feline Weight Management Guidelines. 2014.</li>
                  <li>Journal of the American Veterinary Medical Association (JAVMA). 2019.</li>
                  <li>European Society of Feline Medicine (ESFM) Guidelines.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="text-sm text-gray-600 p-6 print:hidden">
          <div className="max-w-6xl mx-auto">
            مبني على RER = 70 × (الوزن^0.75) وعوامل DER/MER حسب WSAVA/NRC/AAFP. السلالة تؤثر عبر تقدير الوزن المثالي، لا يوجد معامل MER ثابت لكل سلالة.
          </div>
        </footer>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body {
              background: white;
              margin: 0;
              padding: 0;
              font-size: 10px;
              line-height: 1.2;
            }
            
            header,
            .max-w-6xl > div:not(#resultsCard),
            footer {
              display: none !important;
            }
            
            #resultsCard {
              display: block !important;
              box-shadow: none !important;
              border: none !important;
              padding: 5px !important;
              margin: 0 !important;
              max-width: 100% !important;
            }
            
            .max-w-6xl {
              max-width: none !important;
              margin: 0 !important;
              padding: 5mm !important;
            }
            
            @page {
              size: A4;
              margin: 5mm;
            }
            
            * {
              page-break-inside: avoid;
            }
            
            table {
              font-size: 9px;
              border-collapse: collapse;
            }
            
            th, td {
              padding: 2px !important;
              border: 1px solid #ccc !important;
              font-size: 9px;
            }
            
            .grid {
              gap: 4px !important;
            }
            
            .bg-gray-50 {
              padding: 4px !important;
            }
            
            .mb-4, .mb-6 {
              margin-bottom: 4px !important;
            }
            
            .space-y-6 > * + * {
              margin-top: 8px !important;
            }
            
            .border-t {
              border-top: 1px solid #e5e7eb !important;
              padding-top: 4px !important;
              margin-top: 4px !important;
            }
            
            .text-lg {
              font-size: 12px !important;
            }
            .text-xl {
              font-size: 14px !important;
            }
            .text-2xl {
              font-size: 16px !important;
            }
            
            .px-3 {
              padding-left: 2px !important;
              padding-right: 2px !important;
            }
            
            .py-1 {
              padding-top: 1px !important;
              padding-bottom: 1px !important;
            }
            
            .text-sm {
              font-size: 8px !important;
            }
            
            .print-hidden {
              display: none !important;
            }
          }
          
          .print-header {
            display: none;
          }
        `}</style>
      </div>
    </div>
  )
}