import type { MealPlanPreset } from '../types';

export const PRESET_MEAL_PLANS: MealPlanPreset[] = [
  {
    id: 'plan_cutting_1800',
    title: 'תפריט חיטוב ושריפת שומן',
    subtitle: '1,800 קק"ל | עתיר חלבון',
    description: 'מותאם במיוחד לירידה מבוקרת באחוזי שומן תוך שמירה מרבית על מסת השריר ושובע לאורך היום.',
    targetGoal: 'lose_weight',
    totalCalories: 1800,
    protein: 155,
    carbs: 150,
    fat: 55,
    badge: 'הכי פופולרי',
    meals: [
      {
        mealType: 'breakfast',
        items: [
          { foodId: 'food_2', name: '2 ביצים L קשות', amountDesc: '2 ביצים (120 גרם)', grams: 120, calories: 172, protein: 15, carbs: 1, fat: 11 },
          { foodId: 'food_15', name: '2 פרוסות לחם שיפון קל', amountDesc: '2 פרוסות (60 גרם)', grams: 60, calories: 96, protein: 4, carbs: 17, fat: 1 },
          { foodId: 'food_24', name: 'סלט ירקות ישראלי', amountDesc: 'קערה בינונית (200 גרם)', grams: 200, calories: 50, protein: 2, carbs: 9, fat: 1 },
          { foodId: 'food_19', name: 'שמן זית', amountDesc: '1 כפית (5 גרם)', grams: 5, calories: 44, protein: 0, carbs: 0, fat: 5 },
        ]
      },
      {
        mealType: 'lunch',
        items: [
          { foodId: 'food_1', name: 'חזה עוף צלוי', amountDesc: 'מנה גדולה (200 גרם)', grams: 200, calories: 330, protein: 62, carbs: 0, fat: 7 },
          { foodId: 'food_10', name: 'אורז בסמטי מבושל', amountDesc: '1 כוס (150 גרם)', grams: 150, calories: 195, protein: 4, carbs: 42, fat: 0.5 },
          { foodId: 'food_26', name: 'ברוקולי מאודה', amountDesc: '1 כוס (100 גרם)', grams: 100, calories: 35, protein: 3, carbs: 7, fat: 0.4 },
          { foodId: 'food_18', name: 'טחינה גולמית', amountDesc: '1 כף (15 גרם)', grams: 15, calories: 96, protein: 3.6, carbs: 1.6, fat: 8.5 },
        ]
      },
      {
        mealType: 'dinner',
        items: [
          { foodId: 'food_3', name: 'טונה במי מלח', amountDesc: '1 קופסה (112 גרם)', grams: 112, calories: 122, protein: 28, carbs: 0, fat: 1.1 },
          { foodId: 'food_17', name: 'חצי אבוקדו בשל', amountDesc: '75 גרם', grams: 75, calories: 120, protein: 1.5, carbs: 6.4, fat: 11 },
          { foodId: 'food_13', name: 'פיתה קלה מחיטה מלאה', amountDesc: '1 פיתה (75 גרם)', grams: 75, calories: 131, protein: 6.4, carbs: 24, fat: 0.9 },
          { foodId: 'food_24', name: 'סלט ירקות רענן', amountDesc: '150 גרם', grams: 150, calories: 38, protein: 1.5, carbs: 6.7, fat: 0.5 },
        ]
      },
      {
        mealType: 'snack',
        items: [
          { foodId: 'food_5', name: 'יוגורט PRO 20g חלבון', amountDesc: 'גביע (200 גרם)', grams: 200, calories: 120, protein: 20, carbs: 9.6, fat: 0.2 },
          { foodId: 'food_25', name: 'תותים טריים', amountDesc: 'כוס (150 גרם)', grams: 150, calories: 48, protein: 1, carbs: 11.5, fat: 0.5 },
          { foodId: 'food_20', name: 'שקדים טבעיים', amountDesc: '15 גרם', grams: 15, calories: 87, protein: 3.1, carbs: 3.3, fat: 7.5 },
        ]
      }
    ]
  },
  {
    id: 'plan_muscle_2400',
    title: 'תפריט עלייה במסה (Lean Bulk)',
    subtitle: '2,400 קק"ל | אנרגיה ובנייה',
    description: 'מיועד לספורטאים ומתאמנים המעוניינים בעלייה איכותית במסת שריר ובשיפור ביצועי כוח.',
    targetGoal: 'gain_muscle',
    totalCalories: 2400,
    protein: 175,
    carbs: 275,
    fat: 65,
    badge: 'למתאמנים',
    meals: [
      {
        mealType: 'breakfast',
        items: [
          { foodId: 'food_11', name: 'שיבולת שועל', amountDesc: '60 גרם', grams: 60, calories: 225, protein: 8, carbs: 37, fat: 4.2 },
          { foodId: 'food_6', name: 'אבקת חלבון מי גבינה', amountDesc: '1 סקופ (33 גרם)', grams: 33, calories: 125, protein: 26, carbs: 2, fat: 1.3 },
          { foodId: 'food_22', name: 'בננה טרייה', amountDesc: 'יחידה בינונית (120 גרם)', grams: 120, calories: 107, protein: 1.3, carbs: 27.6, fat: 0.4 },
          { foodId: 'food_21', name: 'חמאת בוטנים טבעית', amountDesc: '1 כף (20 גרם)', grams: 20, calories: 118, protein: 5, carbs: 3.6, fat: 10 },
        ]
      },
      {
        mealType: 'lunch',
        items: [
          { foodId: 'food_8', name: 'בשר בקר טחון רזה', amountDesc: '200 גרם', grams: 200, calories: 290, protein: 52, carbs: 0, fat: 9 },
          { foodId: 'food_10', name: 'אורז בסמטי מבושל', amountDesc: '2 כוסות (300 גרם)', grams: 300, calories: 390, protein: 8.1, carbs: 84, fat: 0.9 },
          { foodId: 'food_26', name: 'ברוקולי מאודה', amountDesc: '150 גרם', grams: 150, calories: 52, protein: 4.2, carbs: 10.5, fat: 0.6 },
          { foodId: 'food_19', name: 'שמן זית', amountDesc: '1 כף (10 גרם)', grams: 10, calories: 88, protein: 0, carbs: 0, fat: 10 },
        ]
      },
      {
        mealType: 'dinner',
        items: [
          { foodId: 'food_7', name: 'פילה סלמון אפוי', amountDesc: '200 גרם', grams: 200, calories: 416, protein: 40, carbs: 0, fat: 26 },
          { foodId: 'food_12', name: 'בטטה אפויה', amountDesc: '200 גרם', grams: 200, calories: 180, protein: 4, carbs: 41.4, fat: 0.4 },
          { foodId: 'food_24', name: 'סלט ירקות עשיר', amountDesc: '200 גרם', grams: 200, calories: 50, protein: 2, carbs: 9, fat: 1 },
        ]
      },
      {
        mealType: 'snack',
        items: [
          { foodId: 'food_27', name: 'חטיף חלבון Barebells', amountDesc: 'חטיף (55 גרם)', grams: 55, calories: 198, protein: 20, carbs: 15, fat: 7.7 },
          { foodId: 'food_23', name: 'תפוח עץ ירוק', amountDesc: '150 גרם', grams: 150, calories: 78, protein: 0.5, carbs: 21, fat: 0.3 },
        ]
      }
    ]
  },
  {
    id: 'plan_balance_2000',
    title: 'תפריט ים-תיכוני מאוזן',
    subtitle: '2,000 קק"ל | בריאות ואורח חיים',
    description: 'מבוסס על עקרונות הדיאטה הים-תיכונית: עושר בירקות, שומנים בריאים, קטניות, דגים ודגנים מלאים.',
    targetGoal: 'maintain',
    totalCalories: 2000,
    protein: 130,
    carbs: 210,
    fat: 68,
    badge: 'אורח חיים',
    meals: [
      {
        mealType: 'breakfast',
        items: [
          { foodId: 'food_4', name: 'גבינת קוטג\' 5%', amountDesc: 'חצי גביע (125 גרם)', grams: 125, calories: 119, protein: 13.8, carbs: 3.1, fat: 6.2 },
          { foodId: 'food_13', name: 'פיתה מלאה', amountDesc: 'פיתה (75 גרם)', grams: 75, calories: 131, protein: 6.4, carbs: 24, fat: 0.9 },
          { foodId: 'food_2', name: 'ביצה קשה L', amountDesc: '1 ביצה (60 גרם)', grams: 60, calories: 86, protein: 7.5, carbs: 0.4, fat: 5.7 },
          { foodId: 'food_24', name: 'ירקות חתוכים', amountDesc: '150 גרם', grams: 150, calories: 38, protein: 1.5, carbs: 6.7, fat: 0.5 },
        ]
      },
      {
        mealType: 'lunch',
        items: [
          { foodId: 'food_7', name: 'פילה סלמון עשבי תיבול', amountDesc: '180 גרם', grams: 180, calories: 374, protein: 36, carbs: 0, fat: 23.4 },
          { foodId: 'food_16', name: 'קינואה מבושלת', amountDesc: 'כוס וחצי (250 גרם)', grams: 250, calories: 300, protein: 11, carbs: 53.2, fat: 4.7 },
          { foodId: 'food_26', name: 'ברוקולי וירקות ירוקים', amountDesc: '150 גרם', grams: 150, calories: 52, protein: 4.2, carbs: 10.5, fat: 0.6 },
        ]
      },
      {
        mealType: 'dinner',
        items: [
          { foodId: 'food_3', name: 'סלט טונה עשיר', amountDesc: '112 גרם טונה', grams: 112, calories: 122, protein: 28, carbs: 0, fat: 1.1 },
          { foodId: 'food_17', name: 'אבוקדו', amountDesc: '75 גרם', grams: 75, calories: 120, protein: 1.5, carbs: 6.4, fat: 11 },
          { foodId: 'food_15', name: '2 פרוסות לחם מלא', amountDesc: '60 גרם', grams: 60, calories: 96, protein: 4, carbs: 17, fat: 1 },
          { foodId: 'food_24', name: 'סלט ישראלי', amountDesc: '150 גרם', grams: 150, calories: 38, protein: 1.5, carbs: 6.7, fat: 0.5 },
        ]
      },
      {
        mealType: 'snack',
        items: [
          { foodId: 'food_22', name: 'בננה', amountDesc: '120 גרם', grams: 120, calories: 107, protein: 1.3, carbs: 27.6, fat: 0.4 },
          { foodId: 'food_20', name: 'שקדים טבעיים', amountDesc: '20 גרם', grams: 20, calories: 116, protein: 4.2, carbs: 4.4, fat: 10 },
          { foodId: 'food_28', name: 'שוקולד מריר 85%', amountDesc: '2 קוביות (20 גרם)', grams: 20, calories: 116, protein: 2.2, carbs: 4, fat: 9.6 },
        ]
      }
    ]
  }
];
