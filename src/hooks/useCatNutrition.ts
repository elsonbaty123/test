'use client'

import { useState, useCallback } from 'react'

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
}

interface Pricing {
  currency: string;
  priceDryPerKg: string;
  priceWetUnit: string;
  packagingCost: string;
  deliveryCost: string;
  additionalCosts: string;
  profitPercentage: string;
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
  recommendations: string[];
}

interface Costs {
  dryCost: number;
  wetCost: number;
  packagingCost: number;
  additionalCosts: number;
  subtotalCost: number;
  totalCostBeforeProfit: number;
  profitAmount: number;
  totalCostWithProfit: number;
  totalCostWithDelivery: number;
  deliveryCost: number;
  perDay: number;
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

  const [pricing, setPricing] = useState<Pricing>({
    currency: 'EGP',
    priceDryPerKg: '0',
    priceWetUnit: '0',
    packagingCost: '0',
    deliveryCost: '0',
    additionalCosts: '0',
    profitPercentage: '20',
  })

  const [results, setResults] = useState<Results | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [costs, setCosts] = useState<Costs>({
    dryCost: 0,
    wetCost: 0,
    packagingCost: 0,
    additionalCosts: 0,
    subtotalCost: 0,
    totalCostBeforeProfit: 0,
    profitAmount: 0,
    totalCostWithProfit: 0,
    totalCostWithDelivery: 0,
    deliveryCost: 0,
    perDay: 0
  })
  const [isCalculating, setIsCalculating] = useState(false)

  const dayNames = DAY_NAMES_AR

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
    setPricing(prev => ({ ...prev, [key]: String(value) }))
  }, [])

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
      // Breed range & ideal weight
      const [minW, maxW] = getBreedRange(catData.breed, catData.sex)
      const idealWeight = (minW + maxW) / 2
      const bcsSuggested = suggestBCS(weight, minW, maxW, idealWeight, stage)
      const catForFactor = { ...catData, bcs: bcsSuggested }
      const factor = computeFactor(rerRaw, stage, activityInfo, catForFactor)
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
          units: Math.round(units * 100) / 100,
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

      const weekWetUnits = dailyData.reduce((s, d) => s + d.units, 0)
      const weeksInBox = Math.ceil(totalDays / 7)
      let unitsUsed = Math.round(weekWetUnits * weeksInBox)
      if (boxBuilder.boxWetMode === 'fixed_total') {
        unitsUsed = Math.max(0, Math.floor(boxBuilder.boxTotalUnits))
      }

      const totalDryGrams = dailyData.reduce((s, d) => s + d.dryGrams, 0) * weeksInBox
      const totalWetGrams = dailyData.reduce((s, d) => s + d.wetGrams, 0) * weeksInBox
      const totalDER = Math.round(der * totalDays)

      const summary: BoxSummary = {
        totalDays,
        wetDaysCount: weeklyPlan.wetDaysCount,
        totalDER,
        totalDryGrams,
        totalWetGrams,
        unitsUsed,
        servingSize: wetUnitGrams,
        unitsForCost: unitsUsed,
      }

      // Auto-assign BCS recommendation and update state to reflect it
      if ((stage === 'adult' || stage === 'senior') && catData.bcs !== bcsSuggested) {
        recommendations.push(`تم اختيار BCS تلقائيًا بقيمة ${bcsSuggested} استنادًا إلى الانحراف عن الوزن المثالي للسلالة.`)
        setCatData(prev => ({ ...prev, bcs: bcsSuggested }))
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
        recommendations,
      })

      // Costs calculation
      const priceDryPerKg = toNumber(pricing.priceDryPerKg, 0)
      const priceWetUnit = toNumber(pricing.priceWetUnit, 0)
      const packagingCost = toNumber(pricing.packagingCost, 0)
      const additionalCosts = toNumber(pricing.additionalCosts, 0)
      const deliveryCost = toNumber(pricing.deliveryCost, 0)
      const profitPercentage = toNumber(pricing.profitPercentage, 0)
      
      const totalDryKg = totalDryGrams / 1000
      const dryCost = totalDryKg * priceDryPerKg
      const wetCost = unitsUsed * priceWetUnit
      const subtotalCost = dryCost + wetCost
      const totalCostBeforeProfit = subtotalCost + packagingCost + additionalCosts
      const profitAmount = (totalCostBeforeProfit * profitPercentage) / 100
      const totalCostWithProfit = totalCostBeforeProfit + profitAmount
      const totalCostWithDelivery = totalCostWithProfit + deliveryCost
      
      setCosts({
        dryCost,
        wetCost,
        packagingCost,
        additionalCosts,
        subtotalCost,
        totalCostBeforeProfit,
        profitAmount,
        totalCostWithProfit,
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
    formatNumber,
  }
}
