
'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'

interface CatData {
  name: string;
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
  priceDryPerKg:
