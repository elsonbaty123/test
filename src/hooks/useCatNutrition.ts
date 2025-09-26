'use client'

import { useState, useCallback, useMemo } from 'react'

interface CatData {
  name: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  ageValue: string;
  ageUnit: 'months' | 'years';
  lifeStage: 'auto' | 'kitten_young' | 'kitten_older' | 'adult' | 'senior';
  weight: string;
  bcs: number;
  sex: 'female' | 'male';
  breed: string;
  breedOther: string;
  breedMode?: 'pure' | 'mixed' | 'other';
  breedMixA?: string;
  breedMixB?: string;
  neuter: 'neutered' | 'intact';
  activity: string;
  meals: number;
  weightGoal: 'maintain' | 'loss' | 'gain';
  specialCond: 'none' | 'pregnant' | 'lactating' | 'ckd' | 'hyperthyroid' | 'diabetes' | 'recovery' | 'cardiac';
  pregWeek: number;
  lacWeek: number;
  lacKittens: number;
  specialDetails: Record<string, any>;
}

interface FoodData {
  dry100: string;
  wetMode: 'per100' | 'perUnit';
  wet100: string;
  wetKcalPerUnit: string;
  wetUnitGrams: string;
  wetPackType: 'pouch' | 'can';
}

interface WeeklyPlan {
  wetDaysCount: number;
  wetMealIndex: number;
  wetDays: boolean[];
}

interface BoxBuilder {
  boxType: 'weekly' | 'monthly30' | 'custom';
  customDays: number;
  safety: number;
  boxWetMode: 'auto_total' | 'fixed_total';
  boxSplitDays: number;
  boxTotalUnits: number;
  boxCount?: number;
}

interface Pricing {
  currency: string;
  priceDryPerKg: string;
  priceWetUnit: string;
  treatPrice: string;
  packagingCost: string;
  packagingCosts: {
    week: string;
    twoWeeks: string;
    month: string;
  };
  deliveryCost: string;
  additionalCosts: string;
  profitPercentage: string;
  discountPercentage: string;
  paidAmount: string;
  boxContents: Record<string, string>;
}

interface SpecialCondition {
  type: 'none' | 'pregnant' | 'lactating' | 'ckd' | 'hyperthyroid' | 'diabetes' | 'recovery' | 'cardiac';
  week?: number;
  kittens?: number;
  details?: Record<string, any>;
}

interface WeeklyDay {
  day: string;
  type: string;
  der: number;
  wetKcal: number;
  dryKcal: number;
  wetGrams: number;
  dryGrams: number;
  units: number;
  servingSize: number;
  mealsBreakdown: Array<{
    mealIndex: number;
    kcal: number;
    wetGrams: number;
    dryGrams: number;
    wetUnits: number;
  }>;
  // Keep legacy fields for backward compatibility
  breakfastKcal: number;
  dinnerKcal: number;
  breakfastWetGrams: number;
  breakfastDryGrams: number;
  dinnerWetGrams: number;
  dinnerDryGrams: number;
}

interface BoxSummary {
  totalDays: number;
  wetDaysCount: number;
  totalDER: number;
  totalDryGrams: number;
  totalWetGrams: number;
  unitsUsed: number;
  servingSize: number;
  unitsForCost?: number;
  planDuration?: string;
}

interface ActivityInfo {
  value: string;
  label: string;
  description: string;
  scientificNote: string;
  multiplier: number;
  examples: string[];
}

type Sex = 'male' | 'female'

type BreedRange = {
  male: [number, number];
  female: [number, number];
}

interface Results {
  rer: number;
  factor: number;
  der: number;
  weeklyData: WeeklyDay[];
  boxSummary: BoxSummary;
  activityInfo: ActivityInfo;
  weightStatus: 'low' | 'ok' | 'high' | 'na';
  weightRange: [number, number];
  idealWeight: number;
  usedWeight: number;
  bcsSuggested: number;
  bcsSuggestionReason: string;
  recommendations: string[];
}

interface Costs {
  dryCost: number;
  wetCost: number;
  treatCost: number;
  packagingCost: number;
  additionalCosts: number;
  subtotalCost: number;
  totalCostBeforeProfit: number;
  profitAmount: number;
  totalCostWithProfit: number;
  discountAmount: number;
  totalCostAfterDiscount: number;
  totalCostWithDelivery: number;
  deliveryCost: number;
  perDay: number;
}

// Box types configuration
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
  enabledDurations: Array<'week' | 'twoWeeks'>;
}

interface BoxTypeEditableConfig {
  id: string;
  label: string;
  includeWetFood: boolean;
  wetFoodBagsPerWeek: string;
  includeTreat: boolean;
  enabledDurations: Array<'week' | 'twoWeeks'>;
}

interface BoxVariant {
  duration: 'week' | 'twoWeeks';
  durationLabel: string;
  multiplier: number;
  packagingMultiplier: number; // For packaging cost calculation
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

// Activity levels aligned with WSAVA/NRC typical ranges
export const ACTIVITY_LEVELS: Record<string, ActivityInfo> = {
  low: {
    value: 'low',
    label: 'منخفض',
    description: 'نشاط قليل داخل المنزل',
    scientificNote: 'بالغ معقّم: ~1.2× RER (WSAVA/NRC)',
    multiplier: 1.2,
    examples: ['قطة هادئة', 'قليل اللعب'],
  },
  moderate: {
    value: 'moderate',
    label: 'متوسط',
    description: 'نشاط طبيعي متوازن',
    scientificNote: 'بالغ معقّم: ~1.4× RER (WSAVA/NRC)',
    multiplier: 1.4,
    examples: ['نشاط منزلي طبيعي', 'لعب يومي متوسط'],
  },
  high: {
    value: 'high',
    label: 'عالٍ',
    description: 'نشاط مرتفع/لعب كثيف',
    scientificNote: 'بالغ معقّم: ~1.8× RER (WSAVA/NRC)',
    multiplier: 1.8,
    examples: ['قطة نشيطة جدًا', 'خروج ولعب كثيف'],
  },
}

export const DEFAULT_RANGE: [number, number] = [3.0, 5.0]

export const BREED_WEIGHT_RANGES: Record<string, BreedRange> = {
  maine_coon: { male: [6.0, 11.0], female: [4.5, 8.0] },
  siamese: { male: [3.0, 5.0], female: [2.5, 4.5] },
  devon_rex: { male: [2.5, 4.0], female: [2.0, 3.5] },
  savannah: { male: [6.0, 13.0], female: [5.0, 10.0] },
  domestic_shorthair: { male: [3.5, 6.0], female: [3.0, 5.0] },
  domestic_longhair: { male: [3.5, 6.0], female: [3.0, 5.0] },
  egyptian_mau: { male: [3.0, 5.0], female: [2.5, 4.0] },
  egyptian_baladi: { male: [3.5, 6.0], female: [3.0, 5.0] },
  sphynx: { male: [3.5, 6.0], female: [3.0, 5.0] },
}

const DAY_NAMES_AR = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة']

// Box types configuration
export const BOX_TYPES: BoxTypeConfig[] = [
  {
    id: 'mimi',
    name: 'ميمي',
    description: 'البوكس الاقتصادي - دراي فود فقط مع تريت هدية',
    includeDryFood: true,
    includeWetFood: false,
    wetFoodBagsPerWeek: 0,
    includeTreat: true,
    enabledDurations: ['week', 'twoWeeks'],
  },
  {
    id: 'toty',
    name: 'توتي',
    description: 'دراي فود + ويت فود (كيس واحد لكل أسبوع) + تريت',
    includeDryFood: true,
    includeWetFood: true,
    wetFoodBagsPerWeek: 1,
    includeTreat: true,
    enabledDurations: ['week', 'twoWeeks'],
  },
  {
    id: 'qatqoot_azam',
    name: 'القطقوط الأعظم',
    description: 'دراي فود + ويت فود (كيسين لكل أسبوع) + تريت',
    includeDryFood: true,
    includeWetFood: true,
    wetFoodBagsPerWeek: 2,
    includeTreat: true,
    enabledDurations: ['week', 'twoWeeks'],
  },
  {
    id: 'qatqoot_azam_premium',
    name: 'القطقوط الأعظم - بريميم',
    description: 'دراي فود + ويت فود (3 أكياس لكل أسبوع) + تريت',
    includeDryFood: true,
    includeWetFood: true,
    wetFoodBagsPerWeek: 2,
    includeTreat: true,
    isPremium: true,
    premiumWetBagsPerWeek: 3,
    enabledDurations: ['week'],
  },
]

export const BOX_VARIANTS: BoxVariant[] = [
  {
    duration: 'week',
    durationLabel: 'أسبوع واحد',
    multiplier: 1,
    packagingMultiplier: 1,
  },
  {
    duration: 'twoWeeks',
    durationLabel: 'أسبوعين',
    multiplier: 2,
    packagingMultiplier: 1, // Packaging cost doesn't repeat for two weeks
  },
]

function toNumber(v: any, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : fallback
}

function formatNumber(n: number, digits = 0) {
  if (!Number.isFinite(n)) return '0'
  return n.toFixed(digits)
}

function round1(n: number) {
  return Math.round(n * 10) / 10
}

function suggestBCS(weight: number, minW: number, maxW: number, ideal: number, stage: CatData['lifeStage']): number {
  if (stage === 'kitten_young' || stage === 'kitten_older') return 5
  if (!Number.isFinite(weight) || ideal <= 0) return 5
  const dev = (weight - ideal) / ideal
  const abs = Math.abs(dev)
  if (abs < 0.05) return 5
  if (dev < 0) {
    if (abs < 0.10) return 4
    return 3
  } else {
    if (abs < 0.10) return 6
    if (abs < 0.20) return 7
    if (abs < 0.35) return 8
    return 9
  }
}

function ageToMonths(ageValue: string, unit: 'months'|'years'): number {
  const v = toNumber(ageValue, 0)
  return unit === 'years' ? v * 12 : v
}

function deriveLifeStage(ageMonths: number): CatData['lifeStage'] {
  if (ageMonths < 4) return 'kitten_young'
  if (ageMonths < 12) return 'kitten_older'
  if (ageMonths < 84) return 'adult' // < 7y
  return 'senior'
}

function getActivityInfo(activity: string): ActivityInfo {
  return ACTIVITY_LEVELS[activity] || ACTIVITY_LEVELS.moderate
}

function getBreedRange(breed: string, sex: Sex): [number, number] {
  const r = BREED_WEIGHT_RANGES[breed]
  if (!r) return DEFAULT_RANGE
  return r[sex]
}

// Enhanced: get breed range from full cat data, supporting mixed and other modes
function getBreedRangeForCat(cat: CatData): [number, number] {
  const mode = cat.breedMode || 'pure'
  if (mode === 'mixed') {
    const a = cat.breedMixA ? getBreedRange(cat.breedMixA, cat.sex) : getBreedRange(cat.breed, cat.sex)
    const b = cat.breedMixB ? getBreedRange(cat.breedMixB, cat.sex) : getBreedRange(cat.breed, cat.sex)
    const minW = (a[0] + b[0]) / 2
    const maxW = (a[1] + b[1]) / 2
    return [minW, maxW]
  }
  if (mode === 'other') {
    // If custom breed with no known range, fallback to default typical range
    return DEFAULT_RANGE
  }
  return getBreedRange(cat.breed, cat.sex)
}

export function useCatNutrition() {
  // State
  const [catData, setCatData] = useState<CatData>({
    name: '',
    clientName: '',
    clientPhone: '',
    clientAddress: '',
    ageValue: '',
    ageUnit: 'months',
    lifeStage: 'auto',
    weight: '',
    bcs: 5,
    sex: 'female',
    breed: 'domestic_shorthair',
    breedOther: '',
    breedMode: 'pure',
    breedMixA: '',
    breedMixB: '',
    neuter: 'neutered',
    activity: 'moderate',
    meals: 2,
    weightGoal: 'maintain',
    specialCond: 'none',
    pregWeek: 1,
    lacWeek: 1,
    lacKittens: 1,
    specialDetails: {},
  })

  // Defaults chosen to avoid spurious validation errors in tests
  const [foodData, setFoodData] = useState<FoodData>({
    dry100: '380',
    wetMode: 'per100',
    wet100: '80',
    wetKcalPerUnit: '85',
    wetUnitGrams: '85',
    wetPackType: 'pouch',
  })

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    wetDaysCount: 0,
    wetMealIndex: 1,
    wetDays: [false,false,false,false,false,false,false],
  })

  const [boxBuilder, setBoxBuilder] = useState<BoxBuilder>({
    boxType: 'monthly30',
    customDays: 30,
    safety: 0.0,
    boxWetMode: 'auto_total',
    boxSplitDays: 7,
    boxTotalUnits: 0,
  })

  const [boxTypeConfigs, setBoxTypeConfigs] = useState<BoxTypeConfig[]>(() => BOX_TYPES.map(box => ({ ...box })))
  const [boxTypeEditableConfigs, setBoxTypeEditableConfigs] = useState<BoxTypeEditableConfig[]>(() => BOX_TYPES.map(box => ({
    id: box.id,
    label: box.name,
    includeWetFood: box.includeWetFood,
    wetFoodBagsPerWeek: String(box.isPremium ? (box.premiumWetBagsPerWeek ?? box.wetFoodBagsPerWeek) : box.wetFoodBagsPerWeek),
    includeTreat: box.includeTreat,
    enabledDurations: [...box.enabledDurations],
  })))

  const [pricing, setPricing] = useState<Pricing>({
    currency: 'EGP',
    priceDryPerKg: '0',
    priceWetUnit: '0',
    treatPrice: '0',
    packagingCost: '0',
    packagingCosts: {
      week: '0',
      twoWeeks: '0',
      month: '0',
    },
    deliveryCost: '0',
    additionalCosts: '0',
    profitPercentage: '20',
    discountPercentage: '0',
    paidAmount: '0',
    boxContents: {
      mimi: 'دراي فود أساسي + تريت هدية',
      toty: 'دراي فود + ويت فود (كيس واحد/أسبوع) + تريت',
      qatqoot_azam: 'دراي فود + ويت فود (كيسين/أسبوع) + تريت',
      qatqoot_azam_premium: 'دراي فود + ويت فود (3 أكياس/أسبوع) + تريت بريميم',
    },
  })

  const [results, setResults] = useState<Results | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [costs, setCosts] = useState<Costs>({
    dryCost: 0,
    wetCost: 0,
    treatCost: 0,
    packagingCost: 0,
    additionalCosts: 0,
    subtotalCost: 0,
    totalCostBeforeProfit: 0,
    profitAmount: 0,
    totalCostWithProfit: 0,
    discountAmount: 0,
    totalCostAfterDiscount: 0,
    totalCostWithDelivery: 0,
    deliveryCost: 0,
    perDay: 0
  })
  const [isCalculating, setIsCalculating] = useState(false)

  const dayNames = DAY_NAMES_AR

  // Live BCS suggestion based on current inputs (advisory; UI remains manual)
  const bcsSuggestedLive = useMemo(() => {
    const weight = toNumber(catData.weight, NaN)
    if (!Number.isFinite(weight)) return catData.bcs
    const ageMonths = ageToMonths(catData.ageValue, catData.ageUnit)
    const stage = catData.lifeStage === 'auto' ? deriveLifeStage(ageMonths) : catData.lifeStage
    const [minW, maxW] = getBreedRangeForCat(catData)
    const idealWeight = (minW + maxW) / 2
    return suggestBCS(weight, minW, maxW, idealWeight, stage)
  }, [catData])

  // Live reason for suggested BCS
  const bcsSuggestionReasonLive = useMemo(() => {
    const weight = toNumber(catData.weight, NaN)
    const ageMonths = ageToMonths(catData.ageValue, catData.ageUnit)
    const stage = catData.lifeStage === 'auto' ? deriveLifeStage(ageMonths) : catData.lifeStage
    if (!Number.isFinite(weight)) return ''
    const [minW, maxW] = getBreedRangeForCat(catData)
    const idealWeight = (minW + maxW) / 2
    if (stage === 'kitten_young' || stage === 'kitten_older') {
      return 'عمر صغير: التوصية الافتراضية BCS = 5 لدعم النمو؛ يفضل التقييم البصري.'
    }
    if (idealWeight <= 0) return ''
    const dev = (weight - idealWeight) / idealWeight
    const perc = Math.round(Math.abs(dev) * 100)
    if (Math.abs(dev) < 0.05) {
      return `الوزن قريب من المثالي (±5%) — نطاق السلالة ${formatNumber(minW, 1)}–${formatNumber(maxW, 1)} كجم، المثالي ≈ ${formatNumber(idealWeight, 1)} كجم.`
    }
    if (dev > 0) {
      return `الوزن أعلى من المثالي بنسبة ≈ ${perc}% — نطاق السلالة ${formatNumber(minW, 1)}–${formatNumber(maxW, 1)} كجم، المثالي ≈ ${formatNumber(idealWeight, 1)} كجم.`
    }
    return `الوزن أقل من المثالي بنسبة ≈ ${perc}% — نطاق السلالة ${formatNumber(minW, 1)}–${formatNumber(maxW, 1)} كجم، المثالي ≈ ${formatNumber(idealWeight, 1)} كجم.`
  }, [catData])

  const handleCatDataChange = useCallback((key: keyof CatData, value: any) => {
    setCatData(prev => {
      const next: any = { ...prev }
      if (key === 'meals' || key === 'bcs' || key === 'pregWeek' || key === 'lacWeek' || key === 'lacKittens') {
        next[key] = toNumber(value, prev[key as any] as any)
      } else if (key === 'ageUnit' || key === 'lifeStage' || key === 'sex' || key === 'neuter' || key === 'activity' || key === 'weightGoal' || key === 'specialCond' || key === 'breed') {
        next[key] = value
      } else {
        next[key] = String(value)
      }
      return next
    })
  }, [])

  const handleFoodDataChange = useCallback((key: keyof FoodData, value: any) => {
    setFoodData(prev => ({ ...prev, [key]: String(value) }))
  }, [])

  const handleWeeklyPlanChange = useCallback((key: keyof WeeklyPlan, value: any) => {
    setWeeklyPlan(prev => {
      const next: WeeklyPlan = { ...prev }
      if (key === 'wetDaysCount') {
        const n = Math.max(0, Math.min(7, toNumber(value, 0)))
        next.wetDaysCount = n
        // Reset wetDays to first n days true
        next.wetDays = Array.from({ length: 7 }, (_, i) => i < n)
      } else if (key === 'wetMealIndex') {
        next.wetMealIndex = toNumber(value, prev.wetMealIndex)
      } else if (key === 'wetDays') {
        next.wetDays = Array.isArray(value) ? value.slice(0,7) : prev.wetDays
      }
      return next
    })
  }, [])

  const handleWetDayToggle = useCallback((dayIndex: number) => {
    setWeeklyPlan(prev => {
      const wetDays = prev.wetDays.slice()
      wetDays[dayIndex] = !wetDays[dayIndex]
      const wetDaysCount = wetDays.filter(Boolean).length
      return { ...prev, wetDays, wetDaysCount }
    })
  }, [])

  const autoDistributeWetDays = useCallback((count: number) => {
    const n = Math.max(0, Math.min(7, count))
    // Distribute roughly evenly
    const wetDays = Array(7).fill(false)
    if (n > 0) {
      const step = 7 / n
      for (let i=0;i<n;i++) wetDays[Math.floor(i * step)] = true
    }
    setWeeklyPlan(prev => ({ ...prev, wetDaysCount: n, wetDays }))
  }, [])

  const handleBoxBuilderChange = useCallback((key: keyof BoxBuilder, value: any) => {
    setBoxBuilder(prev => ({ ...prev, [key]: typeof value === 'number' ? value : String(value) }))
  }, [])

  const handlePricingChange = useCallback((key: keyof Pricing, value: any) => {
    setPricing(prev => {
      if (key === 'boxContents') {
        return {
          ...prev,
          [key]: { ...(value || {}) },
        }
      }
      if (key === 'packagingCosts') {
        const next = value || {}
        return {
          ...prev,
          packagingCosts: {
            week: String(next.week ?? prev.packagingCosts?.week ?? '0'),
            twoWeeks: String(next.twoWeeks ?? prev.packagingCosts?.twoWeeks ?? '0'),
            month: String(next.month ?? prev.packagingCosts?.month ?? '0'),
          },
        }
      }
      return { ...prev, [key]: String(value) }
    })
  }, [])

  const updateBoxTypeConfig = useCallback((boxId: string, updates: Partial<BoxTypeConfig>) => {
    setBoxTypeConfigs(prev => prev.map(box => {
      if (box.id !== boxId) return box
      const next: BoxTypeConfig = {
        ...box,
        ...updates,
      }
      if (updates.enabledDurations) {
        const unique = Array.from(new Set(updates.enabledDurations)) as Array<'week' | 'twoWeeks'>
        next.enabledDurations = unique.length ? unique : box.enabledDurations
      }
      return next
    }))
  }, [])

  const updateBoxTypeEditableConfig = useCallback((boxId: string, updates: Partial<BoxTypeEditableConfig>) => {
    setBoxTypeEditableConfigs(prev => prev.map(box => {
      if (box.id !== boxId) return box
      const next: BoxTypeEditableConfig = {
        ...box,
        ...updates,
      }
      if (updates.enabledDurations) {
        const unique = Array.from(new Set(updates.enabledDurations)) as Array<'week' | 'twoWeeks'>
        next.enabledDurations = unique
      }
      const wetBags = toNumber(next.wetFoodBagsPerWeek, boxTypeConfigs.find(b => b.id === boxId)?.wetFoodBagsPerWeek ?? 0)
      const includeWet = Boolean(next.includeWetFood)
      const includeTreat = Boolean(next.includeTreat)
      const enabledDurations = next.enabledDurations.length ? next.enabledDurations : (boxTypeConfigs.find(b => b.id === boxId)?.enabledDurations ?? ['week'])
      setBoxTypeConfigs(prevConfigs => prevConfigs.map(cfg => {
        if (cfg.id !== boxId) return cfg
        const isPremium = cfg.isPremium
        const baseUpdates: Partial<BoxTypeConfig> = {
          includeWetFood: includeWet,
          includeTreat,
          enabledDurations,
        }
        if (isPremium) {
          baseUpdates.premiumWetBagsPerWeek = wetBags
        } else {
          baseUpdates.wetFoodBagsPerWeek = wetBags
        }
        return {
          ...cfg,
          ...baseUpdates,
        }
      }))
      return next
    }))
  }, [])

  const updatePackagingCostByDuration = useCallback((duration: 'week' | 'twoWeeks' | 'month', value: any) => {
    setPricing(prev => ({
      ...prev,
      packagingCosts: {
        ...(prev.packagingCosts || { week: '0', twoWeeks: '0', month: '0' }),
        [duration]: String(value),
      },
    }))
  }, [])

  const updateBoxContent = useCallback((boxId: string, value: any) => {
    setPricing(prev => ({
      ...prev,
      boxContents: {
        ...prev.boxContents,
        [boxId]: String(value),
      },
    }))
  }, [])

  // Calculate box pricing for all types and variants
  const calculateBoxPricing = useCallback((results: Results): BoxPricing[] => {
    if (!results) return []

    const boxPricings: BoxPricing[] = []
    const priceDryPerKg = toNumber(pricing.priceDryPerKg, 0)
    const priceWetUnit = toNumber(pricing.priceWetUnit, 0)
    const treatPrice = toNumber(pricing.treatPrice, 0)
    const packagingCostFallback = toNumber(pricing.packagingCost, 0)
    const additionalCosts = toNumber(pricing.additionalCosts, 0)
    const deliveryCost = toNumber(pricing.deliveryCost, 0)
    const profitPercentage = toNumber(pricing.profitPercentage, 0)
    const discountPercentage = toNumber(pricing.discountPercentage, 0)

    for (const boxType of boxTypeConfigs) {
      for (const variant of BOX_VARIANTS) {
        if (boxType.enabledDurations && boxType.enabledDurations.length > 0 && !boxType.enabledDurations.includes(variant.duration)) {
          continue
        }
        // Skip premium variant for non-premium boxes
        if (boxType.id === 'qatqoot_azam_premium' && variant.duration === 'twoWeeks') {
          continue // Premium only available for one week
        }

        const totalDays = variant.duration === 'week' ? 7 : 14
        const weeks = totalDays / 7

        const packagingCostByVariant = (() => {
          if (variant.duration === 'twoWeeks') {
            return toNumber(pricing.packagingCosts?.twoWeeks, packagingCostFallback)
          }
          if (variant.duration === 'week') {
            return toNumber(pricing.packagingCosts?.week, packagingCostFallback)
          }
          return toNumber(pricing.packagingCosts?.month, packagingCostFallback)
        })()

        const packagingCostPerBox = packagingCostByVariant

        // Calculate dry food cost based on actual nutritional needs
        const totalDryGrams = results.boxSummary.totalDryGrams * (totalDays / results.boxSummary.totalDays)
        const dryCost = boxType.includeDryFood ? (totalDryGrams / 1000) * priceDryPerKg : 0

        // Calculate wet food cost based on box type configuration
        let wetCost = 0
        if (boxType.includeWetFood) {
          const wetBagsPerWeek = boxType.isPremium ? (boxType.premiumWetBagsPerWeek || boxType.wetFoodBagsPerWeek) : boxType.wetFoodBagsPerWeek
          const totalWetBags = wetBagsPerWeek * weeks
          wetCost = totalWetBags * priceWetUnit
        }

        // Calculate treat cost
        const treatCostTotal = boxType.includeTreat ? treatPrice * variant.multiplier : 0

        // Calculate packaging cost (doesn't repeat for two weeks)
        const packagingCostTotal = packagingCostPerBox * variant.packagingMultiplier

        // Calculate additional costs
        const additionalCostsTotal = additionalCosts * variant.multiplier

        // Calculate totals
        const subtotalCost = dryCost + wetCost + treatCostTotal
        const totalCostBeforeProfit = subtotalCost + packagingCostTotal + additionalCostsTotal
        const profitAmount = (totalCostBeforeProfit * profitPercentage) / 100
        const totalCostWithProfit = totalCostBeforeProfit + profitAmount
        const discountAmount = (totalCostWithProfit * discountPercentage) / 100
        const totalCostAfterDiscount = totalCostWithProfit - discountAmount
        const totalCostWithDelivery = totalCostAfterDiscount + deliveryCost
        const perDay = totalDays > 0 ? (totalCostWithDelivery / totalDays) : 0

        boxPricings.push({
          boxType,
          variant,
          costs: {
            dryCost,
            wetCost,
            treatCost: treatCostTotal,
            packagingCost: packagingCostTotal,
            additionalCosts: additionalCostsTotal,
            totalCostBeforeProfit,
            profitAmount,
            totalCostWithProfit,
            discountAmount,
            totalCostAfterDiscount,
            totalCostWithDelivery,
            deliveryCost,
            perDay,
          },
        })
      }
    }

    return boxPricings
  }, [pricing, boxTypeConfigs])

  const calcRER = useCallback((weightKg: number) => {
    // NRC 2006 - Chapter 2: Energy Requirements
    return 70 * Math.pow(weightKg, 0.75)
  }, [])

  function computePregnancyFactor(week: number): number {
    if (week <= 0) return 1.1
    if (week <= 4) return 1.1
    if (week <= 6) return 1.3
    return 1.6 // 7-9
  }

  function computeLactationFactor(week: number, kittens: number): number {
    // Peak weeks 3-4 around 3.0×, adjust by litter size, clamp 2.0–4.0
    let base = 2.0
    if (week === 2) base = 2.5
    else if (week === 3 || week === 4) base = 3.0
    else if (week === 5) base = 2.5
    else base = 2.0
    const adj = Math.max(0, kittens) * 0.1
    const f = base + adj
    return Math.max(2.0, Math.min(4.0, f))
  }

  function computeCKDFactor(stage?: number): number {
    if (!stage) return 1.0
    if (stage === 1) return 1.0
    if (stage === 2) return 0.9
    if (stage === 3) return 0.8
    if (stage >= 4) return 0.8 // Safer minimum vs. overly low energy
    return 1.0
  }

  function computeFactor(rer: number, stage: CatData['lifeStage'], activity: ActivityInfo, cat: CatData): number {
    // Base factor
    let factor = 1.0

    // Special conditions with primary override
    if (cat.specialCond === 'pregnant' && cat.sex === 'female') {
      factor = computePregnancyFactor(cat.pregWeek)
    } else if (cat.specialCond === 'lactating' && cat.sex === 'female') {
      factor = computeLactationFactor(cat.lacWeek, cat.lacKittens)
    } else if (cat.specialCond === 'ckd') {
      // Override to CKD factor (IRIS-aligned, with safe minimum)
      const st = toNumber(cat.specialDetails?.ckdStage, 2)
      factor = computeCKDFactor(st)
    } else {
      // Life-stage base
      if (stage === 'kitten_young') {
        factor = 2.5 * activity.multiplier
      } else if (stage === 'kitten_older') {
        factor = 2.0 * activity.multiplier
      } else {
        factor = activity.multiplier
        if (cat.neuter === 'intact') factor *= 1.1 // +10% for intact adults (NRC/clinical practice)
      }

      // Breed metabolic adjustment (apply for adult/senior only)
      if ((stage === 'adult' || stage === 'senior') && cat.breed === 'sphynx') {
        factor *= 1.15
      }

      // BCS adjustment (WSAVA 2011) for adult/senior
      if (stage === 'adult' || stage === 'senior') {
        if (cat.bcs < 5) factor *= 1.1
        else if (cat.bcs > 5) factor *= 0.9
      }

      // Weight goal (AAFP 2014) for adult/senior
      if (stage === 'adult' || stage === 'senior') {
        if (cat.weightGoal === 'loss') factor *= 0.8
        else if (cat.weightGoal === 'gain') factor *= 1.4
      }

      // Medical conditions (multiplicative)
      if (cat.specialCond === 'hyperthyroid') {
        const treated = !!cat.specialDetails?.hyperthyroidTreated
        factor *= treated ? 1.0 : 1.3
      }
      if (cat.specialCond === 'diabetes') {
        const controlled = !!cat.specialDetails?.diabetesControlled
        factor *= controlled ? 1.0 : 1.1
      }
      if (cat.specialCond === 'recovery') {
        const w = toNumber(cat.specialDetails?.recoveryWeeks, 2)
        factor *= w <= 2 ? 1.3 : 1.1
      }
      // CKD handled as override earlier
      // Cardiac: do not auto-reduce energy; prioritize composition (Na, taurine, omega-3)
    }
    return factor
  }

  const calculateNutrition = useCallback(() => {
    setIsCalculating(true)
    try {
      const newErrors: string[] = []
      const recommendations: string[] = []
      const weight = toNumber(catData.weight, NaN)

      // Basic validations
      if (!Number.isFinite(weight)) newErrors.push('الرجاء إدخال الوزن (كجم)')
      if (Number.isFinite(weight) && (weight < 0.5 || weight > 25)) newErrors.push('الوزن يجب أن يكون بين 0.5 و 25 كجم')

      const meals = toNumber(catData.meals, 0)
      if (meals < 1 || meals > 6) newErrors.push('عدد الوجبات يجب أن يكون بين 1 و 6')

      // Pregnancy/Lactation constraints
      const ageMonths = ageToMonths(catData.ageValue, catData.ageUnit)
      const isBreedingAge = ageMonths >= 8
      if (catData.specialCond === 'pregnant') {
        if (catData.sex !== 'female') {
          newErrors.push('الحمل غير ممكن للذكور')
        } else if (!isBreedingAge) {
          newErrors.push('الحمل/الرضاعة عادة بعد سن 8 أشهر')
        }
      }
      if (catData.specialCond === 'lactating') {
        if (catData.sex !== 'female') {
          newErrors.push('الحمل غير ممكن للذكور')
        }
        if (catData.lacKittens < 1 || catData.lacKittens > 8) {
          newErrors.push('عدد الصغار عادة 1-8')
        }
      }
      if (catData.specialCond === 'ckd' && ageMonths < 60) {
        newErrors.push('CKD نادر في القطط تحت 5 سنوات')
      }
      if (catData.specialCond === 'none' && ageMonths >= 144) {
        newErrors.push('قطة كبيرة سنًا (12+ سنة)')
      }

      // Food validations (only if explicitly set out of range)
      const dry100 = toNumber(foodData.dry100, NaN)
      if (foodData.dry100 === '') {
        newErrors.push('الرجاء إدخال سعرات الدراي')
      } else if (Number.isFinite(dry100) && (dry100 < 200 || dry100 > 600)) {
        newErrors.push('سعرات الدراي يجب أن تكون بين 200 و 600')
      }

      // Breed validations for mixed/custom modes
      if ((catData.breedMode || 'pure') === 'mixed') {
        if (!catData.breedMixA || !catData.breedMixB) {
          newErrors.push('الرجاء اختيار السلالة الأولى والثانية عند اختيار خليط')
        }
      }
      if (catData.breedMode === 'other') {
        if (!catData.breedOther || !String(catData.breedOther).trim()) {
          newErrors.push('الرجاء كتابة اسم السلالة (مخصص)')
        }
      }

      // Fatal error: impossible pregnancy (male)
      if (newErrors.includes('الحمل غير ممكن للذكور')) {
        setErrors(Array.from(new Set(newErrors)))
        setResults(null)
        return
      }

      if (!Number.isFinite(weight)) {
        setErrors(Array.from(new Set(newErrors)))
        setResults(null)
        return
      }

      // Derive life stage
      const stage = catData.lifeStage === 'auto' ? deriveLifeStage(ageMonths) : catData.lifeStage
      const activityInfo = getActivityInfo(catData.activity)

      const rerRaw = calcRER(weight)
      // Breed range & ideal weight (supports pure/mixed/other)
      const [minW, maxW] = getBreedRangeForCat(catData)
      const idealWeight = (minW + maxW) / 2
      const bcsSuggested = suggestBCS(weight, minW, maxW, idealWeight, stage)
      // Use user's chosen BCS for factor; suggestion is advisory only
      const factor = computeFactor(rerRaw, stage, activityInfo, catData)
      const rer = round1(rerRaw)
      const der = round1(rer * factor)
      let weightStatus: Results['weightStatus'] = 'ok'
      if (stage === 'kitten_young' || stage === 'kitten_older') {
        weightStatus = 'na'
      } else {
        if (weight < minW) weightStatus = 'low'
        else if (weight > maxW) weightStatus = 'high'
      }

      // Weight goal conflicts vs. IDEAL (not just range)
      if ((stage === 'adult' || stage === 'senior')) {
        if (catData.weightGoal === 'loss' && weight < idealWeight) {
          newErrors.push('لا يمكن اختيار نظام تخسيس والوزن الحالي أقل من المثالي')
        }
        if (catData.weightGoal === 'gain' && weight > idealWeight) {
          newErrors.push('لا يمكن اختيار نظام تسمين والوزن الحالي أعلى من المثالي')
        }
      }

      // Weekly data
      // If wet day:
      //  - perUnit: default 1 wet unit per wet day (capped by DER) and distribute between meals to equalize kcal.
      //  - per100: target 25% DER from wet but cap grams to unit size; then distribute between meals to equalize kcal.
      const wetDays = weeklyPlan.wetDays
      const wetShare = 0.25
      const wetKcalPer100 = toNumber(foodData.wet100, 80)
      const wetKcalPerUnit = toNumber(foodData.wetKcalPerUnit, 85)
      const wetUnitGrams = toNumber(foodData.wetUnitGrams, 85)

      const dailyData: WeeklyDay[] = dayNames.map((d, i) => {
        const isWet = Boolean(wetDays[i])
        let wetKcal = 0
        let wetGrams = 0
        let units = 0
        if (isWet) {
          if (foodData.wetMode === 'perUnit') {
            // Default to 1 wet unit per wet day; cap to DER to avoid overfeeding
            units = 1
            const kcal = units * Math.max(1, wetKcalPerUnit)
            wetKcal = Math.min(kcal, der)
            // compute grams proportionally if capped
            const kcalPerGram = Math.max(1, wetKcalPerUnit) / Math.max(1, wetUnitGrams)
            wetGrams = wetKcal / kcalPerGram
          } else {
            const targetWetKcal = der * wetShare
            const targetWetGrams = (targetWetKcal / Math.max(1, wetKcalPer100)) * 100
            const cap = wetUnitGrams > 0 ? wetUnitGrams : targetWetGrams
            wetGrams = Math.min(targetWetGrams, cap)
            wetKcal = (wetGrams * Math.max(1, wetKcalPer100)) / 100
            if (wetKcal > der) {
              wetKcal = der
              wetGrams = (wetKcal / Math.max(1, wetKcalPer100)) * 100
            }
          }
        }

        // Distribute energy across the selected number of meals
        const mealsCount = Math.max(1, toNumber(catData.meals, 2))
        const perMealTarget = der / mealsCount
        const wetKcalPerMeal = Array.from({ length: mealsCount }, () => 0)
        if (isWet) {
          const idxInput = toNumber(weeklyPlan.wetMealIndex, 1)
          const idx = Math.max(0, Math.min(mealsCount - 1, idxInput - 1))
          let remainingWet = wetKcal
          // allocate to selected meal first
          const allocFirst = Math.min(perMealTarget, remainingWet)
          wetKcalPerMeal[idx] = allocFirst
          remainingWet -= allocFirst
          // allocate remainder to other meals to keep meals equal
          for (let k = 0; k < mealsCount && remainingWet > 0; k++) {
            if (k === idx) continue
            const alloc = Math.min(perMealTarget, remainingWet)
            wetKcalPerMeal[k] = alloc
            remainingWet -= alloc
          }
        }
        const dryKcalPerMeal = wetKcalPerMeal.map(wk => Math.max(0, perMealTarget - wk))

        const breakfastWetKcal = wetKcalPerMeal[0] || 0
        const dinnerWetKcal = wetKcalPerMeal[1] || 0

        const breakfastDryKcal = (dryKcalPerMeal[0] ?? Math.max(0, perMealTarget - breakfastWetKcal))
        const dinnerDryKcal = (dryKcalPerMeal[1] ?? Math.max(0, perMealTarget - dinnerWetKcal))

        // Per-meal grams and totals (ensure sums match displayed values)
        const dryGramsPerKcal = 100 / Math.max(1, dry100)
        const breakfastDryGramsRaw = breakfastDryKcal * dryGramsPerKcal
        const dinnerDryGramsRaw = dinnerDryKcal * dryGramsPerKcal
        const otherDryGramsRaw = dryKcalPerMeal.slice(2).reduce((s, v) => s + v * dryGramsPerKcal, 0)
        const wetKcalPerGram = foodData.wetMode === 'per100'
          ? Math.max(1, wetKcalPer100) / 100
          : Math.max(1, wetKcalPerUnit) / Math.max(1, wetUnitGrams)
        const breakfastWetGramsRaw = breakfastWetKcal / Math.max(1e-6, wetKcalPerGram)
        const dinnerWetGramsRaw = dinnerWetKcal / Math.max(1e-6, wetKcalPerGram)
        const otherWetGramsRaw = wetKcalPerMeal.slice(2).reduce((s, v) => s + (v / Math.max(1e-6, wetKcalPerGram)), 0)

        const breakfastDryGrams = Math.round(breakfastDryGramsRaw)
        const dinnerDryGrams = Math.round(dinnerDryGramsRaw)
        const othersDryGrams = Math.round(otherDryGramsRaw)
        const breakfastWetGrams = Math.round(breakfastWetGramsRaw)
        const dinnerWetGrams = Math.round(dinnerWetGramsRaw)
        const othersWetGrams = Math.round(otherWetGramsRaw)

        // Totals
        const dryKcal = Math.max(0, dryKcalPerMeal.reduce((s, v) => s + v, 0))
        const dryGrams = Math.round(breakfastDryGrams + dinnerDryGrams + othersDryGrams)
        const wetKcalTotal = Math.max(0, wetKcalPerMeal.reduce((s, v) => s + v, 0))
        const wetGramsTotal = Math.round(breakfastWetGrams + dinnerWetGrams + othersWetGrams)
        
        // Compute units for the day (fallback to grams -> units when per100 mode)
        let dayUnits = units
        if (foodData.wetMode !== 'perUnit' && wetUnitGrams > 0 && wetGramsTotal > 0) {
          dayUnits = wetGramsTotal / wetUnitGrams
        }

        // Create meals breakdown for all meals
        const mealsBreakdown = wetKcalPerMeal.map((wetKcal, idx) => {
          const dryKcal = dryKcalPerMeal[idx] || 0
          const wetGramsForMeal = wetKcal / Math.max(1e-6, wetKcalPerGram)
          const dryGramsForMeal = dryKcal * dryGramsPerKcal
          
          // Calculate units for this meal
          let wetUnitsForMeal = 0
          if (wetGramsForMeal > 0 && wetUnitGrams > 0) {
            wetUnitsForMeal = wetGramsForMeal / wetUnitGrams
          }
          
          return {
            mealIndex: idx + 1,
            kcal: round1(perMealTarget),
            wetGrams: Math.round(wetGramsForMeal),
            dryGrams: Math.round(dryGramsForMeal),
            wetUnits: Math.round(wetUnitsForMeal * 100) / 100
          }
        })
        
        return {
          day: d,
          type: isWet ? 'wet' : 'dry',
          der: round1(der),
          wetKcal: round1(wetKcalTotal),
          dryKcal: round1(dryKcal),
          wetGrams: round1(wetGramsTotal),
          dryGrams: round1(dryGrams),
          units: Math.round(dayUnits * 100) / 100,
          servingSize: wetUnitGrams,
          mealsBreakdown,
          // Legacy fields for backward compatibility
          breakfastKcal: round1(perMealTarget),
          dinnerKcal: round1(perMealTarget),
          breakfastWetGrams: round1(breakfastWetGrams),
          breakfastDryGrams: round1(breakfastDryGrams),
          dinnerWetGrams: round1(dinnerWetGrams),
          dinnerDryGrams: round1(dinnerDryGrams),
        }
      })

      // Box summary
      let totalDays = 30
      if (boxBuilder.boxType === 'weekly') totalDays = 7
      else if (boxBuilder.boxType === 'custom') totalDays = boxBuilder.customDays > 0 ? boxBuilder.customDays : 30

      // Compute totals using full weeks + remainder days (avoid overestimation for partial weeks)
      const fullWeeks = Math.floor(totalDays / 7)
      const remainderDaysCount = totalDays % 7

      // Per-week sums
      const weekUnitsSum = dailyData.reduce((s, d) => s + d.units, 0)
      const weekDryGramsSum = dailyData.reduce((s, d) => s + d.dryGrams, 0)
      const weekWetGramsSum = dailyData.reduce((s, d) => s + d.wetGrams, 0)

      // Remainder (first N days of the week)
      const remUnitsSum = remainderDaysCount > 0 ? dailyData.slice(0, remainderDaysCount).reduce((s, d) => s + d.units, 0) : 0
      const remDryGramsSum = remainderDaysCount > 0 ? dailyData.slice(0, remainderDaysCount).reduce((s, d) => s + d.dryGrams, 0) : 0
      const remWetGramsSum = remainderDaysCount > 0 ? dailyData.slice(0, remainderDaysCount).reduce((s, d) => s + d.wetGrams, 0) : 0

      // Units used (ceil to whole units by business rule)
      let unitsUsed = Math.ceil(weekUnitsSum * fullWeeks + remUnitsSum)
      if (boxBuilder.boxWetMode === 'fixed_total') {
        unitsUsed = Math.max(0, Math.floor(boxBuilder.boxTotalUnits))
      }

      const totalDryGrams = weekDryGramsSum * fullWeeks + remDryGramsSum
      const totalWetGrams = weekWetGramsSum * fullWeeks + remWetGramsSum
      const totalDER = Math.round(der * totalDays)

      // Compute wet days count over the entire box
      const weekWetDays = weeklyPlan.wetDays.filter(Boolean).length
      const remainderWetDays = remainderDaysCount > 0
        ? weeklyPlan.wetDays.slice(0, remainderDaysCount).filter(Boolean).length
        : 0
      const wetDaysCountBox = (weekWetDays * fullWeeks) + remainderWetDays

      // Determine plan duration description
      let planDuration = ''
      if (boxBuilder.boxType === 'weekly') {
        planDuration = 'أسبوعي (7 أيام)'
      } else if (boxBuilder.boxType === 'monthly30') {
        planDuration = 'شهري (30 يوم)'
      } else if (boxBuilder.boxType === 'custom') {
        planDuration = `مخصص (${totalDays} يوم)`
      }

      const summary: BoxSummary = {
        totalDays,
        wetDaysCount: wetDaysCountBox,
        totalDER,
        totalDryGrams,
        totalWetGrams,
        unitsUsed,
        servingSize: wetUnitGrams,
        unitsForCost: unitsUsed,
        planDuration,
      }

      // Build BCS suggestion reason (final after calculation)
      let bcsSuggestionReason = ''
      if (stage === 'kitten_young' || stage === 'kitten_older') {
        bcsSuggestionReason = 'عمر صغير: التوصية الافتراضية BCS = 5 لدعم النمو؛ يفضل التقييم البصري.'
      } else if (idealWeight > 0) {
        const dev = (weight - idealWeight) / idealWeight
        const perc = Math.round(Math.abs(dev) * 100)
        if (Math.abs(dev) < 0.05) {
          bcsSuggestionReason = `الوزن قريب من المثالي (±5%) — نطاق السلالة ${formatNumber(minW, 1)}–${formatNumber(maxW, 1)} كجم، المثالي ≈ ${formatNumber(idealWeight, 1)} كجم.`
        } else if (dev > 0) {
          bcsSuggestionReason = `الوزن أعلى من المثالي بنسبة ≈ ${perc}% — نطاق السلالة ${formatNumber(minW, 1)}–${formatNumber(maxW, 1)} كجم، المثالي ≈ ${formatNumber(idealWeight, 1)} كجم.`
        } else {
          bcsSuggestionReason = `الوزن أقل من المثالي بنسبة ≈ ${perc}% — نطاق السلالة ${formatNumber(minW, 1)}–${formatNumber(maxW, 1)} كجم، المثالي ≈ ${formatNumber(idealWeight, 1)} كجم.`
        }
      }

      setResults({
        rer,
        factor,
        der,
        weeklyData: dailyData,
        boxSummary: summary,
        activityInfo,
        weightStatus,
        weightRange: [minW, maxW],
        idealWeight,
        usedWeight: weight,
        bcsSuggested,
        bcsSuggestionReason,
        recommendations,
      })

      // Costs calculation
      const priceDryPerKg = toNumber(pricing.priceDryPerKg, 0)
      const priceWetUnit = toNumber(pricing.priceWetUnit, 0)
      const packagingCost = (() => {
        const fallback = toNumber(pricing.packagingCost, 0)
        const costsByDuration = pricing.packagingCosts || { week: '0', twoWeeks: '0', month: '0' }
        if (totalDays <= 7) return toNumber(costsByDuration.week, fallback)
        if (totalDays <= 14) return toNumber(costsByDuration.twoWeeks, fallback)
        return toNumber(costsByDuration.month, fallback)
      })()
      const additionalCosts = toNumber(pricing.additionalCosts, 0)
      const deliveryCost = toNumber(pricing.deliveryCost, 0)
      const profitPercentage = toNumber(pricing.profitPercentage, 0)
      const discountPercentage = toNumber(pricing.discountPercentage, 0)
      
      const totalDryKg = totalDryGrams / 1000
      const dryCost = totalDryKg * priceDryPerKg
      const wetCost = unitsUsed * priceWetUnit
      const subtotalCost = dryCost + wetCost
      const totalCostBeforeProfit = subtotalCost + packagingCost + additionalCosts
      const profitAmount = (totalCostBeforeProfit * profitPercentage) / 100
      const totalCostWithProfit = totalCostBeforeProfit + profitAmount
      const discountAmount = (totalCostWithProfit * discountPercentage) / 100
      const totalCostAfterDiscount = totalCostWithProfit - discountAmount
      const totalCostWithDelivery = totalCostAfterDiscount + deliveryCost
      
      setCosts({
        dryCost,
        wetCost,
        treatCost: 0, // Will be calculated based on box type
        packagingCost,
        additionalCosts,
        subtotalCost,
        totalCostBeforeProfit,
        profitAmount,
        totalCostWithProfit,
        discountAmount,
        totalCostAfterDiscount,
        totalCostWithDelivery,
        deliveryCost,
        perDay: totalDays > 0 ? (totalCostWithDelivery / totalDays) : 0
      })

      setErrors(Array.from(new Set(newErrors)))
    } finally {
      setIsCalculating(false)
    }
  }, [catData, foodData, weeklyPlan, boxBuilder, pricing, dayNames, calcRER])

  return {
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
    boxTypeConfigs,
    boxTypeEditableConfigs,
    updateBoxTypeEditableConfig,
    updatePackagingCostByDuration,
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
  }
}
