export interface UserHealthData {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  bmi: number;
  bmiStatus: string;
  tdee: number;
}

export type ActivityLevel = 
  | 'sedentary' 
  | 'light' 
  | 'moderate' 
  | 'active' 
  | 'veryActive';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

export function getBMIStatus(bmi: number): string {
  if (bmi < 18.5) return 'Berat Badan Kurang';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Kelebihan Berat Badan';
  return 'Obesitas';
}

export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  // Harris-Benedict Equation
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}
