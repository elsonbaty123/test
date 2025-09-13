import { renderHook, act } from '@testing-library/react'
import { useCatNutrition } from '@/hooks/useCatNutrition'

describe('useCatNutrition', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('RER Calculation', () => {
    it('calculates RER correctly for 4kg cat', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('activity', 'moderate')
        result.current.handleCatDataChange('neuter', 'neutered')
        result.current.handleCatDataChange('lifeStage', 'adult')
        result.current.handleCatDataChange('bcs', 5)
        result.current.handleCatDataChange('weightGoal', 'maintain')
        result.current.handleCatDataChange('specialCond', 'none')
        result.current.handleFoodDataChange('dry100', '380')
        result.current.handleFoodDataChange('wetMode', 'per100')
        result.current.handleFoodDataChange('wet100', '80')
        result.current.handleFoodDataChange('wetUnitGrams', '85')
        result.current.calculateNutrition()
      })

      expect(result.current.results?.rer).toBeCloseTo(247, 0) // 70 * 4^0.75 ≈ 247
    })

    it('calculates RER for extreme weights', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '0.5') // Kitten
        // ... minimal setup
        result.current.calculateNutrition()
      })
      expect(result.current.results?.rer).toBeGreaterThan(0)

      await act(async () => {
        result.current.handleCatDataChange('weight', '15') // Large cat
        result.current.calculateNutrition()
      })
      expect(result.current.results?.rer).toBeGreaterThan(600)
    })
  })

  describe('MER Factor Calculation', () => {
    it('applies correct MER factor for neutered adult moderate activity', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('activity', 'moderate')
        result.current.handleCatDataChange('neuter', 'neutered')
        result.current.handleCatDataChange('lifeStage', 'adult')
        result.current.handleCatDataChange('bcs', 5)
        result.current.handleCatDataChange('weightGoal', 'maintain')
        result.current.handleCatDataChange('specialCond', 'none')
        result.current.calculateNutrition()
      })

      // Moderate activity = 1.4x RER for neutered adult
      expect(result.current.results?.factor).toBeCloseTo(1.4, 1)
    })

    it('applies higher factor for intact cats', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('activity', 'moderate')
        result.current.handleCatDataChange('neuter', 'intact') // +10%
        result.current.handleCatDataChange('lifeStage', 'adult')
        result.current.calculateNutrition()
      })

      expect(result.current.results?.factor).toBeCloseTo(1.54, 1) // 1.4 * 1.1
    })

    it('applies Sphynx metabolism adjustment', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('breed', 'sphynx')
        result.current.handleCatDataChange('activity', 'moderate')
        result.current.handleCatDataChange('neuter', 'neutered')
        result.current.handleCatDataChange('lifeStage', 'adult')
        result.current.calculateNutrition()
      })

      // Sphynx +15% metabolism
      expect(result.current.results?.factor).toBeCloseTo(1.61, 1) // 1.4 * 1.15
    })

    it('handles kitten growth factors', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '1')
        result.current.handleCatDataChange('ageValue', '2')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.handleCatDataChange('activity', 'high')
        result.current.handleCatDataChange('neuter', 'intact')
        result.current.calculateNutrition()
      })

      // Young kitten: 2.5x * high activity 1.8x = 4.5x
      expect(result.current.results?.factor).toBeCloseTo(4.5, 1)
    })
  })

  describe('Special Conditions', () => {
    it('validates pregnancy only for females of breeding age', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('sex', 'female')
        result.current.handleCatDataChange('ageValue', '6')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.handleCatDataChange('specialCond', 'pregnant')
        result.current.calculateNutrition()
      })

      expect(result.current.errors).toContain("الحمل/الرضاعة عادة بعد سن 8 أشهر")
    })

    it('validates lactation kitten count limits', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('sex', 'female')
        result.current.handleCatDataChange('ageValue', '12')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.handleCatDataChange('specialCond', 'lactating')
        result.current.handleCatDataChange('lacKittens', '10') // Too many
        result.current.calculateNutrition()
      })

      expect(result.current.errors).toContain("عدد الصغار عادة 1-8")
    })

    it('applies CKD stage adjustments', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('ageValue', '120')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.handleCatDataChange('specialCond', 'ckd')
        // Set CKD stage via specialDetails
        result.current.handleCatDataChange('specialDetails', { ckdStage: 4 })
        result.current.calculateNutrition()
      })

      // Stage 4 CKD: 0.6x RER
      expect(result.current.results?.factor).toBeCloseTo(0.6, 1)
    })

    it('warns for young cats with senior conditions', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('ageValue', '12')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.handleCatDataChange('specialCond', 'ckd')
        result.current.calculateNutrition()
      })

      expect(result.current.errors).toContain("CKD نادر في القطط تحت 5 سنوات")
    })
  })

  describe('Breed Weight Validation', () => {
    it('calculates ideal weight for Maine Coon', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '8')
        result.current.handleCatDataChange('breed', 'maine_coon')
        result.current.handleCatDataChange('sex', 'male')
        result.current.handleCatDataChange('ageValue', '24')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.calculateNutrition()
      })

      // Maine Coon male range: 6.0-11.0kg, 8kg is within range
      expect(result.current.results?.weightStatus).toBe('ok')
      expect(result.current.results?.weightRange).toEqual([6.0, 11.0])
    })

    it('flags underweight for small breeds', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '1.5')
        result.current.handleCatDataChange('breed', 'devon_rex')
        result.current.handleCatDataChange('sex', 'female')
        result.current.handleCatDataChange('ageValue', '24')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.calculateNutrition()
      })

      // Devon Rex female range: 2.0-3.5kg, 1.5kg is underweight
      expect(result.current.results?.weightStatus).toBe('low')
    })
  })

  describe('Input Validation', () => {
    it('rejects invalid weight inputs', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '') // Empty
        result.current.calculateNutrition()
      })
      expect(result.current.errors).toContain("الرجاء إدخال الوزن (كجم)")

      await act(async () => {
        result.current.handleCatDataChange('weight', '-1') // Negative
        result.current.calculateNutrition()
      })
      expect(result.current.errors).toContain("الوزن يجب أن يكون بين 0.5 و 25 كجم")

      await act(async () => {
        result.current.handleCatDataChange('weight', '30') // Too heavy
        result.current.calculateNutrition()
      })
      expect(result.current.errors).toContain("الوزن يجب أن يكون بين 0.5 و 25 كجم")
    })

    it('rejects invalid food calorie inputs', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleFoodDataChange('dry100', '') // Empty
        result.current.calculateNutrition()
      })
      expect(result.current.errors).toContain("الرجاء إدخال سعرات الدراي")

      await act(async () => {
        result.current.handleFoodDataChange('dry100', '100') // Too low
        result.current.calculateNutrition()
      })
      expect(result.current.errors).toContain("سعرات الدراي يجب أن تكون بين 200 و 600")

      await act(async () => {
        result.current.handleFoodDataChange('dry100', '700') // Too high
        result.current.calculateNutrition()
      })
      expect(result.current.errors).toContain("سعرات الدراي يجب أن تكون بين 200 و 600")
    })

    it('validates weight goal conflicts', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '3')
        result.current.handleCatDataChange('breed', 'siamese')
        result.current.handleCatDataChange('sex', 'female')
        result.current.handleCatDataChange('ageValue', '24')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.handleCatDataChange('weightGoal', 'loss') // Conflict: underweight
        result.current.calculateNutrition()
      })

      expect(result.current.errors).toContain("لا يمكن اختيار نظام تخسيس والوزن الحالي أقل من المثالي")
    })

    it('validates meal count limits', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('meals', '7') // Too many meals
        result.current.calculateNutrition()
      })
      expect(result.current.errors).toContain("عدد الوجبات يجب أن يكون بين 1 و 6")
    })
  })

  describe('Edge Cases', () => {
    it('handles zero wet days correctly', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleWeeklyPlanChange('wetDaysCount', 0)
        result.current.calculateNutrition()
      })

      expect(result.current.results?.boxSummary?.unitsUsed).toBe(0)
      expect(result.current.results?.weeklyData?.every(day => day.wetGrams === 0)).toBe(true)
    })

    it('handles maximum lactation scenario', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4.5')
        result.current.handleCatDataChange('sex', 'female')
        result.current.handleCatDataChange('ageValue', '18')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.handleCatDataChange('specialCond', 'lactating')
        result.current.handleCatDataChange('lacWeek', '4') // Peak week
        result.current.handleCatDataChange('lacKittens', '6') // Large litter
        result.current.calculateNutrition()
      })

      // Peak lactation week 4 with 6 kittens: ~3.5x RER
      expect(result.current.results?.factor).toBeGreaterThan(3.0)
      expect(result.current.results?.factor).toBeLessThan(4.0)
    })

    it('handles conflicting medical conditions gracefully', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('sex', 'male')
        result.current.handleCatDataChange('specialCond', 'pregnant')
        result.current.calculateNutrition()
      })

      expect(result.current.errors).toContain("الحمل غير ممكن للذكور")
      expect(result.current.results).toBeNull()
    })

    it('senior cat without conditions gets screening reminder', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleCatDataChange('ageValue', '15')
        result.current.handleCatDataChange('ageUnit', 'years')
        result.current.handleCatDataChange('specialCond', 'none')
        result.current.calculateNutrition()
      })

      expect(result.current.errors).toContain("قطة كبيرة سنًا (12+ سنة)")
    })
  })

  describe('Breed-Specific Calculations', () => {
    it('Savannah cat uses large breed ranges', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '10')
        result.current.handleCatDataChange('breed', 'savannah')
        result.current.handleCatDataChange('sex', 'male')
        result.current.handleCatDataChange('ageValue', '24')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.calculateNutrition()
      })

      // Savannah male range: 6.0-13.0kg
      expect(result.current.results?.weightRange).toEqual([6.0, 13.0])
      expect(result.current.results?.weightStatus).toBe('ok')
    })

    it('Devon Rex flags very small cats', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '1.5')
        result.current.handleCatDataChange('breed', 'devon_rex')
        result.current.handleCatDataChange('sex', 'female')
        result.current.handleCatDataChange('ageValue', '24')
        result.current.handleCatDataChange('ageUnit', 'months')
        result.current.calculateNutrition()
      })

      // Devon Rex female range: 2.0-3.5kg
      expect(result.current.results?.weightStatus).toBe('low')
      expect(result.current.results?.idealWeight).toBeCloseTo(2.75, 1)
    })
  })

  describe('Box Builder Edge Cases', () => {
    it('handles custom box with zero days', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleBoxBuilderChange('boxType', 'custom')
        result.current.handleBoxBuilderChange('customDays', 0)
        result.current.calculateNutrition()
      })

      expect(result.current.results?.boxSummary?.totalDays).toBe(30) // Should default to 30
    })

    it('fixed wet units override auto calculation', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.handleWeeklyPlanChange('wetDaysCount', 3)
        result.current.handleBoxBuilderChange('boxWetMode', 'fixed_total')
        result.current.handleBoxBuilderChange('boxTotalUnits', 5)
        result.current.calculateNutrition()
      })

      expect(result.current.results?.boxSummary?.unitsUsed).toBe(5)
    })
  })

  describe('Error Recovery', () => {
    it('clears errors when valid input provided', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      // First cause an error
      await act(async () => {
        result.current.handleCatDataChange('weight', '')
        result.current.calculateNutrition()
      })
      expect(result.current.errors.length).toBeGreaterThan(0)

      // Fix the error
      await act(async () => {
        result.current.handleCatDataChange('weight', '4')
        result.current.calculateNutrition()
      })

      expect(result.current.errors.length).toBe(0)
      expect(result.current.results).not.toBeNull()
    })

    it('maintains state during validation failures', async () => {
      const { result } = renderHook(() => useCatNutrition())
      
      // Set some state
      await act(async () => {
        result.current.handleCatDataChange('name', 'Luna')
        result.current.handleCatDataChange('breed', 'siamese')
      })

      // Cause validation error
      await act(async () => {
        result.current.handleCatDataChange('weight', '')
        result.current.calculateNutrition()
      })

      // State should be preserved
      expect(result.current.catData.name).toBe('Luna')
      expect(result.current.catData.breed).toBe('siamese')
    })
  })
})