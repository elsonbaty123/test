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