// Box calculation utilities
import { BoxTypeConfig, BoxVariant } from '@/hooks/useCatNutrition'

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
  breakfastKcal: number;
  dinnerKcal: number;
  breakfastWetGrams: number;
  breakfastDryGrams: number;
  dinnerWetGrams: number;
  dinnerDryGrams: number;
}

interface CatData {
  weight: string;
  ageValue: string;
  ageUnit: 'months' | 'years';
  lifeStage: 'auto' | 'kitten_young' | 'kitten_older' | 'adult' | 'senior';
  bcs: number;
  sex: 'female' | 'male';
  neuter: 'neutered' | 'intact';
  activity: string;
  meals: number;
  weightGoal: 'maintain' | 'loss' | 'gain';
  specialCond: 'none' | 'pregnant' | 'lactating' | 'ckd' | 'hyperthyroid' | 'diabetes' | 'recovery' | 'cardiac';
  pregWeek: number;
  lacWeek: number;
  lacKittens: number;
}

interface FoodData {
  dry100: string;
  wetMode: 'per100' | 'perUnit';
  wet100: string;
  wetKcalPerUnit: string;
  wetUnitGrams: string;
  wetPackType: 'pouch' | 'can';
}

const ACTIVITY_LEVELS = {
  low: { multiplier: 1.2 },
  moderate: { multiplier: 1.4 },
  high: { multiplier: 1.8 },
}

const DAY_NAMES_AR = ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة']

function toNumber(v: any, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : fallback
}

function calcRER(weight: number): number {
  if (weight <= 0) return 0
  return 70 * Math.pow(weight, 0.75)
}

function selectEvenlyDistributedIndices(total: number, count: number): number[] {
  if (count <= 0 || total <= 0) return []
  if (count >= total) return Array.from({ length: total }, (_, i) => i)
  
  const result: number[] = []
  
  if (count === 1) {
    // For 1 wet day, place it in the middle of the week
    result.push(3) // Wednesday (index 3)
  } else if (count === 2) {
    // For 2 wet days, distribute evenly
    result.push(1, 5) // Monday and Friday
  } else if (count === 3) {
    // For 3 wet days, distribute evenly
    result.push(1, 3, 5) // Monday, Wednesday, Friday
  } else {
    // For more days, use mathematical distribution
    const step = (total - 1) / (count - 1)
    for (let i = 0; i < count; i++) {
      const index = Math.round(i * step)
      if (index < total && !result.includes(index)) {
        result.push(index)
      }
    }
  }
  
  return result.slice(0, count)
}

export function calculateBoxSpecificNutrition(
  boxType: BoxTypeConfig,
  variant: BoxVariant,
  catData: CatData,
  foodData: FoodData,
  wetMealIndex: number = 1
): WeeklyDay[] {
  const weight = toNumber(catData.weight, 0)
  const ageValue = toNumber(catData.ageValue, 0)
  const ageUnit = catData.ageUnit || 'months'
  const ageInMonths = ageUnit === 'years' ? ageValue * 12 : ageValue
  const bcs = Math.max(1, Math.min(9, catData.bcs || 5))
  const sex = catData.sex === 'male' ? 'male' : 'female'
  const neuter = catData.neuter === 'neutered'
  const activity = catData.activity || 'moderate'
  const meals = Math.max(1, catData.meals || 2)
  const weightGoal = catData.weightGoal || 'maintain'
  const specialCond = catData.specialCond || 'none'
  const pregWeek = Math.max(0, catData.pregWeek || 0)
  const lacWeek = Math.max(0, catData.lacWeek || 0)
  const lacKittens = Math.max(1, catData.lacKittens || 1)

  // Calculate RER and DER
  const rer = calcRER(weight)
  let factor = 1.0

  // Life stage determination
  let stage: 'kitten_young' | 'kitten_older' | 'adult' | 'senior'
  if (catData.lifeStage !== 'auto') {
    stage = catData.lifeStage as 'kitten_young' | 'kitten_older' | 'adult' | 'senior'
  } else {
    if (ageInMonths < 4) stage = 'kitten_young'
    else if (ageInMonths < 12) stage = 'kitten_older'
    else if (ageInMonths < 84) stage = 'adult'
    else stage = 'senior'
  }

  // Calculate factor based on life stage and conditions
  if (specialCond === 'pregnant') {
    factor = pregWeek <= 6 ? 1.6 : 2.0
  } else if (specialCond === 'lactating') {
    const lacFactor = 2.0 + (lacKittens - 1) * 0.25
    factor = Math.min(lacFactor, 6.0)
  } else if (stage === 'kitten_young') {
    factor = 2.5
  } else if (stage === 'kitten_older') {
    factor = 2.0
  } else {
    // Adult/senior with activity and neuter status
    const activityInfo = ACTIVITY_LEVELS[activity as keyof typeof ACTIVITY_LEVELS] || ACTIVITY_LEVELS.moderate
    factor = neuter ? activityInfo.multiplier : activityInfo.multiplier + 0.2
    
    // BCS adjustments
    if (bcs <= 3) factor *= 1.2
    else if (bcs >= 7) factor *= 0.8
    
    // Weight goal adjustments
    if (weightGoal === 'gain') factor *= 1.2
    else if (weightGoal === 'loss') factor *= 0.8
  }

  const der = rer * factor

  // Create custom weekly plan for this box type
  const wetDays = [false, false, false, false, false, false, false]
  if (boxType.includeWetFood && boxType.wetFoodBagsPerWeek > 0) {
    const wetIndices = selectEvenlyDistributedIndices(7, boxType.wetFoodBagsPerWeek)
    wetIndices.forEach(idx => {
      if (idx >= 0 && idx < 7) {
        wetDays[idx] = true
      }
    })
  }

  // Food data parsing
  const dryKcalPer100 = toNumber(foodData.dry100, 350)
  const wetKcalPer100 = toNumber(foodData.wet100, 80)
  const wetKcalPerUnit = toNumber(foodData.wetKcalPerUnit, 80)
  const wetUnitGrams = toNumber(foodData.wetUnitGrams, 85)
  const dryGramsPerKcal = 100 / Math.max(1, dryKcalPer100)

  // Generate daily data for this box configuration
  const dailyData: WeeklyDay[] = DAY_NAMES_AR.map((d, i) => {
    const isWet = wetDays[i]
    const perMealTarget = der / meals
    
    // Calculate kcal distribution
    const wetKcalPerMeal = new Array(meals).fill(0)
    const dryKcalPerMeal = new Array(meals).fill(0)
    
    if (isWet) {
      // في أيام الويت فود، وجبة واحدة ويت والباقي دراي
      wetKcalPerMeal[wetMealIndex - 1] = perMealTarget
      for (let j = 0; j < meals; j++) {
        if (j !== wetMealIndex - 1) {
          dryKcalPerMeal[j] = perMealTarget
        }
      }
    } else {
      // في أيام الدراي فقط، كل الوجبات دراي
      for (let j = 0; j < meals; j++) {
        dryKcalPerMeal[j] = perMealTarget
      }
    }
    
    // Calculate grams and units
    const wetKcalPerGram = foodData.wetMode === 'per100'
      ? Math.max(1, wetKcalPer100) / 100
      : Math.max(1, wetKcalPerUnit) / Math.max(1, wetUnitGrams)
    
    const totalWetKcal = wetKcalPerMeal.reduce((s, v) => s + v, 0)
    const totalDryKcal = dryKcalPerMeal.reduce((s, v) => s + v, 0)
    
    const wetGramsTotal = totalWetKcal / Math.max(1e-6, wetKcalPerGram)
    const dryGramsTotal = totalDryKcal * dryGramsPerKcal
    
    let dayUnits = 0
    if (wetGramsTotal > 0 && wetUnitGrams > 0) {
      dayUnits = wetGramsTotal / wetUnitGrams
    }
    
    // Create meals breakdown
    const mealsBreakdown = wetKcalPerMeal.map((wetKcal, idx) => {
      const dryKcal = dryKcalPerMeal[idx] || 0
      const wetGramsForMeal = wetKcal / Math.max(1e-6, wetKcalPerGram)
      const dryGramsForMeal = dryKcal * dryGramsPerKcal
      
      let wetUnitsForMeal = 0
      if (wetGramsForMeal > 0 && wetUnitGrams > 0) {
        wetUnitsForMeal = wetGramsForMeal / wetUnitGrams
      }
      
      return {
        mealIndex: idx + 1,
        kcal: Math.round(perMealTarget * 10) / 10,
        wetGrams: Math.round(wetGramsForMeal),
        dryGrams: Math.round(dryGramsForMeal),
        wetUnits: Math.round(wetUnitsForMeal * 100) / 100
      }
    })
    
    return {
      day: d,
      type: isWet ? 'wet' : 'dry',
      der: Math.round(der * 10) / 10,
      wetKcal: Math.round(totalWetKcal * 10) / 10,
      dryKcal: Math.round(totalDryKcal * 10) / 10,
      wetGrams: Math.round(wetGramsTotal * 10) / 10,
      dryGrams: Math.round(dryGramsTotal * 10) / 10,
      units: Math.round(dayUnits * 100) / 100,
      servingSize: wetUnitGrams,
      mealsBreakdown,
      // Legacy fields
      breakfastKcal: Math.round(perMealTarget * 10) / 10,
      dinnerKcal: Math.round(perMealTarget * 10) / 10,
      breakfastWetGrams: Math.round((wetKcalPerMeal[0] || 0) / Math.max(1e-6, wetKcalPerGram)),
      breakfastDryGrams: Math.round((dryKcalPerMeal[0] || 0) * dryGramsPerKcal),
      dinnerWetGrams: Math.round((wetKcalPerMeal[1] || 0) / Math.max(1e-6, wetKcalPerGram)),
      dinnerDryGrams: Math.round((dryKcalPerMeal[1] || 0) * dryGramsPerKcal),
    }
  })

  return dailyData
}