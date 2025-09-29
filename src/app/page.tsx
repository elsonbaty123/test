'use client'

import { useState, useEffect, useMemo } from 'react'

import { useCatNutrition, BoxVariant as NutritionBoxVariant, BoxPricing as NutritionBoxPricing } from '@/hooks/useCatNutrition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PrintButton } from '@/components/print/PrintButton'
import { BoxLabelPrintButton } from '@/components/labels/BoxLabelPrintButton'
import { ReprintReceiptButton } from '@/components/labels/ReprintReceiptButton'
import BoxPricingDisplay from '@/components/BoxPricingDisplay'

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
    updateBoxContent,
    updatePackagingCostByDuration,
    boxTypeEditableConfigs,
    updateBoxTypeEditableConfig,
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
    calculateBoxPricing,
    formatNumber,
    bcsSuggestedLive,
    bcsSuggestionReasonLive,
    BOX_TYPES,
    BOX_VARIANTS,
    applyPresetSelection,
    autoSyncSelection,
    setAutoSyncSelection,
  } = useCatNutrition()

  const selectedPresetBox = useMemo(() => {
    if (boxBuilder.presetBoxId) {
      const found = BOX_TYPES.find((box) => box.id === boxBuilder.presetBoxId)
      if (found) return found
    }
    return BOX_TYPES[0]
  }, [BOX_TYPES, boxBuilder.presetBoxId])

  const availableVariants = useMemo(() => {
    if (!selectedPresetBox) return BOX_VARIANTS
    if (!selectedPresetBox.enabledDurations || selectedPresetBox.enabledDurations.length === 0) {
      return BOX_VARIANTS
    }
    return BOX_VARIANTS.filter((variant) => selectedPresetBox.enabledDurations.includes(variant.duration))
  }, [BOX_VARIANTS, selectedPresetBox])

  const currentPresetBoxId = selectedPresetBox?.id ?? ''
  const currentPresetVariantDuration = (boxBuilder.presetVariantDuration as 'week' | 'twoWeeks' | 'month' | undefined) ?? (availableVariants[0]?.duration ?? 'week')

  const handlePresetBoxChange = (nextBoxId: string) => {
    handleBoxBuilderChange('presetBoxId', nextBoxId)
    const changeTargetBox = BOX_TYPES.find((box) => box.id === nextBoxId)
    let resolvedDuration: 'week' | 'twoWeeks' | 'month' = currentPresetVariantDuration
    if (changeTargetBox?.enabledDurations && changeTargetBox.enabledDurations.length > 0) {
      if (!changeTargetBox.enabledDurations.includes(resolvedDuration)) {
        resolvedDuration = changeTargetBox.enabledDurations[0]
      }
    }
    handleBoxBuilderChange('presetVariantDuration', resolvedDuration)
    applyPresetSelection(nextBoxId, resolvedDuration)
  }

  const handlePresetVariantChange = (duration: 'week' | 'twoWeeks' | 'month') => {
    handleBoxBuilderChange('presetVariantDuration', duration)
    const targetBoxId = boxBuilder.presetBoxId ?? selectedPresetBox?.id
    if (targetBoxId) {
      applyPresetSelection(targetBoxId, duration)
    }
  }

  const handleAutoSyncToggle = (checked: boolean) => {
    setAutoSyncSelection(checked)
    if (checked) {
      const targetBoxId = boxBuilder.presetBoxId ?? selectedPresetBox?.id
      const targetDuration = (boxBuilder.presetVariantDuration as 'week' | 'twoWeeks' | 'month' | undefined) ?? currentPresetVariantDuration
      if (targetBoxId) {
        applyPresetSelection(targetBoxId, targetDuration)
      }
    }
  }

  const handleSelectPricingBox = (boxPricing: NutritionBoxPricing) => {
    const targetBoxId = boxPricing.boxType.id
    const targetDuration = boxPricing.variant.duration
    applyPresetSelection(targetBoxId, targetDuration)
  }

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [clients, setClients] = useState<Array<{id: string, name: string, phone: string, address: string, createdAt: string, updatedAt: string}>>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [isLoadingClientData, setIsLoadingClientData] = useState(false)
  const [showNewClientDialog, setShowNewClientDialog] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientAddress, setNewClientAddress] = useState('')
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)

  // Orders history state
  type OrderRecord = {
    orderNo: string
    createdAt?: string
    currency?: string
    totals: {
      totalCostWithProfit?: number
      totalCostAfterDiscount?: number
      deliveryCost?: number
      totalCostWithDelivery?: number
    }
    catName?: string
    payload?: any
    planDuration?: string
    paidAmount?: number
  }
  const [ordersClientName, setOrdersClientName] = useState('')
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState<string>('')

  // Keep ordersClientName in sync with selected client
  useEffect(() => {
    setOrdersClientName(catData.clientName || '')
  }, [catData.clientName])

  const loadOrdersForClient = async (name: string) => {
    if (!name.trim()) { setOrders([]); return }
    try {
      setIsLoadingOrders(true)
      setOrdersError('')
      const res = await fetch(`/api/orders?name=${encodeURIComponent(name.trim())}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'فشل تحميل الطلبات')
      setOrders(Array.isArray(json.orders) ? json.orders : [])
    } catch (e) {
      console.error('Load orders failed:', e)
      setOrdersError((e as Error).message)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const deleteOrder = async (name: string, orderNo: string) => {
    const ok = window.confirm(`سيتم حذف الطلب ${orderNo} للعميل "${name}". هل أنت متأكد؟`)
    if (!ok) return
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, orderNo })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'فشل حذف الطلب')
      await loadOrdersForClient(name)
    } catch (e) {
      alert('فشل حذف الطلب: ' + (e as Error).message)
    }
  }

  // BCS suggestion prefers calculated results; falls back to live suggestion
  const bcsSuggestion = results?.bcsSuggested ?? bcsSuggestedLive
  const bcsReason = results?.bcsSuggestionReason ?? bcsSuggestionReasonLive

  // Breed search state
  const [breedPickerOpen, setBreedPickerOpen] = useState(false)
  const [breedPickerTarget, setBreedPickerTarget] = useState<'pure' | 'mixA' | 'mixB'>('pure')

  // Comprehensive breed list for selection/search
  const ALL_BREEDS: Array<{ code: string; label: string }> = [
    { code: 'domestic_shorthair', label: 'منزلية شعر قصير' },
    { code: 'domestic_longhair', label: 'منزلية شعر طويل' },
    { code: 'persian', label: 'Persian (شيرازي)' },
    { code: 'british_shorthair', label: 'British Shorthair' },
    { code: 'british_longhair', label: 'British Longhair' },
    { code: 'maine_coon', label: 'Maine Coon' },
    { code: 'ragdoll', label: 'Ragdoll' },
    { code: 'siamese', label: 'Siamese' },
    { code: 'bengal', label: 'Bengal' },
    { code: 'sphynx', label: 'Sphynx' },
    { code: 'scottish_fold', label: 'Scottish Fold' },
    { code: 'norwegian_forest', label: 'Norwegian Forest' },
    { code: 'american_shorthair', label: 'American Shorthair' },
    { code: 'abyssinian', label: 'Abyssinian' },
    { code: 'turkish_angora', label: 'Turkish Angora' },
    { code: 'russian_blue', label: 'Russian Blue' },
    { code: 'oriental', label: 'Oriental' },
    { code: 'burmese', label: 'Burmese (بورميز)' },
    { code: 'tonkinese', label: 'Tonkinese (تونكينيز)' },
    { code: 'himalayan', label: 'Himalayan (هيمالايا)' },
    { code: 'devon_rex', label: 'Devon Rex (ديفون ريكس)' },
    { code: 'cornish_rex', label: 'Cornish Rex (كورنيش ريكس)' },
    { code: 'manx', label: 'Manx (مانكس)' },
    { code: 'savannah', label: 'Savannah (سافانا)' },
    { code: 'bombay', label: 'Bombay (بومباي)' },
    { code: 'egyptian_mau', label: 'Egyptian Mau (مصري ماو)' },
    { code: 'egyptian_baladi', label: 'بلدي مصري (Baladi)' },
    { code: 'chartreux', label: 'Chartreux' },
    { code: 'turkish_van', label: 'Turkish Van' },
    { code: 'birman', label: 'Birman' },
    { code: 'somali', label: 'Somali' },
    { code: 'exotic_shorthair', label: 'Exotic Shorthair' },
    { code: 'american_curl', label: 'American Curl' },
    { code: 'american_bobtail', label: 'American Bobtail' },
    { code: 'scottish_straight', label: 'Scottish Straight' },
    { code: 'munchkin', label: 'Munchkin' },
    { code: 'siberian', label: 'Siberian' },
    { code: 'neva_masquerade', label: 'Neva Masquerade' },
    { code: 'peterbald', label: 'Peterbald' },
    { code: 'ocicat', label: 'Ocicat' },
    { code: 'singapura', label: 'Singapura' },
    { code: 'toyger', label: 'Toyger' },
  ]

  const openBreedPicker = (target: 'pure' | 'mixA' | 'mixB') => {
    setBreedPickerTarget(target)
    setBreedPickerOpen(true)
  }

  const pickBreed = (code: string) => {
    if (breedPickerTarget === 'pure') handleCatDataChange('breed', code)
    if (breedPickerTarget === 'mixA') handleCatDataChange('breedMixA', code)
    if (breedPickerTarget === 'mixB') handleCatDataChange('breedMixB', code)
    setBreedPickerOpen(false)
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
      egyptian_baladi: 'بلدي مصري (Baladi)',
      chartreux: 'Chartreux',
      turkish_van: 'Turkish Van',
      birman: 'Birman',
      somali: 'Somali',
      exotic_shorthair: 'Exotic Shorthair',
      american_curl: 'American Curl',
      american_bobtail: 'American Bobtail',
      scottish_straight: 'Scottish Straight',
      munchkin: 'Munchkin',
      siberian: 'Siberian',
      neva_masquerade: 'Neva Masquerade',
      peterbald: 'Peterbald',
      ocicat: 'Ocicat',
      singapura: 'Singapura',
      toyger: 'Toyger',
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
      <header className="bg-gradient-to-r from-sky-500 to-teal-500 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.ico" 
                  alt="Bastet Pets Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold mb-1">حاسبة تغذية القطة + صانع البوكسات</h1>
                <p className="text-sm md:text-base opacity-90">سعرات محسوبة علميًا + جدول أسبوعي + بوكس شهري 30 يوم</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>معتمد على NRC & WSAVA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>حساب علمي دقيق</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Progress Indicator - Mobile Friendly */}
        <div className="md:hidden bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className={`px-3 py-1 rounded-full text-xs ${
              catData.clientName ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              دبيانات العميل
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${
              catData.name && catData.weight ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              بيانات القطة
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${
              foodData.dry100 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              بيانات الطعام
            </span>
            <span className={`px-3 py-1 rounded-full text-xs ${
              results ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
              النتائج
            </span>
          </div>
        </div>
        {/* Client Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات العميل</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">اسم العميل *</Label>
              <Input
                id="clientName"
                placeholder="أدخل اسم العميل"
                value={catData.clientName}
                onChange={(e) => handleCatDataChange('clientName', e.target.value)}
                className={!catData.clientName.trim() ? 'border-red-300 focus:border-red-500' : ''}
              />
              {!catData.clientName.trim() && (
                <p className="text-xs text-red-500">هذا الحقل مطلوب للحفظ</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>البحث في العملاء المحفوظين</Label>
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
              <p className="text-xs text-gray-500">اختياري: ابحث لتحميل بيانات عميل محفوظة مسبقاً</p>
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

        {/* Orders History Section */}
        <Card>
          <CardHeader>
            <CardTitle>سجل الطلبات</CardTitle>
            <CardDescription>استعرض وأعد طباعة أو احذف طلبات العميل</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="اسم العميل"
                value={ordersClientName}
                onChange={(e) => setOrdersClientName(e.target.value)}
                className="sm:max-w-xs"
              />
              <Button
                variant="outline"
                onClick={() => loadOrdersForClient(ordersClientName)}
                disabled={isLoadingOrders || !ordersClientName.trim()}
              >
                {isLoadingOrders ? 'جاري التحميل...' : 'تحميل طلبات العميل'}
              </Button>
            </div>

            {ordersError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription>{ordersError}</AlertDescription>
              </Alert>
            )}

        {/* Box Pricing Display - repositioned under cost summary */}
        {catData.name && catData.weight && foodData.dry100 && pricing.priceDryPerKg && pricing.treatPrice && results && (
          <BoxPricingDisplay
            boxPricings={calculateBoxPricing(results)}
            currency={pricing.currency}
            formatNumber={formatNumber}
            onSelectBox={handleSelectPricingBox}
          />
        )}

            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>القطة</TableHead>
                      <TableHead>مدة الخطة</TableHead>
                      <TableHead>الإجمالي النهائي</TableHead>
                      <TableHead>المبلغ المسدد</TableHead>
                      <TableHead className="text-left">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.orderNo}>
                        <TableCell className="font-mono text-sm">{o.orderNo}</TableCell>
                        <TableCell>{o.createdAt ? new Date(o.createdAt).toLocaleString('ar-EG') : '-'}</TableCell>
                        <TableCell>{o.catName || '-'}</TableCell>
                        <TableCell>{o.planDuration || '-'}</TableCell>
                        <TableCell>{(o.totals?.totalCostWithDelivery ?? 0).toLocaleString('ar-EG')} {o.currency || pricing.currency}</TableCell>
                        <TableCell>{(o.paidAmount ?? 0).toLocaleString('ar-EG')} {o.currency || pricing.currency}</TableCell>
                        <TableCell className="flex gap-2">
                          <ReprintReceiptButton
                            client={{ name: ordersClientName, phone: catData.clientPhone, address: catData.clientAddress }}
                            order={o}
                            variant="outline"
                            size="sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => deleteOrder(ordersClientName, o.orderNo)}
                          >
                            حذف
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">لا توجد طلبات لهذا العميل بعد.</p>
            )}
          </CardContent>
        </Card>

        {/* Save/Load Data Section - Moved to top */}
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
                          setSaveStatus('error')
                          setSaveMessage('الرجاء إدخال اسم العميل أولاً')
                          setTimeout(() => setSaveStatus('idle'), 3000)
                          return
                        }
                        
                        setSaveStatus('saving')
                        setIsSaving(true)
                        setSaveMessage('جاري حفظ البيانات...')
                        
                        try {
                          const res = await fetch('/api/clients', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              clientName: catData.clientName,
                              clientPhone: catData.clientPhone,
                              clientAddress: catData.clientAddress,
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
                          
                          setSaveStatus('success')
                          setSaveMessage('تم حفظ بيانات العميل بنجاح ✓')
                          await loadClients() // Refresh client list
                          
                          // Reset status after success message
                          setTimeout(() => setSaveStatus('idle'), 3000)
                        } catch (e) {
                          console.error('Save failed:', e)
                          setSaveStatus('error')
                          setSaveMessage('فشل في حفظ البيانات: ' + (e as Error).message)
                          setTimeout(() => setSaveStatus('idle'), 5000)
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
                          setSaveStatus('error')
                          setSaveMessage('الرجاء اختيار عميل أولاً')
                          setTimeout(() => setSaveStatus('idle'), 3000)
                          return
                        }
                        
                        setSaveStatus('saving')
                        setSaveMessage('جاري تحميل بيانات العميل...')
                        
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
                          
                          setSaveStatus('success')
                          setSaveMessage('تم تحميل بيانات العميل بنجاح ✓')
                          setTimeout(() => setSaveStatus('idle'), 3000)
                        } catch (e) {
                          console.error('Load failed:', e)
                          setSaveStatus('error')
                          setSaveMessage('فشل في تحميل بيانات العميل: ' + (e as Error).message)
                          setTimeout(() => setSaveStatus('idle'), 5000)
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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={async () => {
                        const name = catData.clientName.trim()
                        if (!name) {
                          setSaveStatus('error')
                          setSaveMessage('الرجاء إدخال/اختيار اسم العميل أولاً')
                          setTimeout(() => setSaveStatus('idle'), 3000)
                          return
                        }
                        const ok = window.confirm(`سيتم حذف بيانات العميل "${name}" نهائياً. هل أنت متأكد؟`)
                        if (!ok) return
                        try {
                          setSaveStatus('saving')
                          setSaveMessage('جاري حذف العميل...')
                          const res = await fetch('/api/clients', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name })
                          })
                          const json = await res.json().catch(() => ({}))
                          if (!res.ok) throw new Error(json?.error || 'فشل حذف العميل')
                          // Clear client fields
                          handleCatDataChange('clientName', '')
                          handleCatDataChange('clientPhone', '')
                          handleCatDataChange('clientAddress', '')
                          setClientSearchTerm('')
                          setShowClientDropdown(false)
                          await loadClients('')
                          setSaveStatus('success')
                          setSaveMessage('تم حذف العميل بنجاح ✓')
                          setTimeout(() => setSaveStatus('idle'), 3000)
                        } catch (e) {
                          console.error('Delete client failed:', e)
                          setSaveStatus('error')
                          setSaveMessage('فشل في حذف العميل: ' + (e as Error).message)
                          setTimeout(() => setSaveStatus('idle'), 5000)
                        }
                      }}
                    >
                      حذف العميل
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>حذف العميل والبيانات المرتبطة به</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Save/Load Status Indicator */}
            {saveStatus !== 'idle' && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                saveStatus === 'saving' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                saveStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {saveStatus === 'saving' && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {saveStatus === 'success' && (
                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-xs">✗</div>
                  )}
                  <span>{saveMessage}</span>
                </div>
              </div>
            )}
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
              <Label>نوع السلالة</Label>
              <Select value={catData.breedMode || 'pure'} onValueChange={(value) => handleCatDataChange('breedMode', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pure">سلالة نقية</SelectItem>
                  <SelectItem value="mixed">خليط (هجينة)</SelectItem>
                  <SelectItem value="other">غير موجودة (مخصص)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(!catData.breedMode || catData.breedMode === 'pure') && (
              <div className="space-y-2">
                <Label>السلالة (نقية)</Label>
                <div className="flex items-center gap-2">
                  <Select value={catData.breed} onValueChange={(value) => handleCatDataChange('breed', value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_BREEDS.map((b) => (
                        <SelectItem key={b.code} value={b.code}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => openBreedPicker('pure')}>بحث</Button>
                </div>
              </div>
            )}

            {catData.breedMode === 'mixed' && (
              <div className="space-y-2">
                <Label>السلالة (خليط بين سلالتين)</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Select value={catData.breedMixA || ''} onValueChange={(value) => handleCatDataChange('breedMixA', value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="اختر السلالة الأولى" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_BREEDS.map((b) => (
                          <SelectItem key={b.code} value={b.code}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => openBreedPicker('mixA')}>بحث</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={catData.breedMixB || ''} onValueChange={(value) => handleCatDataChange('breedMixB', value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="اختر السلالة الثانية" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_BREEDS.map((b) => (
                          <SelectItem key={b.code} value={b.code}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => openBreedPicker('mixB')}>بحث</Button>
                  </div>
                </div>
              </div>
            )}

            {catData.breedMode === 'other' && (
              <div className="space-y-2">
                <Label>السلالة (مخصصة)</Label>
                <Input
                  placeholder="اكتب اسم السلالة غير الموجودة"
                  value={catData.breedOther}
                  onChange={(e) => handleCatDataChange('breedOther', e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>حالة الجسم (BCS)</Label>
              <Select value={catData.bcs.toString()} onValueChange={(value) => handleCatDataChange('bcs', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - نحيف جداً</SelectItem>
                  <SelectItem value="2">2 - نحيف</SelectItem>
                  <SelectItem value="3">3 - تحت الوزن</SelectItem>
                  <SelectItem value="4">4 - أقل من المثالي</SelectItem>
                  <SelectItem value="5">5 - مثالي</SelectItem>
                  <SelectItem value="6">6 - فوق المثالي قليلاً</SelectItem>
                  <SelectItem value="7">7 - زيادة وزن</SelectItem>
                  <SelectItem value="8">8 - بدانة</SelectItem>
                  <SelectItem value="9">9 - بدانة مفرطة</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-500">مقياس 1-9 حسب WSAVA. هذا الاختيار يدوي؛ سنعرض توصية علمية عند الحساب دون إجبار.</p>
                {catData.weight && !isNaN(parseFloat(catData.weight)) && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">التوصية العلمية: BCS = {bcsSuggestion}</span>
                    {catData.bcs !== bcsSuggestion && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCatDataChange('bcs', bcsSuggestion)}
                      >
                        تطبيق التوصية
                      </Button>
                    )}
                  </div>
                )}
                {catData.weight && !isNaN(parseFloat(catData.weight)) && bcsReason && (
                  <div className="text-[11px] leading-snug text-gray-600 mt-1">
                    سبب التوصية: {bcsReason}
                  </div>
                )}
              </div>
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
            <CardDescription>
              اضبط أيام الويت المتوقعة حسب نوع البوكس المختار. يمكنك تعطيل التزامن التلقائي من إعدادات صانع البوكسات.
            </CardDescription>
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
                    disabled={autoSyncSelection}
                  />
                  <Button
                    variant="outline"
                    onClick={() => autoDistributeWetDays(weeklyPlan.wetDaysCount)}
                    size="sm"
                    disabled={autoSyncSelection}
                  >
                    توزيع تلقائي
                  </Button>
                </div>
                {autoSyncSelection && (
                  <p className="text-xs text-gray-500">
                    يتم ضبط الأيام تلقائياً حسب البوكس المختار. عطّل التزامن من صانع البوكسات للتعديل اليدوي.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>الوجبة التي تحتوي على ويت</Label>
                <Select 
                  value={weeklyPlan.wetMealIndex.toString()} 
                  onValueChange={(value) => handleWeeklyPlanChange('wetMealIndex', parseInt(value))}
                  disabled={autoSyncSelection}
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
                      disabled={autoSyncSelection}
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

        {/* Box Builder */}
        <Card>
          <CardHeader>
            <CardTitle>صانع البوكسات</CardTitle>
            <CardDescription>احسب ما تحتاجه لفترة معينة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>اختيار البوكس الجاهز</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={currentPresetBoxId} onValueChange={handlePresetBoxChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر البوكس" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOX_TYPES.map((box) => (
                      <SelectItem key={box.id} value={box.id}>
                        {box.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={currentPresetVariantDuration}
                  onValueChange={(value) => handlePresetVariantChange(value as 'week' | 'twoWeeks' | 'month')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المدة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVariants.map((variant) => (
                      <SelectItem key={variant.duration} value={variant.duration}>
                        {variant.durationLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500">
                اختيارك يضبط نوع البوكس وعدد الأيام تلقائياً حسب المدة المختارة.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                <div>
                  <Label className="text-sm font-medium">مزامنة تلقائية مع البوكس المختار</Label>
                  <p className="text-xs text-gray-500">عند التفعيل، يتم ضبط جدول الويت وصانع البوكس تلقائياً حسب البوكس المختار.</p>
                </div>
                <Switch checked={autoSyncSelection} onCheckedChange={handleAutoSyncToggle} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Label>عدد البوكسات</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={boxBuilder.boxCount || 1}
                  onChange={(e) => handleBoxBuilderChange('boxCount', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500">عدد البوكسات المطلوبة</p>
              </div>

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

            <div className="space-y-4">
              <h4 className="text-base font-semibold text-gray-700">إعداد مكونات كل بوكس</h4>
              <p className="text-sm text-gray-500">حدد إن كان البوكس يحتوي على ويت فود أو تريت، وكمية الويت الأسبوعية، والمدد المتاحة للطلب.</p>
              <div className="space-y-4">
                {boxTypeEditableConfigs.map((box) => (
                  <div key={box.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex flex-col gap-1">
                      <h5 className="text-lg font-semibold text-gray-800">{box.label}</h5>
                      <p className="text-xs text-gray-500">اضبط خيارات هذا البوكس حسب المحتوى المتاح.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>يتضمن ويت فود؟</Label>
                        <Select
                          value={box.includeWetFood ? 'yes' : 'no'}
                          onValueChange={(value) => {
                            const includeWet = value === 'yes'
                            updateBoxTypeEditableConfig(box.id, {
                              includeWetFood: includeWet,
                              wetFoodBagsPerWeek: includeWet ? (box.wetFoodBagsPerWeek === '0' ? '1' : box.wetFoodBagsPerWeek) : '0',
                            })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">نعم</SelectItem>
                            <SelectItem value="no">لا</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>عدد أكياس الويت في الأسبوع</Label>
                        <Select
                          value={box.wetFoodBagsPerWeek}
                          onValueChange={(value) => updateBoxTypeEditableConfig(box.id, { wetFoodBagsPerWeek: value })}
                          disabled={!box.includeWetFood}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['0','1','2','3','4','5','6','7'].map((num) => (
                              <SelectItem key={num} value={num}>{num === '0' ? '0 (لا يوجد)' : `${num} كيس/أسبوع`}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!box.includeWetFood && (
                          <p className="text-xs text-gray-500">فعِّل الويت فود لتحديد الكمية.</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>يتضمن تريت؟</Label>
                        <Select
                          value={box.includeTreat ? 'yes' : 'no'}
                          onValueChange={(value) => updateBoxTypeEditableConfig(box.id, { includeTreat: value === 'yes' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">نعم</SelectItem>
                            <SelectItem value="no">لا</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>المدد المتاحة للبوكس</Label>
                      <div className="flex flex-wrap gap-4">
                        {[{ value: 'week', label: 'أسبوع واحد' }, { value: 'twoWeeks', label: 'أسبوعان' }, { value: 'month', label: 'شهر كامل' }].map((duration) => {
                          const isChecked = box.enabledDurations.includes(duration.value as 'week' | 'twoWeeks' | 'month')
                          return (
                            <label key={duration.value} className="flex items-center gap-2 text-sm text-gray-700">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const enable = Boolean(checked)
                                  let nextDurations = box.enabledDurations
                                  if (enable && !isChecked) {
                                    nextDurations = [...box.enabledDurations, duration.value as 'week' | 'twoWeeks' | 'month']
                                  }
                                  if (!enable && isChecked) {
                                    if (box.enabledDurations.length === 1) {
                                      return
                                    }
                                    nextDurations = box.enabledDurations.filter((d) => d !== duration.value)
                                  }
                                  updateBoxTypeEditableConfig(box.id, { enabledDurations: nextDurations })
                                }}
                              />
                              <span>{duration.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {box.includeTreat && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>كمية التريت - الأسبوع</Label>
                          <Select
                            value={box.treatUnitsPerDuration.week}
                            onValueChange={(value) => updateBoxTypeEditableConfig(box.id, {
                              treatUnitsPerDuration: {
                                week: value,
                                twoWeeks: box.treatUnitsPerDuration.twoWeeks,
                                month: box.treatUnitsPerDuration.month,
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['0','1','2','3','4','5'].map((num) => (
                                <SelectItem key={num} value={num}>{num} تريت/أسبوع</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>كمية التريت - أسبوعين</Label>
                          <Select
                            value={box.treatUnitsPerDuration.twoWeeks}
                            onValueChange={(value) => updateBoxTypeEditableConfig(box.id, {
                              treatUnitsPerDuration: {
                                week: box.treatUnitsPerDuration.week,
                                twoWeeks: value,
                                month: box.treatUnitsPerDuration.month,
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['0','1','2','3','4','5','6','7','8','9','10'].map((num) => (
                                <SelectItem key={num} value={num}>{num} تريت/أسبوعين</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>كمية التريت - الشهر</Label>
                          <Select
                            value={box.treatUnitsPerDuration.month}
                            onValueChange={(value) => updateBoxTypeEditableConfig(box.id, {
                              treatUnitsPerDuration: {
                                week: box.treatUnitsPerDuration.week,
                                twoWeeks: box.treatUnitsPerDuration.twoWeeks,
                                month: value,
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['0','2','4','6','8','10','12'].map((num) => (
                                <SelectItem key={num} value={num}>{num} تريت/شهر</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
                <Label>تغليف البوكس الأسبوعي</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricing.packagingCosts?.week ?? ''}
                  onChange={(e) => updatePackagingCostByDuration('week', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>تغليف بوكس الأسبوعين</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricing.packagingCosts?.twoWeeks ?? ''}
                  onChange={(e) => updatePackagingCostByDuration('twoWeeks', e.target.value)}
                />
                <p className="text-xs text-gray-500">لا يُضاف مرتين تلقائياً</p>
              </div>

              <div className="space-y-2">
                <Label>تغليف الخطة الشهرية / أطول</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricing.packagingCosts?.month ?? ''}
                  onChange={(e) => updatePackagingCostByDuration('month', e.target.value)}
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>سعر التريت</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricing.treatPrice}
                  onChange={(e) => handlePricingChange('treatPrice', e.target.value)}
                />
                <p className="text-xs text-gray-500">سعر التريت المضاف للبوكس</p>
              </div>

              <div className="space-y-2">
                <Label>تكاليف التغليف</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricing.packagingCost}
                  onChange={(e) => handlePricingChange('packagingCost', e.target.value)}
                />
                <p className="text-xs text-gray-500">قيمة افتراضية تُستخدم عند عدم تحديد تكلفة حسب المدة</p>
              </div>

              <div className="space-y-2">
                <Label>سعر الدلفري</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricing.deliveryCost}
                  onChange={(e) => handlePricingChange('deliveryCost', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>تكاليف إضافية</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricing.additionalCosts}
                  onChange={(e) => handlePricingChange('additionalCosts', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>نسبة الأرباح (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="20"
                  value={pricing.profitPercentage}
                  onChange={(e) => handlePricingChange('profitPercentage', e.target.value)}
                />
                <p className="text-xs text-gray-500">محسوبة من (دراي + ويت + تغليف + إضافي)</p>
              </div>

              <div className="space-y-2">
                <Label>نسبة الخصم (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  value={pricing.discountPercentage}
                  onChange={(e) => handlePricingChange('discountPercentage', e.target.value)}
                />
                <p className="text-xs text-gray-500">خصم من المبلغ بعد الأرباح</p>
              </div>

              <div className="space-y-2">
                <Label>المبلغ المسدد</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricing.paidAmount || ''}
                  onChange={(e) => handlePricingChange('paidAmount', e.target.value)}
                />
                <p className="text-xs text-gray-500">المبلغ الذي دفعه العميل</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold">مكونات كل بوكس</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {BOX_TYPES.map((box) => (
                    <div key={box.id} className="space-y-2">
                      <Label>مكونات `{box.name}`</Label>
                      <Textarea
                        value={pricing.boxContents?.[box.id] ?? ''}
                        onChange={(e) => updateBoxContent(box.id, e.target.value)}
                        rows={3}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>ملخص التكاليف</CardTitle>
              <CardDescription>التكاليف المحسوبة بناءً على النتائج</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold mb-3">ملخص التكاليف</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">تكلفة الدراي:</span>
                        <span className="font-medium">{formatNumber(costs.dryCost, 2)} {pricing.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تكلفة الويت:</span>
                        <span className="font-medium">{formatNumber(costs.wetCost, 2)} {pricing.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تكلفة التريت:</span>
                        <span className="font-medium">{formatNumber(costs.treatCost, 2)} {pricing.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تكاليف التغليف:</span>
                        <span className="font-medium">{formatNumber(costs.packagingCost, 2)} {pricing.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تكاليف إضافية:</span>
                        <span className="font-medium">{formatNumber(costs.additionalCosts, 2)} {pricing.currency}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-medium">المجموع قبل الأرباح:</span>
                        <span className="font-bold text-blue-600">{formatNumber(costs.totalCostBeforeProfit, 2)} {pricing.currency}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">مبلغ الأرباح ({pricing.profitPercentage}%):</span>
                        <span className="font-medium text-green-600">+{formatNumber(costs.profitAmount, 2)} {pricing.currency}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-medium">بعد الأرباح:</span>
                        <span className="font-bold text-green-600">{formatNumber(costs.totalCostWithProfit, 2)} {pricing.currency}</span>
                      </div>
                      {costs.discountAmount > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">خصم ({pricing.discountPercentage}%):</span>
                            <span className="font-medium text-red-600">-{formatNumber(costs.discountAmount, 2)} {pricing.currency}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-medium">بعد الخصم:</span>
                            <span className="font-bold text-green-600">{formatNumber(costs.totalCostAfterDiscount, 2)} {pricing.currency}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">سعر الدلفري:</span>
                        <span className="font-medium">+{formatNumber(costs.deliveryCost, 2)} {pricing.currency}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2 bg-green-100 -mx-3 px-3 py-2 rounded">
                        <span className="font-bold">المبلغ النهائي شامل الدلفري:</span>
                        <span className="font-bold text-lg text-green-700">{formatNumber(costs.totalCostWithDelivery, 2)} {pricing.currency}</span>
                      </div>
                      {pricing.paidAmount && parseFloat(pricing.paidAmount) > 0 && (
                        <>
                          <div className="flex justify-between mt-2">
                            <span className="text-gray-600">المبلغ المسدد:</span>
                            <span className="font-medium text-blue-600">{formatNumber(parseFloat(pricing.paidAmount), 2)} {pricing.currency}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-bold">المبلغ المتبقي:</span>
                            <span className={`font-bold ${(costs.totalCostWithDelivery - parseFloat(pricing.paidAmount)) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatNumber(Math.max(0, costs.totalCostWithDelivery - parseFloat(pricing.paidAmount)), 2)} {pricing.currency}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-center text-sm text-gray-600">
                  التكلفة اليومية: {formatNumber(costs.perDay, 2)} {pricing.currency}
                </div>
               </div>
              </CardContent>
            </Card>
        )}

        {/* Calculate Button */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            onClick={calculateNutrition}
            disabled={isCalculating}
            size="lg"
            className="min-w-[200px] h-12 text-lg"
          >
            {isCalculating ? 'جاري الحساب...' : 'احسب الجدول'}
          </Button>
        </div>

        {/* Print Button - placed before results as per convention */}
        {results && (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <PrintButton
              catData={catData}
              foodData={foodData}
              results={results}
              costs={costs}
              pricing={pricing}
              boxSummary={results.boxSummary}
              variant="default"
              size="lg"
              className="min-w-[200px] h-12 bg-green-600 hover:bg-green-700"
            />
            <BoxLabelPrintButton
              catData={catData}
              foodData={foodData}
              results={results}
              boxSummary={results.boxSummary}
              pricing={pricing}
              costs={costs}
              variant="outline"
              size="lg"
              className="min-w-[200px] h-12 border-orange-200 text-orange-700 hover:bg-orange-50"
            />
          </div>
        )}

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
                  <div className="min-w-[800px]">
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
                </div>
                
                {/* Mobile-friendly cards for smaller screens */}
                <div className="md:hidden mt-4 space-y-4">
                  {results.weeklyData.map((day, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      day.type === 'wet' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">{day.day}</h4>
                        <Badge variant={day.type === 'wet' ? 'default' : 'secondary'}>
                          {day.type === 'wet' ? 'ويت' : 'دراي'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">DER:</span>
                          <span className="ml-2 font-medium">{formatNumber(day.der, 0)}</span>
                        </div>
                        {day.wetKcal > 0 && (
                          <div>
                            <span className="text-gray-600">ويت:</span>
                            <span className="ml-2 font-medium">{formatNumber(day.wetGrams, 0)}ج</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">دراي:</span>
                          <span className="ml-2 font-medium">{formatNumber(day.dryGrams, 0)}ج</span>
                        </div>
                        {day.units > 0 && (
                          <div>
                            <span className="text-gray-600">وحدات:</span>
                            <span className="ml-2 font-medium">{formatNumber(day.units, 1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                        {day.mealsBreakdown.map((meal, mealIndex) => {
                          // Determine how to display wet food based on package type
                          const isPouch = foodData.wetPackType === 'pouch'
                          const wetDisplayText = meal.wetGrams > 0 
                            ? isPouch 
                              ? `باوتش: ${formatNumber(meal.wetUnits, 1)} وحدة`
                              : `ويت: ${formatNumber(meal.wetGrams, 0)} جرام`
                            : null
                          
                          return (
                            <div key={mealIndex} className="bg-gray-50 rounded p-3">
                              <div className="font-medium text-sm mb-2">الوجبة {meal.mealIndex}</div>
                              <div className="space-y-1 text-xs">
                                <div>الطاقة: {formatNumber(meal.kcal, 0)} كيلو كالوري</div>
                                {wetDisplayText && <div>{wetDisplayText}</div>}
                                {meal.dryGrams > 0 && <div>دراي: {formatNumber(meal.dryGrams, 0)} جرام</div>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Breed Search Dialog */}
        <CommandDialog open={breedPickerOpen} onOpenChange={setBreedPickerOpen} title="بحث عن السلالة" description="ابحث واختر السلالة">
          <CommandInput placeholder="اكتب اسم السلالة..." />
          <CommandList>
            <CommandEmpty>لا توجد نتائج</CommandEmpty>
            <CommandGroup heading="السلالات">
              {ALL_BREEDS.map((b) => (
                <CommandItem key={b.code} onSelect={() => pickBreed(b.code)}>
                  {b.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>

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
