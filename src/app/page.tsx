'use client'

import { useState, useEffect } from 'react'

import { useCatNutrition } from '@/hooks/useCatNutrition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

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
  const [clients, setClients] = useState<Array<{id: string, name: string, phone: string, address: string, createdAt: string, updatedAt: string}>>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isLoadingClientData, setIsLoadingClientData] = useState(false)
  const [showNewClientDialog, setShowNewClientDialog] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientAddress, setNewClientAddress] = useState('')
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  
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

  const loadClients = async (searchTerm = '') => {
    try {
      setIsLoadingClients(true)
      const url = searchTerm ? `/api/clients/list?search=${encodeURIComponent(searchTerm)}` : '/api/clients/list'
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'فشل تحميل قائمة العملاء')
      setClients(json)
    } catch (e) {
      console.error('Load clients failed:', e)
      alert('فشل تحميل قائمة العملاء')
    } finally {
      setIsLoadingClients(false)
    }
  }

  const selectClient = async (client: {name: string, phone: string, address: string}) => {
    setIsLoadingClientData(true)
    handleCatDataChange('clientName', client.name)
    handleCatDataChange('clientPhone', client.phone)
    handleCatDataChange('clientAddress', client.address)
    setClientSearchTerm(client.name)
    setShowClientDropdown(false)
    
    // Automatically load client data
    try {
      const res = await fetch(`/api/clients?name=${encodeURIComponent(client.name)}`)
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
      
      // Show success message
      alert('تم تحميل بيانات العميل تلقائياً')
    } catch (e) {
      console.error('Auto-load client failed:', e)
      // Don't show error for auto-load, just silently fail
    } finally {
      setIsLoadingClientData(false)
    }
  }

  const createNewClient = async () => {
    if (!newClientName.trim()) {
      alert('الرجاء إدخال اسم العميل')
      return
    }
    
    handleCatDataChange('clientName', newClientName.trim())
    handleCatDataChange('clientPhone', newClientPhone.trim())
    handleCatDataChange('clientAddress', newClientAddress.trim())
    setClientSearchTerm(newClientName.trim())
    setShowNewClientDialog(false)
    setNewClientName('')
    setNewClientPhone('')
    setNewClientAddress('')
    await loadClients() // Refresh client list
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

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Client Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات العميل</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>اختيار العميل</Label>
              <div className="relative">
                <Input
                  placeholder={isLoadingClientData ? "جاري تحميل البيانات..." : "ابحث عن العميل بالاسم أو رقم الهاتف"}
                  value={clientSearchTerm}
                  onChange={(e) => {
                    setClientSearchTerm(e.target.value)
                    setShowClientDropdown(true)
                    loadClients(e.target.value)
                  }}
                  onFocus={() => {
                    setShowClientDropdown(true)
                    loadClients(clientSearchTerm)
                  }}
                  disabled={isLoadingClientData}
                />
                {showClientDropdown && clients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div 
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b"
                      onClick={() => setShowNewClientDialog(true)}
                    >
                      + إضافة عميل جديد
                    </div>
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => selectClient(client)}
                      >
                        <div className="font-medium">{client.name}</div>
                        {client.phone && (
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        )}
                        {client.address && (
                          <div className="text-sm text-gray-400">{client.address}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">رقم هاتف العميل</Label>
              <Input
                id="clientPhone"
                placeholder="مثال: 01234567890"
                value={catData.clientPhone}
                onChange={(e) => handleCatDataChange('clientPhone', e.target.value)}
                disabled={isLoadingClientData}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientAddress">عنوان العميل</Label>
              <Input
                id="clientAddress"
                placeholder="مثال: شارع الجامعة، المهندسين"
                value={catData.clientAddress}
                onChange={(e) => handleCatDataChange('clientAddress', e.target.value)}
                disabled={isLoadingClientData}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cat Data */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات القطة</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <Label>حالة التعقيم</Label>
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
            </div>
          </CardContent>
        </Card>

        {/* Food Data Section */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات الطعام</CardTitle>
            <CardDescription>أدخل السعرات الحرارية لكل 100 جرام</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dry100">سعرات الدراي (لكل 100 جرام)</Label>
              <Input
                id="dry100"
                type="number"
                placeholder="مثال: 380"
                value={foodData.dry100}
                onChange={(e) => handleFoodDataChange('dry100', e.target.value)}
              />
              <p className="text-xs text-gray-500">نموذجي: 350-450 كيلو كالوري</p>
            </div>

            <div className="space-y-2">
              <Label>نوع بيانات الويت</Label>
              <Select value={foodData.wetMode} onValueChange={(value) => handleFoodDataChange('wetMode', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per100">سعرات لكل 100 جرام</SelectItem>
                  <SelectItem value="perUnit">سعرات لكل وحدة (علبة/باوتش)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {foodData.wetMode === 'per100' ? (
              <div className="space-y-2">
                <Label htmlFor="wet100">سعرات الويت (لكل 100 جرام)</Label>
                <Input
                  id="wet100"
                  type="number"
                  placeholder="مثال: 80"
                  value={foodData.wet100}
                  onChange={(e) => handleFoodDataChange('wet100', e.target.value)}
                />
                <p className="text-xs text-gray-500">نموذجي: 70-100 كيلو كالوري</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="wetKcalPerUnit">سعرات الوحدة الواحدة</Label>
                  <Input
                    id="wetKcalPerUnit"
                    type="number"
                    placeholder="مثال: 85"
                    value={foodData.wetKcalPerUnit}
                    onChange={(e) => handleFoodDataChange('wetKcalPerUnit', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wetUnitGrams">وزن الوحدة (جرام)</Label>
                  <Input
                    id="wetUnitGrams"
                    type="number"
                    placeholder="مثال: 85"
                    value={foodData.wetUnitGrams}
                    onChange={(e) => handleFoodDataChange('wetUnitGrams', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="wetUnitGrams">وزن الوحدة (جرام) - للعرض</Label>
              <Input
                id="wetUnitGrams"
                type="number"
                placeholder="مثال: 85"
                value={foodData.wetUnitGrams}
                onChange={(e) => handleFoodDataChange('wetUnitGrams', e.target.value)}
              />
              <p className="text-xs text-gray-500">يستخدم في عرض أحجام التقديم</p>
            </div>

            <div className="space-y-2">
              <Label>نوع العبوة</Label>
              <Select value={foodData.wetPackType} onValueChange={(value) => handleFoodDataChange('wetPackType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pouch">باوتش</SelectItem>
                  <SelectItem value="can">علبة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Plan Section */}
        <Card>
          <CardHeader>
            <CardTitle>التخطيط الأسبوعي</CardTitle>
            <CardDescription>حدد الأيام التي ستُعطى فيها طعام ويت</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>عدد أيام الويت في الأسبوع</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="7"
                    value={weeklyPlan.wetDaysCount}
                    onChange={(e) => handleWeeklyPlanChange('wetDaysCount', parseInt(e.target.value))}
                    className="w-20"
                  />
                  <Button
                    variant="outline"
                    onClick={() => autoDistributeWetDays(weeklyPlan.wetDaysCount)}
                    size="sm"
                  >
                    توزيع تلقائي
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>الوجبة التي تحتوي على ويت</Label>
                <Select 
                  value={weeklyPlan.wetMealIndex.toString()} 
                  onValueChange={(value) => handleWeeklyPlanChange('wetMealIndex', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: catData.meals }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        الوجبة {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>أيام الأسبوع</Label>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, index) => (
                  <div key={index} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`day-${index}`}
                      checked={weeklyPlan.wetDays[index]}
                      onCheckedChange={() => handleWetDayToggle(index)}
                    />
                    <Label htmlFor={`day-${index}`} className="text-sm">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Conditions Section */}
        <Card>
          <CardHeader>
            <CardTitle>الحالات الخاصة</CardTitle>
            <CardDescription>حدد إذا كانت القطة لديها حالة صحية خاصة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>الحالة الصحية</Label>
              <Select value={catData.specialCond} onValueChange={(value) => handleCatDataChange('specialCond', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">طبيعية</SelectItem>
                  <SelectItem value="pregnant">حامل</SelectItem>
                  <SelectItem value="lactating">مُرضعة</SelectItem>
                  <SelectItem value="ckd">قصور كلوي مزمن (CKD)</SelectItem>
                  <SelectItem value="hyperthyroid">فرط نشاط الغدة الدرقية</SelectItem>
                  <SelectItem value="diabetes">السكري</SelectItem>
                  <SelectItem value="recovery">فترة نقاهة</SelectItem>
                  <SelectItem value="cardiac">مشاكل قلبية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {catData.specialCond === 'pregnant' && (
              <div className="space-y-2">
                <Label>أسبوع الحمل (1-9)</Label>
                <Input
                  type="number"
                  min="1"
                  max="9"
                  value={catData.pregWeek}
                  onChange={(e) => handleCatDataChange('pregWeek', parseInt(e.target.value))}
                />
              </div>
            )}

            {catData.specialCond === 'lactating' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>أسبوع الرضاعة (1-8)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={catData.lacWeek}
                    onChange={(e) => handleCatDataChange('lacWeek', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>عدد الصغار (1-8)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={catData.lacKittens}
                    onChange={(e) => handleCatDataChange('lacKittens', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calculate Button */}
        <div className="flex justify-center">
          <Button 
            onClick={calculateNutrition}
            disabled={isCalculating}
            size="lg"
            className="min-w-[200px]"
          >
            {isCalculating ? 'جاري الحساب...' : 'احسب الجدول'}
          </Button>
        </div>

        {/* Errors Display */}
        {errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-700">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-6">
            {/* Basic Calculations */}
            <Card>
              <CardHeader>
                <CardTitle>الحسابات الأساسية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(results.rer, 1)}</div>
                    <div className="text-sm font-medium">RER - الطاقة الأساسية</div>
                    <div className="text-xs text-gray-500">كيلو كالوري يومياً</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(results.factor, 2)}x</div>
                    <div className="text-sm font-medium">معامل النشاط</div>
                    <div className="text-xs text-gray-500">{results.activityInfo.label}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(results.der, 1)}</div>
                    <div className="text-sm font-medium">DER - الطاقة اليومية</div>
                    <div className="text-xs text-gray-500">كيلو كالوري يومياً</div>
                  </div>
                </div>

                {results.recommendations.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-medium text-yellow-800 mb-2">توصيات:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {results.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weight Status */}
            <Card>
              <CardHeader>
                <CardTitle>حالة الوزن</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold">{formatNumber(results.usedWeight, 1)} كجم</div>
                    <div className="text-sm text-gray-500">الوزن الحالي</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{formatNumber(results.idealWeight, 1)} كجم</div>
                    <div className="text-sm text-gray-500">الوزن المثالي</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{formatNumber(results.weightRange[0], 1)} - {formatNumber(results.weightRange[1], 1)} كجم</div>
                    <div className="text-sm text-gray-500">النطاق الطبيعي</div>
                  </div>
                  <div className="text-center">
                    <Badge 
                      variant={results.weightStatus === 'ok' ? 'default' : results.weightStatus === 'low' ? 'secondary' : results.weightStatus === 'high' ? 'destructive' : 'outline'}
                    >
                      {results.weightStatus === 'ok' && 'طبيعي'}
                      {results.weightStatus === 'low' && 'منخفض'}
                      {results.weightStatus === 'high' && 'مرتفع'}
                      {results.weightStatus === 'na' && 'غير محدد'}
                    </Badge>
                    <div className="text-sm text-gray-500">حالة الوزن</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>الجدول الأسبوعي</CardTitle>
                <CardDescription>تفاصيل الوجبات لكل يوم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">اليوم</TableHead>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">DER</TableHead>
                        <TableHead className="text-right">ويت (كيلو كالوري)</TableHead>
                        <TableHead className="text-right">دراي (كيلو كالوري)</TableHead>
                        <TableHead className="text-right">ويت (جرام)</TableHead>
                        <TableHead className="text-right">دراي (جرام)</TableHead>
                        <TableHead className="text-right">عدد الوحدات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.weeklyData.map((day, index) => (
                        <TableRow key={index} className={day.type === 'wet' ? 'bg-blue-50' : ''}>
                          <TableCell className="font-medium">{day.day}</TableCell>
                          <TableCell>
                            <Badge variant={day.type === 'wet' ? 'default' : 'secondary'}>
                              {day.type === 'wet' ? 'ويت' : 'دراي'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatNumber(day.der, 0)}</TableCell>
                          <TableCell>{formatNumber(day.wetKcal, 0)}</TableCell>
                          <TableCell>{formatNumber(day.dryKcal, 0)}</TableCell>
                          <TableCell>{formatNumber(day.wetGrams, 0)}</TableCell>
                          <TableCell>{formatNumber(day.dryGrams, 0)}</TableCell>
                          <TableCell>{formatNumber(day.units, 1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Meal Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الوجبات</CardTitle>
                <CardDescription>كميات كل وجبة في اليوم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {results.weeklyData.map((day, dayIndex) => (
                    <div key={dayIndex} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        {day.day}
                        <Badge variant={day.type === 'wet' ? 'default' : 'secondary'}>
                          {day.type === 'wet' ? 'ويت' : 'دراي'}
                        </Badge>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {day.mealsBreakdown.map((meal, mealIndex) => (
                          <div key={mealIndex} className="bg-gray-50 rounded p-3">
                            <div className="font-medium text-sm mb-2">الوجبة {meal.mealIndex}</div>
                            <div className="space-y-1 text-xs">
                              <div>الطاقة: {formatNumber(meal.kcal, 0)} كيلو كالوري</div>
                              {meal.wetGrams > 0 && <div>ويت: {formatNumber(meal.wetGrams, 0)} جرام</div>}
                              {meal.dryGrams > 0 && <div>دراي: {formatNumber(meal.dryGrams, 0)} جرام</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Box Builder */}
            <Card>
              <CardHeader>
                <CardTitle>صانع البوكسات</CardTitle>
                <CardDescription>احسب ما تحتاجه لفترة معينة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>نوع البوكس</Label>
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
                        min="1"
                        max="365"
                        value={boxBuilder.customDays}
                        onChange={(e) => handleBoxBuilderChange('customDays', parseInt(e.target.value))}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>هامش أمان (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={boxBuilder.safety}
                      onChange={(e) => handleBoxBuilderChange('safety', parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-gray-500">نسبة زيادة لتجنب نفود الطعام</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>طريقة حساب الويت</Label>
                    <Select value={boxBuilder.boxWetMode} onValueChange={(value) => handleBoxBuilderChange('boxWetMode', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto_total">تلقائي من الجدول</SelectItem>
                        <SelectItem value="fixed_total">عدد ثابت</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {boxBuilder.boxWetMode === 'fixed_total' && (
                    <div className="space-y-2">
                      <Label>عدد وحدات الويت الإجمالي</Label>
                      <Input
                        type="number"
                        min="0"
                        value={boxBuilder.boxTotalUnits}
                        onChange={(e) => handleBoxBuilderChange('boxTotalUnits', parseInt(e.target.value))}
                      />
                    </div>
                  )}
                </div>

                {/* Box Summary */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-3">ملخص البوكس</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">فترة البوكس</div>
                      <div className="text-blue-600">{results.boxSummary.totalDays} يوم</div>
                    </div>
                    <div>
                      <div className="font-medium">إجمالي الطاقة</div>
                      <div className="text-blue-600">{formatNumber(results.boxSummary.totalDER, 0)} كيلو كالوري</div>
                    </div>
                    <div>
                      <div className="font-medium">إجمالي الدراي</div>
                      <div className="text-blue-600">{formatNumber(results.boxSummary.totalDryGrams / 1000, 2)} كجم</div>
                    </div>
                    <div>
                      <div className="font-medium">وحدات الويت</div>
                      <div className="text-blue-600">{formatNumber(results.boxSummary.unitsUsed, 0)} وحدة</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle>حاسبة الأسعار</CardTitle>
                <CardDescription>احسب تكلفة الطعام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>العملة</Label>
                    <Select value={pricing.currency} onValueChange={(value) => handlePricingChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="EUR">يورو (EUR)</SelectItem>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>سعر الدراي (لكل كيلو)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={pricing.priceDryPerKg}
                      onChange={(e) => handlePricingChange('priceDryPerKg', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>سعر وحدة الويت</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={pricing.priceWetUnit}
                      onChange={(e) => handlePricingChange('priceWetUnit', e.target.value)}
                    />
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold mb-3">ملخص التكاليف</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">تكلفة الدراي</div>
                      <div className="text-green-600">{formatNumber(costs.dryCost, 2)} {pricing.currency}</div>
                    </div>
                    <div>
                      <div className="font-medium">تكلفة الويت</div>
                      <div className="text-green-600">{formatNumber(costs.wetCost, 2)} {pricing.currency}</div>
                    </div>
                    <div>
                      <div className="font-medium">التكلفة الإجمالية</div>
                      <div className="text-green-600 font-bold">{formatNumber(costs.totalCost, 2)} {pricing.currency}</div>
                    </div>
                    <div>
                      <div className="font-medium">التكلفة في اليوم</div>
                      <div className="text-green-600">{formatNumber(costs.perDay, 2)} {pricing.currency}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Save/Load Data Section */}
            <Card>
              <CardHeader>
                <CardTitle>حفظ وتحميل البيانات</CardTitle>
                <CardDescription>احفظ بيانات العميل لاستعمالها لاحقاً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          onClick={async () => {
                            if (!catData.clientName.trim()) {
                              alert('الرجاء إدخال اسم العميل أولاً')
                              return
                            }
                            setIsSaving(true)
                            try {
                              const res = await fetch('/api/clients', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  name: catData.clientName,
                                  phone: catData.clientPhone,
                                  address: catData.clientAddress,
                                  data: {
                                    catData,
                                    foodData,
                                    weeklyPlan,
                                    boxBuilder,
                                    pricing
                                  }
                                })
                              })
                              const json = await res.json()
                              if (!res.ok) throw new Error(json?.error || 'فشل في الحفظ')
                              alert('تم حفظ بيانات العميل بنجاح')
                              await loadClients() // Refresh client list
                            } catch (e) {
                              console.error('Save failed:', e)
                              alert('فشل في حفظ البيانات: ' + (e as Error).message)
                            } finally {
                              setIsSaving(false)
                            }
                          }}
                          disabled={isSaving || !catData.clientName.trim()}
                        >
                          {isSaving ? 'جاري الحفظ...' : 'حفظ بيانات العميل'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>يحفظ جميع بيانات القطة والطعام والجدوهة</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={async () => {
                            if (!catData.clientName.trim()) {
                              alert('الرجاء اختيار عميل أولاً')
                              return
                            }
                            try {
                              const res = await fetch(`/api/clients?name=${encodeURIComponent(catData.clientName)}`)
                              const json = await res.json()
                              if (!res.ok) throw new Error(json?.error || 'غير موجود')
                              const data = json?.data
                              
                              if (data?.catData) {
                                Object.entries(data.catData).forEach(([k, v]) => {
                                  handleCatDataChange(k as any, v as any)
                                })
                              }
                              if (data?.foodData) {
                                Object.entries(data.foodData).forEach(([k, v]) => {
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
                                  handleBoxBuilderChange(k as any, v as any)
                                })
                              }
                              if (data?.pricing) {
                                Object.entries(data.pricing).forEach(([k, v]) => {
                                  handlePricingChange(k as any, v as any)
                                })
                              }
                              
                              alert('تم تحميل بيانات العميل بنجاح')
                            } catch (e) {
                              console.error('Load failed:', e)
                              alert('فشل في تحميل بيانات العميل: ' + (e as Error).message)
                            }
                          }}
                          disabled={!catData.clientName.trim()}
                        >
                          تحميل بيانات العميل
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>يحمّل بيانات محفوظة سابقاً لهذا العميل</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Client Dialog */}
        <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newClientName">اسم العميل *</Label>
                <Input
                  id="newClientName"
                  placeholder="أدخل اسم العميل"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClientPhone">رقم الهاتف</Label>
                <Input
                  id="newClientPhone"
                  placeholder="أدخل رقم الهاتف (اختياري)"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClientAddress">العنوان</Label>
                <Input
                  id="newClientAddress"
                  placeholder="أدخل العنوان (اختياري)"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewClientDialog(false)
                    setNewClientName('')
                    setNewClientPhone('')
                    setNewClientAddress('')
                  }}
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={createNewClient}
                  disabled={!newClientName.trim()}
                >
                  إضافة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}