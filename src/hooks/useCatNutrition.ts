'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'

interface CatData {
  name: string;
  ageValue: string;
  ageUnit: 'months' | 'years';
  lifeStage: 'auto' | 'kitten_young' | 'kitten_older' | 'adult' | 'senior';
  weight: string;
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
}

interface BoxSummary {
  totalDays: number;
  wetDaysCount: number;
  totalDER: number;
  totalDryGrams: number;
  totalWetGrams: number;
  unitsUsed: number;
  unitsForCost: number;
  servingSize: number;
}

interface Results {
  rer: number;
  factor: number;
  der: number;
  usedWeight: number;
  weightStatus: 'low' | 'high' | 'ok' | 'na';
  idealWeight: number;
  weightRange: number[];
  weeklyData: WeeklyDay[];
  activityInfo: ActivityLevel;
  boxSummary: BoxSummary;
}

interface ActivityLevel {
  value: string;
  label: string;
  description: string;
  scientificNote: string;
  examples: string[];
  merFactor: number;
}

export function useCatNutrition() {
  const [catData, setCatData] = useState<CatData>({
    name: '',
    ageValue: '',
    ageUnit: 'months',
    lifeStage: 'auto',
    weight: '',
    sex: 'female',
    breed: 'domestic_shorthair',
    breedOther: '',
    neuter: 'neutered',
    activity: 'moderate',
    meals: 2,
    weightGoal: 'maintain',
    specialCond: 'none',
    pregWeek: 8,
    lacWeek: 3,
    lacKittens: 4,
    specialDetails: {},
  })

  const [foodData, setFoodData] = useState<FoodData>({
    dry100: '',
    wetMode: 'per100',
    wet100: '',
    wetKcalPerUnit: '',
    wetUnitGrams: '',
    wetPackType: 'pouch',
  })

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    wetDaysCount: 2,
    wetMealIndex: 1,
    wetDays: [false, false, true, true, false, false, false],
  })

  const [boxBuilder, setBoxBuilder] = useState<BoxBuilder>({
    boxType: 'monthly30',
    customDays: 30,
    safety: 0,
    boxWetMode: 'auto_total',
    boxSplitDays: 3,
    boxTotalUnits: 0,
  })

  const [pricing, setPricing] = useState<Pricing>({
    currency: 'ج.م',
    priceDryPerKg: '',
    priceWetUnit: '',
  })

  const [results, setResults] = useState<Results | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [costs, setCosts] = useState({ dryCost: 0, wetCost: 0, totalCost: 0 })
  const [isCalculating, setIsCalculating] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const dayNames = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"] as const

  const BREED_WEIGHT_RANGES = useMemo(() => ({
    domestic_shorthair: { male: [3.5, 6.0], female: [3.0, 5.0] },
    domestic_longhair: { male: [3.5, 6.0], female: [3.0, 5.0] },
    persian: { male: [4.0, 6.5], female: [3.0, 5.0] },
    british_shorthair: { male: [5.0, 8.0], female: [4.0, 7.0] },
    maine_coon: { male: [6.0, 11.0], female: [4.5, 8.0] },
    ragdoll: { male: [6.0, 9.0], female: [4.5, 7.5] },
    siamese: { male: [4.0, 6.0], female: [2.5, 4.5] },
    bengal: { male: [5.0, 7.0], female: [4.0, 6.0] },
    sphynx: { male: [3.5, 6.0], female: [3.0, 5.0] },
    scottish_fold: { male: [4.0, 6.5], female: [3.0, 5.0] },
    norwegian_forest: { male: [5.0, 9.0], female: [4.0, 7.0] },
    american_shorthair: { male: [4.5, 7.0], female: [3.5, 6.0] },
    abyssinian: { male: [3.5, 5.0], female: [3.0, 4.5] },
    turkish_angora: { male: [3.5, 5.5], female: [3.0, 4.5] },
    russian_blue: { male: [4.0, 6.5], female: [3.0, 5.0] },
    oriental: { male: [3.5, 5.0], female: [2.5, 4.5] }
  }), [])

  const DEFAULT_RANGE = useMemo(() => ({ male: [4.0, 6.5], female: [3.0, 5.5] }), [])

  const ACTIVITY_LEVELS = useMemo((): Record<string, ActivityLevel> => ({
    low: {
      value: 'low',
      label: 'منخفض (قلة الحركة)',
      description: 'قطة منزلية تتحرك قليلاً، معظم وقتها نائمة أو جالسة',
      scientificNote: 'القطط المنزلية ذات النشاط المنخفض تحتاج إلى 60-80 كيلو كالوري لكل كجم من وزن الجسم يومياً',
      examples: ['قطط مسنة', 'قطط ذات أمراض مزمنة', 'قطط تفضل النوم معظم الوقت'],
      merFactor: 0.8
    },
    moderate_low: {
      value: 'moderate_low',
      label: 'منخفض إلى متوسط',
      description: 'قطة منزلية تتحرك بشكل معتدل، تلعب لفترات قصيرة',
      scientificNote: 'القطط ذات النشاط المنخفض إلى المتوسط تحتاج إلى 80-90 كيلو كالوري لكل كجم من وزن الجسم يومياً',
      examples: ['قطط شابة قليلة النشاط', 'قطط تتحرك في المنزل بشكل منتظم'],
      merFactor: 1.0
    },
    moderate: {
      value: 'moderate',
      label: 'متوسط (نشاط عادي)',
      description: 'قطة منزلية نشطة، تلعب يومياً وتستكشف بيئتها',
      scientificNote: 'القطط ذات النشاط المتوسط تحتاج إلى 90-100 كيلو كالوري لكل كجم من وزن الجسم يومياً (NRC 2006)',
      examples: ['معظم القطط المنزلية الصحية', 'قطط تلعب بانتظام'],
      merFactor: 1.2
    },
    moderate_high: {
      value: 'moderate_high',
      label: 'متوسط إلى عالٍ',
      description: 'قطة نشطة جداً، تلعب لساعات وتقفز كثيراً',
      scientificNote: 'القطط ذات النشاط المتوسط إلى العالي تحتاج إلى 100-120 كيلو كالوري لكل كجم من وزن الجسم يومياً',
      examples: ['قطط شابة جداً', 'قطط تملك مساحة كبيرة للحركة'],
      merFactor: 1.4
    },
    high: {
      value: 'high',
      label: 'عالٍ (نشاط مكثف)',
      description: 'قطة ذات نشاط مكثف، تركض وتقفز باستمرار',
      scientificNote: 'القطط ذات النشاط العالي تحتاج إلى 120-140 كيلو كالوري لكل كجم من وزن الجسم يومياً (WSAVA)',
      examples: ['قطط صغيرة جداً', 'قطط تخرج للخارج', 'قطط رياضية'],
      merFactor: 1.6
    },
    very_high: {
      value: 'very_high',
      label: 'مرتفع جداً (نشاط خارق)',
      description: 'قطة ذات طاقة غير عادية، نشاط مستمر وعنيف',
      scientificNote: 'القطط ذات النشاط المرتفع جداً تحتاج إلى 140-160+ كيلو كالوري لكل كجم من وزن الجسم يومياً',
      examples: ['قطط صغيرة نشيطة جداً', 'قطط تعيش في مزارع أو مساحات واسعة'],
      merFactor: 1.8
    }
  }), [])

  const handleCatDataChange = useCallback((field: keyof CatData, value: any) => {
    setCatData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleFoodDataChange = useCallback((field: keyof FoodData, value: any) => {
    setFoodData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleWeeklyPlanChange = useCallback((field: keyof WeeklyPlan, value: any) => {
    setWeeklyPlan(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleBoxBuilderChange = useCallback((field: keyof BoxBuilder, value: any) => {
    setBoxBuilder(prev => ({ ...prev, [field]: value }))
  }, [])

  const handlePricingChange = useCallback((field: keyof Pricing, value: any) => {
    setPricing(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleWetDayToggle = useCallback((index: number) => {
    const newWetDays = [...weeklyPlan.wetDays]
    newWetDays[index] = !newWetDays[index]
    setWeeklyPlan(prev => ({ ...prev, wetDays: newWetDays }))
  }, [weeklyPlan.wetDays])

  const autoDistributeWetDays = useCallback(() => {
    const count = parseInt(weeklyPlan.wetDaysCount.toString())
    const arr = new Array(7).fill(false)
    if (count <= 0) {
      setWeeklyPlan(prev => ({ ...prev, wetDays: arr }))
      return
    }
    
    const step = 7 / count
    const used = new Set()
    for (let i = 0; i < count; i++) {
      let idx = Math.floor(i * step + step / 2)
      if (idx > 6) idx = 6
      while (used.has(idx) && idx < 7) idx++
      if (idx > 6) { idx = 0; while (used.has(idx) && idx < 7) idx++ }
      if (idx <= 6) { arr[idx] = true; used.add(idx) }
    }
    setWeeklyPlan(prev => ({ ...prev, wetDays: arr }))
  }, [weeklyPlan.wetDaysCount])

  const calcRER = useCallback((weightKg: number) => {
    return 70 * Math.pow(weightKg, 0.75)
  }, [])

  const deriveLifeStage = useCallback((ageMonths: number) => {
    if (ageMonths < 4) return 'kitten_young'
    if (ageMonths < 12) return 'kitten_older'
    if (ageMonths >= 84) return 'senior'
    return 'adult'
  }, [])

  const estimateIdealWeight = useCallback(({ breedKey, sex, ageMonths, currentWeight }: { breedKey: string, sex: string, ageMonths: number, currentWeight: number }) => {
    if (ageMonths < 12) return { ideal: 0, note: "قطة صغيرة: لا وزن مثالي ثابت أثناء النمو.", range: [0, 0] }
    const ranges = BREED_WEIGHT_RANGES[breedKey as keyof typeof BREED_WEIGHT_RANGES] || DEFAULT_RANGE
    const [minW, maxW] = (ranges[sex as keyof typeof DEFAULT_RANGE] || DEFAULT_RANGE[sex as keyof typeof DEFAULT_RANGE]) as [number, number]
    let ideal = (currentWeight > 0 && currentWeight >= minW && currentWeight <= maxW) ? currentWeight : (minW + maxW) / 2
    return { ideal: Math.round(ideal * 100) / 100, note: `نطاق ${sex === 'male' ? 'ذكر' : 'أنثى'} ≈ ${minW}–${maxW} كجم`, range: [minW, maxW] }
  }, [BREED_WEIGHT_RANGES, DEFAULT_RANGE])

  const pickMERFactor = useCallback(({ lifeStage, neuterStatus, activity, ageMonths, special, sex, weightGoal }: { lifeStage: string, neuterStatus: string, activity: string, ageMonths: number, special: SpecialCondition, sex: string, weightGoal: string }) => {
    let stage = lifeStage === 'auto' ? deriveLifeStage(ageMonths) : lifeStage
    let factor = 1.0, label = ""
    
    // Get activity factor
    const activityInfo = ACTIVITY_LEVELS[activity] || ACTIVITY_LEVELS.moderate
    const activityFactor = activityInfo.merFactor
    
    if (stage === 'kitten_young') {
      factor = 2.5 * activityFactor
      label = `قطة صغيرة جدًا (<4 شهور) = ${factor.toFixed(1)}×RER (نمو سريع + ${activityInfo.label})`
    } else if (stage === 'kitten_older') {
      factor = 2.0 * activityFactor
      label = `قطة صغيرة (4-12 شهر) = ${factor.toFixed(1)}×RER (نمو + ${activityInfo.label})`
    } else if (stage === 'adult') {
      if (neuterStatus === 'neutered') {
        factor = activityFactor
        label = `بالغة معقّمة، ${activityInfo.label} = ${factor.toFixed(1)}×RER (${activityInfo.scientificNote})`
      } else {
        factor = activityFactor * 1.1
        label = `بالغة غير معقّمة، ${activityInfo.label} = ${factor.toFixed(1)}×RER (${activityInfo.scientificNote})`
      }
    } else if (stage === 'senior') {
      if (neuterStatus === 'neutered') {
        factor = activityFactor * 0.9
        label = `كبيرة سنًا معقّمة، ${activityInfo.label} = ${factor.toFixed(1)}×RER (انخفاض الأيض مع تقدم العمر)`
      } else {
        factor = activityFactor * 1.0
        label = `كبيرة سنًا غير معقّمة، ${activityInfo.label} = ${factor.toFixed(1)}×RER`
      }
    }

    // Special conditions override
    if (special && special.type && special.type !== 'none') {
      if (special.type === 'pregnant' && sex === 'female') {
        const map = { 1: 1.1, 2: 1.15, 3: 1.2, 4: 1.35, 5: 1.45, 6: 1.55, 7: 1.6, 8: 1.6, 9: 1.6 }
        const w = Math.max(1, Math.min(9, special.week || 8))
        factor = map[w as keyof typeof map]
        label = `حامل – أسبوع ${w} = ${factor}×RER (تجاوز - NRC 2006)`
      }
      if (special.type === 'lactating' && sex === 'female') {
        const baseByWeek = { 1: 2.0, 2: 2.3, 3: 2.8, 4: 2.8, 5: 2.4, 6: 2.0 }
        const w = Math.max(1, Math.min(6, special.week || 3))
        const k = Math.max(1, Math.min(8, special.kittens || 4))
        let base = baseByWeek[w as keyof typeof baseByWeek] || 2.4
        const adj = 0.1 * (k - 4)
        factor = Math.max(2.0, Math.min(3.5, base + adj))
        label = `مرضعة – أسبوع ${w}، صغار ${k} = ${factor.toFixed(2)}×RER (تجاوز - NRC 2006)`
      }
      // New special conditions
      const details = special.details || {};
      if (special.type === 'ckd') {
        const stage = details.ckdStage || 2;
        factor = Math.max(0.6, 1.0 - (stage * 0.1));
        label = `CKD المرحلة ${stage} = ${factor.toFixed(1)}×RER (انخفاض - IRIS 2023)`;
      } else if (special.type === 'hyperthyroid') {
        const treated = details.hyperthyroidTreated !== false; // default untreated
        factor = treated ? 0.8 : 1.3;
        label = `فرط درقية ${treated ? 'معالج' : 'غير معالج'} = ${factor.toFixed(1)}×RER (ISFM 2016)`;
      } else if (special.type === 'diabetes') {
        const controlled = details.diabetesControlled !== false;
        factor = controlled ? 1.0 : 1.1; // mild increase if uncontrolled
        if (weightGoal === 'loss') factor = 0.8; // override for obesity common in diabetes
        label = `سكري ${controlled ? 'مسيطر' : 'غير مسيطر'} = ${factor.toFixed(1)}×RER (AAHA 2018)`;
      } else if (special.type === 'recovery') {
        const weeks = details.recoveryWeeks || 2;
        factor = weeks <= 2 ? 1.3 : 1.1;
        label = `استشفاء (أسابيع ${weeks}) = ${factor.toFixed(1)}×RER (NRC 2006)`;
      } else if (special.type === 'cardiac') {
        const stable = details.cardiacStable !== false;
        factor = stable ? 0.9 : 0.8;
        label = `قلب ${stable ? 'مستقر' : 'فشل'} = ${factor.toFixed(1)}×RER (ACVIM 2016)`;
      }
    }

    // Weight goals override
    if (weightGoal === 'loss') {
      factor = 0.8 * activityFactor
      label = `تخسيس = ${factor.toFixed(1)}×RER (AAFP 2014 - ${activityInfo.label})`
    } else if (weightGoal === 'gain') {
      factor = 1.4 * activityFactor
      label = `تسمين = ${factor.toFixed(1)}×RER (${activityInfo.label})`
    }

    return { factor, label, stageUsed: stage, activityInfo }
  }, [deriveLifeStage, ACTIVITY_LEVELS])

  const roundToNearest5 = useCallback((x: number) => {
    return Math.round(x / 5) * 5
  }, [])

  const formatNumber = useCallback((x: number, digits = 0) => {
    try {
      return x.toLocaleString('ar-EG', { maximumFractionDigits: digits, minimumFractionDigits: digits })
    } catch (e) {
      return String(x)
    }
  }, [])

  const calculateNutrition = useCallback(() => {
    setIsCalculating(true)
    const newErrors: string[] = []
    
    // Validation
    const weight = parseFloat(catData.weight)
    if (!weight || weight <= 0) {
      newErrors.push("الرجاء إدخال الوزن (كجم).")
    }
    
    const dry100 = parseFloat(foodData.dry100)
    if (!dry100 || dry100 <= 0) {
      newErrors.push("الرجاء إدخال سعرات الدراي (لكل 100 جم).")
    }

    const wetUnitGrams = parseFloat(foodData.wetUnitGrams)
    if (!wetUnitGrams || wetUnitGrams <= 0) {
      newErrors.push("الرجاء إدخال وزن وحدة الويت (جم).")
    }

    if (foodData.wetMode === 'per100') {
      const wet100 = parseFloat(foodData.wet100)
      if (!wet100 || wet100 <= 0) {
        newErrors.push("الرجاء إدخال سعرات الويت لكل 100 جم.")
      }
    } else {
      const wetKcalPerUnit = parseFloat(foodData.wetKcalPerUnit)
      if (!wetKcalPerUnit || wetKcalPerUnit <= 0) {
        newErrors.push("الرجاء إدخال سعرات الويت لكل وحدة.")
      }
    }

    // Check weight goal logic
    const ageValue = parseFloat(catData.ageValue) || 0
    const ageMonths = catData.ageUnit === 'years' ? ageValue * 12 : ageValue
    const sex = catData.sex
    const breedKey = catData.breed
    
    // Calculate ideal weight and status
    const idealInfo = estimateIdealWeight({ breedKey, sex, ageMonths, currentWeight: weight })
    const [minW, maxW] = idealInfo.range
    const weightStatus = minW > 0 ? (weight < minW ? 'low' : weight > maxW ? 'high' : 'ok') : 'na'
    
    // Validate weight goal selection
    if (weightStatus === 'low' && catData.weightGoal === 'loss') {
      newErrors.push("لا يمكن اختيار نظام تخسيس والوزن الحالي أقل من المثالي. الرجاء اختيار نظام حفاظ أو تسمين.")
    }
    
    if (weightStatus === 'high' && catData.weightGoal === 'gain') {
      newErrors.push("لا يمكن اختيار نظام تسمين والوزن الحالي أعلى من المثالي. الرجاء اختيار نظام حفاظ أو تخسيس.")
    }

    // Additional validation for new special conditions
    if (catData.specialCond === 'ckd' || catData.specialCond === 'hyperthyroid') {
      if (ageMonths < 84) { // <7 years
        newErrors.push("حالات CKD أو فرط الدرقية شائعة في القطط الكبيرة (7+ سنوات). تأكيد مع بيطري.");
      }
      if (!catData.specialDetails || Object.keys(catData.specialDetails).length === 0) {
        newErrors.push("الرجاء تحديد تفاصيل الحالة الخاصة (مثل المرحلة).");
      }
    }
    if (catData.specialCond === 'diabetes' && ageMonths < 12) {
      newErrors.push("السكري نادر في القطط الصغيرة؛ تأكيد التشخيص.");
    }
    if (catData.specialCond === 'recovery' && (catData.specialDetails.recoveryWeeks || 0) > 4) {
      newErrors.push("فترة الاستشفاء عادة 1-4 أسابيع؛ استشر بيطريًا للفترات الأطول.");
    }
    if (catData.specialCond === 'cardiac' && catData.sex === 'male' && catData.breed === 'maine_coon') {
      newErrors.push("HCM شائع في Maine Coon الذكور؛ فحص وراثي موصى.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      setResults(null)
      setIsCalculating(false)
      return
    }

    setErrors([])

    // Gather data
    const lifeStageSel = catData.lifeStage
    const neuter = catData.neuter
    const activity = catData.activity
    const meals = parseInt(catData.meals.toString()) || 2
    const weightGoal = catData.weightGoal

    // Food densities
    const wetMode = foodData.wetMode
    const wet100 = parseFloat(foodData.wet100) || 0
    const wetKcalPerUnit = parseFloat(foodData.wetKcalPerUnit) || 0
    const kcalPerGramDry = dry100 / 100
    const kcalPerGramWet = wetMode === 'per100' ? (wet100 / 100) : (wetKcalPerUnit / wetUnitGrams)

    // Special conditions
    const specialCond = catData.specialCond
    let special: SpecialCondition = {
      type: specialCond,
      details: catData.specialDetails || {}
    };
    if (specialCond === 'pregnant') {
      special.week = parseInt(catData.pregWeek.toString()) || 8;
    }
    if (specialCond === 'lactating') {
      special.week = parseInt(catData.lacWeek.toString()) || 3;
      special.kittens = parseInt(catData.lacKittens.toString()) || 4;
    }
    // For new conditions, details are already in special.details

    // Calculate ideal weight and status
    const idealInfo2 = estimateIdealWeight({ breedKey, sex, ageMonths, currentWeight: weight })
    const weightStatus2 = minW > 0 ? (weight < minW ? 'low' : weight > maxW ? 'high' : 'ok') : 'na'

    // Used weight for calculation
    const usedWeight = weightGoal === 'maintain' ? weight : (idealInfo2.ideal > 0 ? idealInfo2.ideal : weight)

    // Calculate RER and DER with detailed activity factors
    const { factor, label, stageUsed, activityInfo } = pickMERFactor({ 
      lifeStage: lifeStageSel, 
      neuterStatus: neuter, 
      activity, 
      ageMonths, 
      special, 
      sex, 
      weightGoal 
    })
    const rer = calcRER(usedWeight)
    const der = rer * factor

    // Calculate wet food requirements
    const wetDays = weeklyPlan.wetDays
    const wetMealIndex = parseInt(weeklyPlan.wetMealIndex.toString()) || 1
    const wetDaysCount = wetDays.filter(Boolean).length
    
    let totalWetUnits = 0
    let totalWetKcalNeeded = 0
    
    if (wetDaysCount > 0) {
      if (boxBuilder.boxWetMode === 'fixed_total' && boxBuilder.boxTotalUnits > 0) {
        totalWetUnits = boxBuilder.boxTotalUnits
        totalWetKcalNeeded = totalWetUnits * wetUnitGrams * kcalPerGramWet
      } else {
        // Auto mode: calculate based on DER
        const dailyWetKcal = der / meals // Wet food for one meal
        totalWetKcalNeeded = dailyWetKcal * wetDaysCount
        if (wetMode === 'perUnit') {
          totalWetUnits = Math.ceil(totalWetKcalNeeded / wetKcalPerUnit)
        } else {
          const totalWetGramsNeeded = totalWetKcalNeeded / kcalPerGramWet
          totalWetUnits = Math.ceil(totalWetGramsNeeded / wetUnitGrams)
        }
      }
    }

    const splitDays = Math.max(1, parseInt(boxBuilder.boxSplitDays.toString()) || 3)
    const wetGramsPerServing = roundToNearest5(wetUnitGrams / splitDays)
    
    // Make sure serving size doesn't exceed reasonable limits
    const maxServingSize = wetUnitGrams * 0.8 // Max 80% of unit size
    const finalServingSize = Math.min(wetGramsPerServing, maxServingSize)
    
    // Build weekly plan
    const weeklyData: WeeklyDay[] = []
    for (let i = 0; i < 7; i++) {
      const isWetDay = wetDays[i]
      const dayName = dayNames[i]
      
      if (isWetDay) {
        // Wet food day - calculate based on serving size
        const wetGrams = finalServingSize
        const wetKcal = wetGrams * kcalPerGramWet
        const dryKcal = Math.max(0, der - wetKcal)
        const dryGrams = roundToNearest5(dryKcal / kcalPerGramDry)
        const units = wetGrams / wetUnitGrams
        
        weeklyData.push({
          day: dayName,
          type: `وجبة ويت (${meals > 1 ? `الوجبة ${wetMealIndex}` : 'الوحيدة'}) + دراي`,
          der: Math.round(der),
          wetKcal: Math.round(wetKcal),
          dryKcal: Math.round(dryKcal),
          wetGrams: wetGrams,
          dryGrams: dryGrams,
          units: units,
          servingSize: finalServingSize
        })
      } else {
        // Dry food only day
        const dryGrams = roundToNearest5(der / kcalPerGramDry)
        
        weeklyData.push({
          day: dayName,
          type: 'دراي فقط',
          der: Math.round(der),
          wetKcal: 0,
          dryKcal: Math.round(der),
          wetGrams: 0,
          dryGrams: dryGrams,
          units: 0,
          servingSize: 0
        })
      }
    }

    // Calculate box summary
    const totalDays = boxBuilder.boxType === 'weekly' ? 7 : 
                     boxBuilder.boxType === 'monthly30' ? 30 : 
                     parseInt(boxBuilder.customDays.toString()) || 30
    
    const wetDaysPerBox = Math.round((wetDaysCount / 7) * totalDays)
    const totalDER = der * totalDays
    const totalWetKcal = weeklyData.reduce((sum, day) => sum + day.wetKcal, 0) * (totalDays / 7)
    const totalDryKcal = weeklyData.reduce((sum, day) => sum + day.dryKcal, 0) * (totalDays / 7)
    const totalWetGrams = roundToNearest5(totalWetUnits * wetUnitGrams * (1 + boxBuilder.safety))
    const totalDryGrams = roundToNearest5(totalDryKcal / kcalPerGramDry * (1 + boxBuilder.safety))
    const unitsUsed = totalWetUnits

    // Calculate costs
    const priceDryPerKg = parseFloat(pricing.priceDryPerKg) || 0
    const priceWetUnit = parseFloat(pricing.priceWetUnit) || 0
    const dryCost = totalDryGrams > 0 ? (totalDryGrams / 1000) * priceDryPerKg : 0
    
    // For wet cost, use the actual units from the calculation
    let wetCost = 0
    let unitsForCost = totalWetUnits
    
    // If fixed total mode, use the specified number of units
    if (boxBuilder.boxWetMode === 'fixed_total' && boxBuilder.boxTotalUnits > 0) {
      unitsForCost = boxBuilder.boxTotalUnits
    }
    
    wetCost = unitsForCost > 0 ? unitsForCost * priceWetUnit : 0
    const totalCost = dryCost + wetCost

    setCosts({ dryCost, wetCost, totalCost })

    // Set results
    setResults({
      rer: Math.round(rer),
      factor: factor,
      der: Math.round(der),
      usedWeight: usedWeight,
      weightStatus: weightStatus2,
      idealWeight: idealInfo2.ideal,
      weightRange: idealInfo2.range,
      weeklyData: weeklyData,
      activityInfo: activityInfo,
      boxSummary: {
        totalDays: totalDays,
        wetDaysCount: wetDaysPerBox,
        totalDER: Math.round(totalDER),
        totalDryGrams: totalDryGrams,
        totalWetGrams: totalWetGrams,
        unitsUsed: unitsUsed,
        unitsForCost: unitsForCost,
        servingSize: finalServingSize
      }
    })
    setIsCalculating(false)
  }, [catData, foodData, weeklyPlan, boxBuilder, pricing, estimateIdealWeight, pickMERFactor, calcRER, roundToNearest5, deriveLifeStage, ACTIVITY_LEVELS, dayNames, BREED_WEIGHT_RANGES, DEFAULT_RANGE])

  // Initialize wet meal options based on meals count
  useEffect(() => {
    if (parseInt(catData.meals.toString()) < parseInt(weeklyPlan.wetMealIndex.toString())) {
      setWeeklyPlan(prev => ({ ...prev, wetMealIndex: 1 }))
    }
  }, [catData.meals, weeklyPlan.wetMealIndex])

  // Auto distribute wet days when count changes
  useEffect(() => {
    autoDistributeWetDays()
  }, [weeklyPlan.wetDaysCount, autoDistributeWetDays])

  // Debounced auto-calculate when inputs change
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      if (results) {
        calculateNutrition()
      }
    }, 500)
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [catData, foodData, weeklyPlan, boxBuilder, pricing, calculateNutrition, results])

  return {
    catData,
    setCatData,
    foodData,
    setFoodData,
    weeklyPlan,
    setWeeklyPlan,
    boxBuilder,
    setBoxBuilder,
    pricing,
    setPricing,
    results,
    errors,
    costs,
    isCalculating,
    dayNames,
    ACTIVITY_LEVELS,
    BREED_WEIGHT_RANGES,
    DEFAULT_RANGE,
    handleCatDataChange,
    handleFoodDataChange,
    handleWeeklyPlanChange,
    handleBoxBuilderChange,
    handlePricingChange,
    handleWetDayToggle,
    autoDistributeWetDays,
    calculateNutrition,
    formatNumber,
    roundToNearest5
  }
}
