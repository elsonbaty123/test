'use client'

import { useState, useEffect } from 'react'

export default function CatNutritionCalculator() {
  // State for cat data
  const [catData, setCatData] = useState({
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
  })

  // State for food data
  const [foodData, setFoodData] = useState({
    dry100: '',
    wetMode: 'per100',
    wet100: '',
    wetKcalPerUnit: '',
    wetUnitGrams: '',
    wetPackType: 'pouch',
  })

  // State for weekly plan
  const [weeklyPlan, setWeeklyPlan] = useState({
    wetDaysCount: 2,
    wetMealIndex: 1,
    wetDays: [false, false, true, true, false, false, false], // Default: Tuesday, Wednesday
  })

  // State for box builder
  const [boxBuilder, setBoxBuilder] = useState({
    boxType: 'monthly30',
    customDays: 30,
    safety: 0,
    boxWetMode: 'auto_total',
    boxSplitDays: 3,
    boxTotalUnits: 0,
  })

  // State for pricing
  const [pricing, setPricing] = useState({
    currency: 'ج.م',
    priceDryPerKg: '',
    priceWetUnit: '',
  })

  // State for results
  const [results, setResults] = useState(null)
  const [errors, setErrors] = useState([])
  const [costs, setCosts] = useState({ dryCost: 0, wetCost: 0, totalCost: 0 })

  const dayNames = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]

  // Breed weight ranges
  const BREED_WEIGHT_RANGES = {
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
  }
  const DEFAULT_RANGE = { male: [4.0, 6.5], female: [3.0, 5.5] }

  // Detailed activity level descriptions based on scientific research
  const ACTIVITY_LEVELS = {
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
  }

  // Handle input changes
  const handleCatDataChange = (field, value) => {
    setCatData(prev => ({ ...prev, [field]: value }))
  }

  const handleFoodDataChange = (field, value) => {
    setFoodData(prev => ({ ...prev, [field]: value }))
  }

  const handleWeeklyPlanChange = (field, value) => {
    setWeeklyPlan(prev => ({ ...prev, [field]: value }))
  }

  const handleBoxBuilderChange = (field, value) => {
    setBoxBuilder(prev => ({ ...prev, [field]: value }))
  }

  const handlePricingChange = (field, value) => {
    setPricing(prev => ({ ...prev, [field]: value }))
  }

  const handleWetDayToggle = (index) => {
    const newWetDays = [...weeklyPlan.wetDays]
    newWetDays[index] = !newWetDays[index]
    setWeeklyPlan(prev => ({ ...prev, wetDays: newWetDays }))
  }

  // Auto distribute wet days
  const autoDistributeWetDays = () => {
    const count = parseInt(weeklyPlan.wetDaysCount)
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
  }

  // Helper functions
  const calcRER = (weightKg) => {
    return 70 * Math.pow(weightKg, 0.75)
  }

  const deriveLifeStage = (ageMonths) => {
    if (ageMonths < 4) return 'kitten_young'
    if (ageMonths < 12) return 'kitten_older'
    if (ageMonths >= 84) return 'senior'
    return 'adult'
  }

  const estimateIdealWeight = ({ breedKey, sex, ageMonths, currentWeight }) => {
    if (ageMonths < 12) return { ideal: 0, note: "قطة صغيرة: لا وزن مثالي ثابت أثناء النمو.", range: [0, 0] }
    const ranges = BREED_WEIGHT_RANGES[breedKey] || DEFAULT_RANGE
    const [minW, maxW] = (ranges[sex] || DEFAULT_RANGE[sex])
    let ideal = (currentWeight > 0 && currentWeight >= minW && currentWeight <= maxW) ? currentWeight : (minW + maxW) / 2
    return { ideal: Math.round(ideal * 100) / 100, note: `نطاق ${sex === 'male' ? 'ذكر' : 'أنثى'} ≈ ${minW}–${maxW} كجم`, range: [minW, maxW] }
  }

  const pickMERFactor = ({ lifeStage, neuterStatus, activity, ageMonths, special, sex, weightGoal }) => {
    let stage = lifeStage === 'auto' ? deriveLifeStage(ageMonths) : lifeStage
    let factor = 1.0, label = ""
    
    // Get activity factor
    const activityInfo = ACTIVITY_LEVELS[activity] || ACTIVITY_LEVELS.moderate
    const activityFactor = activityInfo.merFactor
    
    if (stage === 'kitten_young') {
      // Very young kittens (0-4 months)
      factor = 2.5 * activityFactor
      label = `قطة صغيرة جدًا (<4 شهور) = ${factor.toFixed(1)}×RER (نمو سريع + ${activityInfo.label})`
    } else if (stage === 'kitten_older') {
      // Older kittens (4-12 months)
      factor = 2.0 * activityFactor
      label = `قطة صغيرة (4-12 شهر) = ${factor.toFixed(1)}×RER (نمو + ${activityInfo.label})`
    } else if (stage === 'adult') {
      // Adult cats with detailed neuter and activity factors
      if (neuterStatus === 'neutered') {
        // Neutered cats have lower energy requirements
        factor = activityFactor
        label = `بالغة معقّمة، ${activityInfo.label} = ${factor.toFixed(1)}×RER (${activityInfo.scientificNote})`
      } else {
        // Intact cats have higher energy requirements
        factor = activityFactor * 1.1
        label = `بالغة غير معقّمة، ${activityInfo.label} = ${factor.toFixed(1)}×RER (${activityInfo.scientificNote})`
      }
    } else if (stage === 'senior') {
      // Senior cats (7+ years)
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
        factor = map[w]
        label = `حامل – أسبوع ${w} = ${factor}×RER (تجاوز - NRC 2006)`
      }
      if (special.type === 'lactating' && sex === 'female') {
        const baseByWeek = { 1: 2.0, 2: 2.3, 3: 2.8, 4: 2.8, 5: 2.4, 6: 2.0 }
        const w = Math.max(1, Math.min(6, special.week || 3))
        const k = Math.max(1, Math.min(8, special.kittens || 4))
        let base = baseByWeek[w] || 2.4
        const adj = 0.1 * (k - 4)
        factor = Math.max(2.0, Math.min(3.5, base + adj))
        label = `مرضعة – أسبوع ${w}، صغار ${k} = ${factor.toFixed(2)}×RER (تجاوز - NRC 2006)`
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
  }

  const roundToNearest5 = (x) => {
    return Math.round(x / 5) * 5
  }

  const formatNumber = (x, digits = 0) => {
    try {
      return x.toLocaleString('ar-EG', { maximumFractionDigits: digits, minimumFractionDigits: digits })
    } catch (e) {
      return String(x)
    }
  }

  // Calculate nutrition
  const calculateNutrition = () => {
    const newErrors = []
    
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

    if (newErrors.length > 0) {
      setErrors(newErrors)
      setResults(null)
      return
    }

    setErrors([])

    // Gather data
    const lifeStageSel = catData.lifeStage
    const neuter = catData.neuter
    const activity = catData.activity
    const meals = parseInt(catData.meals) || 2
    const weightGoal = catData.weightGoal

    // Food densities
    const wetMode = foodData.wetMode
    const wet100 = parseFloat(foodData.wet100) || 0
    const wetKcalPerUnit = parseFloat(foodData.wetKcalPerUnit) || 0
    const kcalPerGramDry = dry100 / 100
    const kcalPerGramWet = wetMode === 'per100' ? (wet100 / 100) : (wetKcalPerUnit / wetUnitGrams)

    // Special conditions
    const specialCond = catData.specialCond
    let special = { type: specialCond }
    if (specialCond === 'pregnant') { special.week = parseInt(catData.pregWeek) || 8 }
    if (specialCond === 'lactating') { 
      special.week = parseInt(catData.lacWeek) || 3 
      special.kittens = parseInt(catData.lacKittens) || 4 
    }

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
    const wetMealIndex = parseInt(weeklyPlan.wetMealIndex) || 1
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

    const splitDays = Math.max(1, parseInt(boxBuilder.boxSplitDays) || 3)
    const wetGramsPerServing = roundToNearest5(wetUnitGrams / splitDays)
    
    // Make sure serving size doesn't exceed reasonable limits
    const maxServingSize = wetUnitGrams * 0.8 // Max 80% of unit size
    const finalServingSize = Math.min(wetGramsPerServing, maxServingSize)
    
    // Build weekly plan
    const weeklyData = []
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
                     parseInt(boxBuilder.customDays) || 30
    
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
        unitsForCost: unitsForCost, // Store the units used for cost calculation
        servingSize: finalServingSize
      }
    })
  }

  // Print report function
  const printReport = () => {
    window.print()
  }

  // Print box label function
  const printBoxLabel = () => {
    if (!results) {
      alert('الرجاء حساب الجدول أولاً')
      return
    }
    
    const labelContent = `
      <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 15px; color: #333;">ملصق بوكس تغذية القطة</h2>
        <div style="border: 2px solid #333; padding: 15px; border-radius: 8px;">
          <p><strong>اسم القطة:</strong> ${catData.name || 'غير محدد'}</p>
          <p><strong>الوزن:</strong> ${catData.weight} كجم</p>
          <p><strong>مستوى النشاط:</strong> ${results.activityInfo.label}</p>
          <p><strong>مدة البوكس:</strong> ${results.boxSummary.totalDays} يوم</p>
          <p><strong>السعرات اليومية:</strong> ${results.der} كيلو كالوري</p>
          <hr style="margin: 10px 0;">
          <p><strong>الدراي الإجمالي:</strong> ${results.boxSummary.totalDryGrams} جم</p>
          <p><strong>الويت الإجمالي:</strong> ${results.boxSummary.totalWetGrams} جم</p>
          <p><strong>عدد وحدات الويت:</strong> ${results.boxSummary.unitsUsed}</p>
          <p><strong>حجم كل وجبة ويت:</strong> ${results.boxSummary.servingSize} جم</p>
          <hr style="margin: 10px 0;">
          <p style="font-size: 12px; color: #666;">
            <strong>ملاحظات:</strong><br>
            • قسم الدراي إلى حصص يومية ≈ ${Math.round(results.boxSummary.totalDryGrams / results.boxSummary.totalDays / 5) * 5} جم/يوم<br>
            • اتبع تعليمات التوزيع الأسبوعية<br>
            • ${results.activityInfo.scientificNote}<br>
            • راجع طبيب بيطري لأي استفسارات
          </p>
          <p style="text-align: center; margin-top: 15px; font-size: 11px; color: #999;">
            تم التحضير: ${new Date().toLocaleDateString('ar-EG')}
          </p>
        </div>
      </div>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
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
    printWindow.document.close()
    printWindow.print()
  }

  // Initialize wet meal options based on meals count
  useEffect(() => {
    if (parseInt(catData.meals) < parseInt(weeklyPlan.wetMealIndex)) {
      setWeeklyPlan(prev => ({ ...prev, wetMealIndex: 1 }))
    }
  }, [catData.meals])

  // Auto distribute wet days when count changes
  useEffect(() => {
    autoDistributeWetDays()
  }, [weeklyPlan.wetDaysCount])

  // Auto-calculate when inputs change
  useEffect(() => {
    if (results) {
      calculateNutrition()
    }
  }, [catData, foodData, weeklyPlan, boxBuilder, pricing])

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
        {/* Cat Data */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">بيانات القطة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم القطة</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="مثال: لولا"
                value={catData.name}
                onChange={(e) => handleCatDataChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">العمر</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="flex-1 p-2 border rounded-md"
                  placeholder="رقم"
                  value={catData.ageValue}
                  onChange={(e) => handleCatDataChange('ageValue', e.target.value)}
                />
                <select
                  className="p-2 border rounded-md"
                  value={catData.ageUnit}
                  onChange={(e) => handleCatDataChange('ageUnit', e.target.value)}
                >
                  <option value="months">شهور</option>
                  <option value="years">سنين</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">تُشتق المرحلة العمرية تلقائيًا ويمكن تعديلها.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">المرحلة العمرية</label>
              <select
                className="w-full p-2 border rounded-md"
                value={catData.lifeStage}
                onChange={(e) => handleCatDataChange('lifeStage', e.target.value)}
              >
                <option value="auto">تلقائي من العمر</option>
                <option value="kitten_young">قطة صغيرة جدًا (0-4 شهور)</option>
                <option value="kitten_older">قطة صغيرة (4-12 شهر)</option>
                <option value="adult">بالغة</option>
                <option value="senior">كبيرة سنًا (7+ سنوات)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الوزن الحالي (كجم)</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                placeholder="مثال: 4.2"
                value={catData.weight}
                onChange={(e) => handleCatDataChange('weight', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الجنس</label>
              <select
                className="w-full p-2 border rounded-md"
                value={catData.sex}
                onChange={(e) => handleCatDataChange('sex', e.target.value)}
              >
                <option value="female">أنثى</option>
                <option value="male">ذكر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">السلالة</label>
              <select
                className="w-full p-2 border rounded-md"
                value={catData.breed}
                onChange={(e) => handleCatDataChange('breed', e.target.value)}
              >
                <option value="domestic_shorthair">منزلية شعر قصير</option>
                <option value="domestic_longhair">منزلية شعر طويل</option>
                <option value="persian">Persian (شيرازي)</option>
                <option value="british_shorthair">British Shorthair</option>
                <option value="maine_coon">Maine Coon</option>
                <option value="ragdoll">Ragdoll</option>
                <option value="siamese">Siamese</option>
                <option value="bengal">Bengal</option>
                <option value="sphynx">Sphynx</option>
                <option value="scottish_fold">Scottish Fold</option>
                <option value="norwegian_forest">Norwegian Forest</option>
                <option value="american_shorthair">American Shorthair</option>
                <option value="abyssinian">Abyssinian</option>
                <option value="turkish_angora">Turkish Angora</option>
                <option value="russian_blue">Russian Blue</option>
                <option value="oriental">Oriental</option>
                <option value="other">أخرى</option>
              </select>
              {catData.breed === 'other' && (
                <input
                  type="text"
                  className="w-full p-2 border rounded-md mt-2"
                  placeholder="اكتب السلالة"
                  value={catData.breedOther}
                  onChange={(e) => handleCatDataChange('breedOther', e.target.value)}
                />
              )}
              <p className="text-xs text-gray-500 mt-1">نقدّر الوزن المثالي حسب السلالة والجنس (للبالغين/الكبار).</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">حالة التعقيم</label>
              <select
                className="w-full p-2 border rounded-md"
                value={catData.neuter}
                onChange={(e) => handleCatDataChange('neuter', e.target.value)}
              >
                <option value="neutered">معقّمة/مخصي</option>
                <option value="intact">غير معقّمة/سليمة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">مستوى النشاط</label>
              <select
                className="w-full p-2 border rounded-md"
                value={catData.activity}
                onChange={(e) => handleCatDataChange('activity', e.target.value)}
              >
                {Object.values(ACTIVITY_LEVELS).map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                <p className="font-medium">{ACTIVITY_LEVELS[catData.activity]?.description}</p>
                <p className="mt-1 text-blue-700">{ACTIVITY_LEVELS[catData.activity]?.scientificNote}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">عدد الوجبات في اليوم</label>
              <select
                className="w-full p-2 border rounded-md"
                value={catData.meals}
                onChange={(e) => handleCatDataChange('meals', parseInt(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">في أيام الويت توجد وجبة ويت واحدة والباقي دراي.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">هدف الوزن</label>
              <select
                className="w-full p-2 border rounded-md"
                value={catData.weightGoal}
                onChange={(e) => handleCatDataChange('weightGoal', e.target.value)}
              >
                <option value="maintain">حفاظ على الوزن الحالي</option>
                <option value="loss">تخسيس</option>
                <option value="gain">تسمين</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">التخسيس/التسمين تُحسب على الوزن المثالي المُقدّر.</p>
            </div>
          </div>
        </div>

        {/* Special Conditions */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">حالات خاصة (إن وجدت)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select
                className="w-full p-2 border rounded-md"
                value={catData.specialCond}
                onChange={(e) => handleCatDataChange('specialCond', e.target.value)}
              >
                <option value="none">لا توجد</option>
                <option value="pregnant">حامل (Queen)</option>
                <option value="lactating">مرضعة (Queen)</option>
              </select>
            </div>

            {catData.specialCond === 'pregnant' && (
              <div>
                <label className="block text-sm font-medium mb-1">أسبوع الحمل</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={catData.pregWeek}
                  onChange={(e) => handleCatDataChange('pregWeek', parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(week => (
                    <option key={week} value={week}>{week}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">حتى ~1.6×RER قرب الولادة (WSAVA/NRC).</p>
              </div>
            )}

            {catData.specialCond === 'lactating' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">أسبوع الرضاعة</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={catData.lacWeek}
                    onChange={(e) => handleCatDataChange('lacWeek', parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map(week => (
                      <option key={week} value={week}>{week}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">الذروة بالأسبوع 3–4 (~2.5–3.0×RER).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">عدد الصغار</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={catData.lacKittens}
                    onChange={(e) => handleCatDataChange('lacKittens', parseInt(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Food and Calories */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">الطعام والسعرات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">سعرات الدراي (كيلو كالوري لكل 100 جم)</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                placeholder="مثال: 380"
                value={foodData.dry100}
                onChange={(e) => handleFoodDataChange('dry100', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الويت فود</label>
              <div className="flex gap-2 flex-wrap mb-2">
                <select
                  className="p-2 border rounded-md"
                  value={foodData.wetMode}
                  onChange={(e) => handleFoodDataChange('wetMode', e.target.value)}
                >
                  <option value="per100">سعرات لكل 100 جم</option>
                  <option value="perUnit">سعرات لكل وحدة</option>
                </select>
                <select
                  className="p-2 border rounded-md"
                  value={foodData.wetPackType}
                  onChange={(e) => handleFoodDataChange('wetPackType', e.target.value)}
                >
                  <option value="pouch">كيس</option>
                  <option value="can">علبة</option>
                </select>
                <input
                  type="number"
                  className="p-2 border rounded-md"
                  placeholder="وزن الوحدة (جم)"
                  value={foodData.wetUnitGrams}
                  onChange={(e) => handleFoodDataChange('wetUnitGrams', e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="flex-1 p-2 border rounded-md"
                  placeholder="kcal/100g"
                  value={foodData.wet100}
                  onChange={(e) => handleFoodDataChange('wet100', e.target.value)}
                  style={{ display: foodData.wetMode === 'per100' ? 'block' : 'none' }}
                />
                <input
                  type="number"
                  className="flex-1 p-2 border rounded-md"
                  placeholder="kcal/وحدة"
                  value={foodData.wetKcalPerUnit}
                  onChange={(e) => handleFoodDataChange('wetKcalPerUnit', e.target.value)}
                  style={{ display: foodData.wetMode === 'perUnit' ? 'block' : 'none' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">اختر نظام السعرات للويت: إما لكل 100 جم أو لكل وحدة (كيس/علبة).</p>
            </div>
          </div>
        </div>

        {/* Weekly Plan */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">خطة الأسبوع (وجبة ويت واحدة في أيام الويت)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">عدد أيام الويت في الأسبوع</label>
              <select
                className="w-full p-2 border rounded-md"
                value={weeklyPlan.wetDaysCount}
                onChange={(e) => handleWeeklyPlanChange('wetDaysCount', parseInt(e.target.value))}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">أي وجبة ستكون ويت؟</label>
              <select
                className="w-full p-2 border rounded-md"
                value={weeklyPlan.wetMealIndex}
                onChange={(e) => handleWeeklyPlanChange('wetMealIndex', parseInt(e.target.value))}
              >
                {Array.from({ length: parseInt(catData.meals) || 2 }, (_, i) => i + 1).map(meal => (
                  <option key={meal} value={meal}>الوجبة {meal}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">يوضع كامل الويت في الوجبة المختارة، والباقي دراي.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">أيام الأسبوع التي بها ويت</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {dayNames.map((day, index) => (
                  <label
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      weeklyPlan.wetDays[index]
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={weeklyPlan.wetDays[index]}
                      onChange={() => handleWetDayToggle(index)}
                    />
                    {day}
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                onClick={autoDistributeWetDays}
              >
                توزيع تلقائي متوازن
              </button>
            </div>
          </div>
        </div>

        {/* Box Builder */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 print:hidden">
          <h2 className="text-lg font-semibold mb-4">صانع البوكسات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">نوع البوكس</label>
              <select
                className="w-full p-2 border rounded-md"
                value={boxBuilder.boxType}
                onChange={(e) => handleBoxBuilderChange('boxType', e.target.value)}
              >
                <option value="weekly">أسبوعي (7 أيام)</option>
                <option value="monthly30">شهري (30 يوم)</option>
                <option value="custom">مخصص</option>
              </select>
            </div>
            {boxBuilder.boxType === 'custom' && (
              <div>
                <label className="block text-sm font-medium mb-1">عدد الأيام</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  value={boxBuilder.customDays}
                  onChange={(e) => handleBoxBuilderChange('customDays', parseInt(e.target.value))}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">هامش أمان للتعبئة</label>
              <select
                className="w-full p-2 border rounded-md"
                value={boxBuilder.safety}
                onChange={(e) => handleBoxBuilderChange('safety', parseFloat(e.target.value))}
              >
                <option value={0}>بدون</option>
                <option value={0.05}>+5%</option>
                <option value={0.10}>+10%</option>
              </select>
            </div>
          </div>

          <h3 className="text-md font-semibold mt-6 mb-4">إدارة الويت في البوكس</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">وضع الويت للبوكس</label>
              <select
                className="w-full p-2 border rounded-md"
                value={boxBuilder.boxWetMode}
                onChange={(e) => handleBoxBuilderChange('boxWetMode', e.target.value)}
              >
                <option value="auto_total">تلقائي إجمالي للبوكس</option>
                <option value="fixed_total">كمية ثابتة (بالوحدات) للبوكس</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تقسيم كل وحدة على عدد أيام</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                value={boxBuilder.boxSplitDays}
                onChange={(e) => handleBoxBuilderChange('boxSplitDays', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">مثال: العلبة تُستهلك على 3 أيام ويت (بنفس الكمية كل يوم).</p>
            </div>
            {boxBuilder.boxWetMode === 'fixed_total' && (
              <div>
                <label className="block text-sm font-medium mb-1">عدد وحدات الويت في البوكس</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md"
                  placeholder="مثال: 10"
                  value={boxBuilder.boxTotalUnits}
                  onChange={(e) => handleBoxBuilderChange('boxTotalUnits', parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 print:hidden">
          <h2 className="text-lg font-semibold mb-4">التسعير (للحساب الداخلي فقط)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">العملة</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="مثال: ج.م"
                value={pricing.currency}
                onChange={(e) => handlePricingChange('currency', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">سعر الدراي (لكل 1 كجم)</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                placeholder="مثال: 180"
                value={pricing.priceDryPerKg}
                onChange={(e) => handlePricingChange('priceDryPerKg', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">سعر وحدة الويت (كيس/علبة)</label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                placeholder="مثال: 25"
                value={pricing.priceWetUnit}
                onChange={(e) => handlePricingChange('priceWetUnit', e.target.value)}
              />
            </div>
          </div>
          
          {/* Cost Summary */}
          {results && (pricing.priceDryPerKg || pricing.priceWetUnit) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
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
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 print:hidden">
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={calculateNutrition}
            >
              حساب الجدول
            </button>
            <button
              className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              onClick={() => {}}
            >
              حفظ البيانات
            </button>
            <button
              className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-md hover:bg-yellow-600 transition-colors"
              onClick={() => {}}
            >
              إعادة الضبط
            </button>
            <button
              className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              onClick={printReport}
            >
              طباعة التقرير
            </button>
            <button
              className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              onClick={printBoxLabel}
            >
              طباعة ملصق البوكس
            </button>
          </div>
          {errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <ul className="list-disc list-inside text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div id="resultsCard" className="bg-white rounded-lg shadow-sm border p-4 md:p-6 print:shadow-none print:border-0">
            {/* Print Header - only visible when printing */}
            <div className="print-header hidden print:block mb-4">
              <h1 className="text-xl font-bold mb-1">تقرير تغذية القطة</h1>
              <p className="text-sm text-gray-600">وقت الطباعة: {new Date().toLocaleString('ar-EG')}</p>
            </div>

            <h2 className="text-lg font-semibold mb-4">نتائج الحساب</h2>
            
            {/* Client Details */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">الاسم: {catData.name || '—'}</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">العمر: {catData.ageValue} {catData.ageUnit === 'years' ? 'سنة' : 'شهر'}</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">الوزن: {catData.weight} كجم</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">الجنس: {catData.sex === 'female' ? 'أنثى' : 'ذكر'}</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">النشاط: {results.activityInfo.label}</span>
              {results && results.weightStatus !== 'na' && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  results.weightStatus === 'ok' 
                    ? 'bg-green-100 text-green-700' 
                    : results.weightStatus === 'low' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  الوزن: {results.weightStatus === 'ok' ? 'مثالي' : results.weightStatus === 'low' ? 'أقل من المثالي' : 'أعلى من المثالي'}
                  {results.weightStatus !== 'ok' && ` (الوزن المثالي: ${results.idealWeight} كجم)`}
                </span>
              )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600">RER (Resting)</div>
                <div className="text-xl font-bold">{results.rer}</div>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600">العامل المستخدم (MER)</div>
                <div className="text-xl font-bold">{results.factor.toFixed(1)}×RER</div>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600">السعرات اليومية المطلوبة (DER)</div>
                <div className="text-xl font-bold">{results.der}</div>
              </div>
              <div className="bg-gray-50 border rounded-lg p-4 text-center">
                <div className="text-sm text-gray-600">الوزن المُستخدم للحساب</div>
                <div className="text-xl font-bold">{results.usedWeight} كجم</div>
              </div>
            </div>

            {/* Activity Details */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-2">تفاصيل مستوى النشاط</h3>
              <p className="text-sm mb-2"><strong>{results.activityInfo.label}</strong></p>
              <p className="text-sm mb-2">{results.activityInfo.description}</p>
              <p className="text-sm text-blue-700">{results.activityInfo.scientificNote}</p>
              <p className="text-xs text-gray-600 mt-2">أمثلة: {results.activityInfo.examples.join('، ')}</p>
            </div>

            {/* Weight Gauge */}
            {results && results.weightStatus !== 'na' && (
              <div className="mb-6">
                <div className="relative h-4 bg-gradient-to-r from-red-200 via-green-200 to-red-200 rounded-full border">
                  <div 
                    className="absolute top-0 w-0 h-0 border-l-3 border-r-3 border-b-4 border-transparent border-b-blue-600 -mt-2" 
                    style={{ left: `${((parseFloat(catData.weight) - 1) / 10) * 100}%` }}
                    title={`الوزن الحالي: ${catData.weight} كجم`}
                  ></div>
                  <div 
                    className="absolute top-0 w-0 h-0 border-l-3 border-r-3 border-b-4 border-transparent border-b-green-600 -mt-2" 
                    style={{ left: `${((results.idealWeight - 1) / 10) * 100}%` }}
                    title={`الوزن المثالي: ${results.idealWeight} كجم`}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>أقل من المثالي</span>
                  <span>نطاق مثالي ({results.weightRange[0]}-{results.weightRange[1]} كجم)</span>
                  <span>أعلى من المثالي</span>
                </div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                  results.weightStatus === 'ok' 
                    ? 'bg-green-100 text-green-700' 
                    : results.weightStatus === 'low' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  الحالة: {results.weightStatus === 'ok' ? 'ضمن النطاق المثالي' : results.weightStatus === 'low' ? 'أقل من المثالي' : 'أعلى من المثالي'}
                </span>
              </div>
            )}

            {results && results.weightStatus === 'na' && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                مؤشر الوزن: غير مُطبق للقطط الصغيرة (أقل من 12 شهر).
              </div>
            )}

            <div className="border-t pt-6"></div>

            {/* Weekly Table */}
            <h2 className="text-lg font-semibold mb-4">الجدول الأسبوعي</h2>
            <p className="text-sm text-gray-600 mb-4">تقريب الجرامات لأقرب 5 جم.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2">اليوم</th>
                    <th className="border p-2">نوع اليوم</th>
                    <th className="border p-2">DER (كcal)</th>
                    <th className="border p-2">سعرات ويت</th>
                    <th className="border p-2">سعرات دراي</th>
                    <th className="border p-2">جرامات ويت</th>
                    <th className="border p-2">جرامات دراي</th>
                    <th className="border p-2">وحدات ويت</th>
                  </tr>
                </thead>
                <tbody>
                  {results.weeklyData.map((day, index) => (
                    <tr key={index}>
                      <td className="border p-2 text-center">{day.day}</td>
                      <td className="border p-2 text-center">{day.type}</td>
                      <td className="border p-2 text-center">{day.der}</td>
                      <td className="border p-2 text-center">{day.wetKcal}</td>
                      <td className="border p-2 text-center">{day.dryKcal}</td>
                      <td className="border p-2 text-center">{day.wetGrams}</td>
                      <td className="border p-2 text-center">{day.dryGrams}</td>
                      <td className="border p-2 text-center">{day.units.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-6 mt-6 print:hidden"></div>

            {/* Box Summary */}
            <div className="print:hidden">
              <h2 className="text-lg font-semibold mb-4">ملخص البوكس</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 border rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600">مدة البوكس</div>
                  <div className="text-xl font-bold">{results.boxSummary.totalDays} يوم</div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600">أيام الويت</div>
                  <div className="text-xl font-bold">{results.boxSummary.wetDaysCount} يوم</div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600">إجمالي السعرات</div>
                  <div className="text-xl font-bold">{results.boxSummary.totalDER} كcal</div>
                </div>
                <div className="bg-gray-50 border rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600">وحدات الويت المستهلكة</div>
                  <div className="text-xl font-bold">{results.boxSummary.unitsUsed}</div>
                </div>
              </div>

              <h3 className="text-md font-semibold mb-4">قائمة التعبئة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold">الدراي الإجمالي: <span className="text-lg">{results.boxSummary.totalDryGrams} جم</span></div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold">الويت الإجمالي: <span className="text-lg">{results.boxSummary.totalWetGrams} جم</span></div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold">عدد وحدات الويت: <span className="text-lg">{results.boxSummary.unitsUsed}</span></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">نصيحة: قسّم الدراي إلى باكات يومية ≈ {Math.round(results.boxSummary.totalDryGrams / results.boxSummary.totalDays / 5) * 5} جم/يوم.</p>
              <p className="text-sm text-gray-600 mt-1">حجم كل وجبة ويت: {results.boxSummary.servingSize} جم (تقسيم كل وحدة على {boxBuilder.boxSplitDays} أيام).</p>
            </div>

            <div className="border-t pt-6 mt-6"></div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm print:hidden">
              هذه أداة إرشادية—تابع حالة الجسم BCS مع طبيب بيطري وعدّل الكميات حسب الاستجابة.
            </div>

            <div className="border-t pt-6 mt-6 print:hidden"></div>
            
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
          </div>
        )}
      </div>

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
          
          /* Hide everything before results section */
          header,
          .max-w-6xl > div:not(#resultsCard),
          footer {
            display: none !important;
          }
          
          /* Show only results card and adjust layout */
          #resultsCard {
            display: block !important;
            box-shadow: none !important;
            border: none !important;
            padding: 5px !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          
          /* Adjust margins for print */
          .max-w-6xl {
            max-width: none !important;
            margin: 0 !important;
            padding: 5mm !important;
          }
          
          /* Ensure single page */
          @page {
            size: A4;
            margin: 5mm;
          }
          
          * {
            page-break-inside: avoid;
          }
          
          /* Compact table for printing */
          table {
            font-size: 9px;
            border-collapse: collapse;
          }
          
          th, td {
            padding: 2px !important;
            border: 1px solid #ccc !important;
            font-size: 9px;
          }
          
          /* Compact summary boxes */
          .grid {
            gap: 4px !important;
          }
          
          .bg-gray-50 {
            padding: 4px !important;
          }
          
          /* Remove unnecessary spacing */
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
          
          /* Smaller fonts */
          .text-lg {
            font-size: 12px !important;
          }
          .text-xl {
            font-size: 14px !important;
          }
          .text-2xl {
            font-size: 16px !important;
          }
          
          /* Compact chips */
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
          
          /* Hide unnecessary elements */
          .print-hidden {
            display: none !important;
          }
        }
        
        .print-header {
          display: none;
        }
      `}</style>
    </div>
  )
}