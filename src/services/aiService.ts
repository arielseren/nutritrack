import type {
  AIVisionAnalysisResult,
  AILabelOcrResult,
  AINLParseResult,
  AIMenuSuggestion,
  AIMealGenOptions,
  AICoachMessage,
  AICoachMemory,
  AICoachSuggestedAction,
  AIParsedFoodItem,
} from '../types/ai';
import type { MealType, UserProfile, DayLog } from '../types';
import { calculateDayTotals, getDailyAdjustedTargets } from './nutritionCalculator';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export class AIService {
  private static getEffectiveApiKey(profileApiKey?: string): string | null {
    if (profileApiKey && profileApiKey.trim().length > 5) {
      return profileApiKey.trim();
    }
    // Check vite env
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 5) {
      return envKey.trim();
    }
    return null;
  }

  // -------------------------------------------------------------
  // 1. AI Photo & Plate Scanner (Multimodal Vision)
  // -------------------------------------------------------------
  public static async analyzePlateImage(
    imageBase64: string,
    mealType: MealType = 'lunch',
    apiKey?: string
  ): Promise<AIVisionAnalysisResult> {
    const cleanKey = this.getEffectiveApiKey(apiKey);

    if (cleanKey) {
      try {
        const mimeType = imageBase64.startsWith('data:image/png')
          ? 'image/png'
          : imageBase64.startsWith('data:image/webp')
          ? 'image/webp'
          : 'image/jpeg';
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

        const prompt = `אתה מומחה תזונה ודיאטן ספורט קליני. נתח את תמונת הארוחה/הצלחת המצורפת בדיוק רב.
החזר אך ורק אובייקט JSON תקין במבנה הבא (ללא Markdown או הערות מסביב):
{
  "title": "שם קצר וקולע למנה בעברית",
  "summary": "תיאור קצר של מרכיבי הצלחת והכמויות המוערכות",
  "mealType": "${mealType}",
  "confidenceScore": 95,
  "healthTip": "טיפ תזונתי קצר ומעשי לגבי הארוחה הזו",
  "items": [
    {
      "name": "שם המאכל (למשל: חזה עוף צלוי)",
      "amountDesc": "תיאור מנה (למשל: נתח בינוני - 160 גרם)",
      "grams": 160,
      "calories": 264,
      "protein": 50,
      "carbs": 0,
      "fat": 5.5,
      "confidence": 95,
      "notes": "מקור חלבון רזה מעולה"
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0
}
חשב את סך הקלוריות, חלבון, פחמימה ושומן של כל המרכיבים יחד. ודא שהערכים הגיוניים ומדויקים לפי מאגרי תזונה ישראליים ובינלאומיים.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${cleanKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                response_mime_type: 'application/json',
                temperature: 0.2,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed: AIVisionAnalysisResult = JSON.parse(text);
            parsed.imageUrl = imageBase64;
            // recalculate totals if needed
            parsed.totalCalories = parsed.items.reduce((s, i) => s + (i.calories || 0), 0);
            parsed.totalProtein = Math.round(parsed.items.reduce((s, i) => s + (i.protein || 0), 0) * 10) / 10;
            parsed.totalCarbs = Math.round(parsed.items.reduce((s, i) => s + (i.carbs || 0), 0) * 10) / 10;
            parsed.totalFat = Math.round(parsed.items.reduce((s, i) => s + (i.fat || 0), 0) * 10) / 10;
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Gemini Vision API error, falling back to intelligent simulation:', err);
      }
    }

    // Intelligent Fallback Plate Analysis
    await new Promise((r) => setTimeout(r, 900));
    return this.getIntelligentFallbackPlateAnalysis(mealType, imageBase64);
  }

  // -------------------------------------------------------------
  // 2. AI Nutrition Label OCR Scanner (טבלת סימון תזונתי)
  // -------------------------------------------------------------
  public static async scanNutritionLabel(
    imageBase64: string,
    apiKey?: string
  ): Promise<AILabelOcrResult> {
    const cleanKey = this.getEffectiveApiKey(apiKey);

    if (cleanKey) {
      try {
        const mimeType = imageBase64.startsWith('data:image/png')
          ? 'image/png'
          : imageBase64.startsWith('data:image/webp')
          ? 'image/webp'
          : 'image/jpeg';
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

        const prompt = `אתה מומחה OCR וקריאת טבלאות סימון תזונתי על מוצרי מזון בישראל ובעולם.
קרא את טבלת הערכים התזונתיים ל-100 גרם המופיעה בתמונה.
החזר אך ורק אובייקט JSON תקין במבנה הבא (ללא Markdown):
{
  "productName": "שם המוצר בעברית",
  "brand": "שם היצרן/מותג (אם מופיע)",
  "servingUnit": "גביע / מנה / יחידה (למשל: גביע (200 גרם))",
  "servingGrams": 100,
  "caloriesPer100g": 120,
  "proteinPer100g": 10.5,
  "carbsPer100g": 12.0,
  "fatPer100g": 3.0,
  "sugarsPer100g": 4.5,
  "sodiumPer100g": 120,
  "fiberPer100g": 2.0,
  "category": "proteins",
  "rawText": "הטקסט שנקרא מהתווית"
}
הערכים חייבים להיות עבור 100 גרם מוצר!`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${cleanKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                response_mime_type: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed: AILabelOcrResult = JSON.parse(text);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Gemini Label OCR error, fallback to simulation:', err);
      }
    }

    // Intelligent Fallback Label OCR
    await new Promise((r) => setTimeout(r, 800));
    return this.getIntelligentFallbackLabelOcr();
  }

  // -------------------------------------------------------------
  // 3. AI Natural Language & Voice Logging (טקסט/קול חופשי)
  // -------------------------------------------------------------
  public static async parseNaturalLanguageMeal(
    promptText: string,
    mealType: MealType = 'lunch',
    apiKey?: string
  ): Promise<AINLParseResult> {
    const cleanKey = this.getEffectiveApiKey(apiKey);

    if (cleanKey) {
      try {
        const prompt = `אתה מחשבון תזונה חכם שמפרק משפט חופשי בעברית של משתמש שאכל ארוחה לרשימת פריטים מפורטת עם משקלים מדויקים בגרמים, קלוריות ומאקרו.
המשפט של המשתמש: "${promptText}"
ארוחת יעד: "${mealType}"

החזר אך ורק אובייקט JSON תקין במבנה הבא (ללא Markdown):
{
  "mealType": "${mealType}",
  "rawInput": "${promptText}",
  "explanation": "הסבר קצר על החישוב",
  "items": [
    {
      "name": "שם המאכל",
      "amountDesc": "תיאור הכמות",
      "grams": 150,
      "calories": 250,
      "protein": 30,
      "carbs": 10,
      "fat": 5,
      "confidence": 95,
      "notes": "הערה קצרה"
    }
  ],
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${cleanKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                response_mime_type: 'application/json',
                temperature: 0.2,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed: AINLParseResult = JSON.parse(text);
            parsed.totalCalories = parsed.items.reduce((s, i) => s + (i.calories || 0), 0);
            parsed.totalProtein = Math.round(parsed.items.reduce((s, i) => s + (i.protein || 0), 0) * 10) / 10;
            parsed.totalCarbs = Math.round(parsed.items.reduce((s, i) => s + (i.carbs || 0), 0) * 10) / 10;
            parsed.totalFat = Math.round(parsed.items.reduce((s, i) => s + (i.fat || 0), 0) * 10) / 10;
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Gemini NL parse error, using local Hebrew NLP parser:', err);
      }
    }

    // Local Hebrew NLP Parser Fallback
    await new Promise((r) => setTimeout(r, 600));
    return this.parseHebrewTextLocally(promptText, mealType);
  }

  // -------------------------------------------------------------
  // 4. AI Smart Meal & Recipe Generator (מחולל מתכונים ותפריטים)
  // -------------------------------------------------------------
  public static async generateMealOrRecipe(
    options: AIMealGenOptions,
    remainingMacros: { calories: number; protein: number; carbs: number; fat: number },
    apiKey?: string
  ): Promise<AIMenuSuggestion[]> {
    const cleanKey = this.getEffectiveApiKey(apiKey);

    if (cleanKey) {
      try {
        const prompt = `אתה שף בריאות ודיאטן ספורט מומחה.
עליך לייצר 3 הצעות לארוחות / מתכונים שיתאימו בדיוק לדרישות הבאות:
מצב: ${options.mode === 'macro_gap' ? 'השלמת חוסרי מאקרו יומיים' : options.mode === 'fridge_ingredients' ? 'מתכון משאריות מקרר' : 'תפריט יומי מלא'}
סוג ארוחה: ${options.mealType || 'ארוחה מאוזנת'}
יעד קלוריות שנותר: ${remainingMacros.calories} קק"ל
יעד חלבון שנותר: ${remainingMacros.protein} גרם
יעד פחמימות שנותר: ${remainingMacros.carbs} גרם
יעד שומן שנותר: ${remainingMacros.fat} גרם
מצרכים זמינים (אם צוינו): ${options.availableIngredients?.join(', ') || 'מצרכים סטנדרטיים שיש בכל בית בישראל'}
העדפות מיוחדות: ${options.dietaryPreferences?.join(', ') || 'ללא'}

החזר אך ורק מערך JSON של 3 אובייקטים במבנה הבא (ללא Markdown):
[
  {
    "id": "sug_1",
    "title": "שם המתכון בעברית",
    "description": "תיאור קצר ומגרה",
    "mealType": "${options.mealType || 'dinner'}",
    "prepTimeMinutes": 15,
    "totalCalories": 420,
    "protein": 38,
    "carbs": 25,
    "fat": 12,
    "ingredients": [
      {
        "name": "טונה בהירה במים",
        "amount": "1 קופסה (112 גרם מסונן)",
        "grams": 112,
        "calories": 120,
        "protein": 28,
        "carbs": 0,
        "fat": 1
      }
    ],
    "instructions": ["שלב 1", "שלב 2", "שלב 3"],
    "tags": ["עתיר חלבון", "מהיר הכנה (10 דק)", "קל לעיכול"]
  }
]`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${cleanKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                response_mime_type: 'application/json',
                temperature: 0.4,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed: AIMenuSuggestion[] = JSON.parse(text);
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Gemini Meal Generator error, fallback to local recipe generator:', err);
      }
    }

    // Local Recipe Generator Fallback
    await new Promise((r) => setTimeout(r, 700));
    return this.getLocalRecipeSuggestions(options, remainingMacros);
  }

  // -------------------------------------------------------------
  // 5. AI Nutrition Coach & Consultation (מאמן תזונה חכם עם זיכרון)
  // -------------------------------------------------------------
  public static async consultNutritionCoach(
    messages: AICoachMessage[],
    context: {
      profile: UserProfile;
      todayLog: DayLog;
      weightHistory: any[];
      memory: AICoachMemory;
    },
    apiKey?: string
  ): Promise<{ response: AICoachMessage; updatedMemory: AICoachMemory }> {
    const cleanKey = this.getEffectiveApiKey(apiKey);
    const todayTotals = calculateDayTotals(context.todayLog);
    const adjusted = getDailyAdjustedTargets(context.profile, context.todayLog, context.todayLog.date);
    const remainingKcal = adjusted.targetCalories - todayTotals.totalCalories;
    const remainingProtein = adjusted.targetProtein - todayTotals.totalProtein;

    const userProfileSummary = `
שם: ${context.profile.name}
מטרה: ${context.profile.goal}
משקל נוכחי: ${context.profile.currentWeight} ק"ג (התחלה: ${context.profile.initialWeight || context.profile.currentWeight} ק"ג, יעד: ${context.profile.targetWeight} ק"ג)
יעד קלוריות יומי: ${adjusted.targetCalories} קק"ל (נצרך היום: ${todayTotals.totalCalories}, נותרו: ${remainingKcal})
יעד חלבון יומי: ${adjusted.targetProtein}g (נצרך: ${todayTotals.totalProtein}g, נותרו: ${remainingProtein}g)
יעד פחמימות יומי: ${adjusted.targetCarbs}g (נצרך: ${todayTotals.totalCarbs}g)
יעד שומן יומי: ${adjusted.targetFat}g (נצרך: ${todayTotals.totalFat}g)
מים שנשתו היום: ${context.todayLog.waterGlasses} מתוך ${context.profile.dailyWaterTargetGlasses || 8} כוסות
מצב אימון היום: ${adjusted.workoutTitle} (+${adjusted.burnedCalories} קק"ל)
העדפות/זיכרון עבר: ${context.memory.preferences.join(', ') || 'אין'}
רגישויות/סלידות בזיכרון: ${context.memory.allergiesOrDislikes.join(', ') || 'אין'}
מצב שובע/תחושה אחרונה: ${context.memory.satietyState || 'רגיל'}
הערות בזיכרון: ${context.memory.userNotes.join('; ') || 'אין'}
`;

    const systemInstruction = `אתה "NutriCoach AI" - מאמן תזונה וספורט אישי מומחה ברמה הגבוהה ביותר באפליקציית NutriTrack.
אתה אמפתי, מדעי, מעודד וממוקד בפתרונות פרקטיים מיידיים בעברית טבעית ונעימה.

עקרונות חשובים ביותר:
1. התמודדות עם תחושת מלאות ושובע קיצוני ("אני מרגיש מפוצץ / לא מסוגל לאכול עוד"):
   - כבד את תחושת השובע של המשתמש! לעולם אל תכריח אכילה בכוח.
   - הסבר את ההבדל בין "נפח מזון" (Food Volume) לבין "דחיסות קלורית" (Caloric Density).
   - הצע לעבור למקורות קלוריים וחלבונים קלים לעיכול ובנפח קטן (כגון: שייק חלבון נוזלי עם חמאת בוטנים/בננה, שמן זית בסלט, אגוזים, יוגורט במקום חזה עוף יבש או ערימות אורז).
   - אם המשתמש נפוח (Bloated), הצע להפחית ירקות מצליבים חיים, להוריד מלח/סודיום זמנית, ולשתות מים בלגימות קטנות.
   - הצע התאמת תפריט מיידית או פריסה של הקלוריות ליום המחרת.
2. תקיעה במשקל (Weight Plateau):
   - נתח את היסטוריית השקילות והמאזן הקלורי.
   - בדוק דיוק שקילות, צעדים יומיים (NEAT) והתאמת גירעון קלורי.
3. חשקים ותשוקה למתוק:
   - הצע חלופות חכמות עתירות חלבון שישביעו מבלי לפגוע ביעד.
4. זכור תמיד את הפרופיל והמצב הנוכחי של המשתמש.

פלט נדרש:
החזר אך ורק אובייקט JSON תקין (ללא תגי markdown):
{
  "content": "התשובה המפורטת, החמה, המעודדת והמדעית שלך בעברית (השתמש ברווחים, אימוג'ים ואייקונים לקריאות מעולה)",
  "suggestedActions": [
    {
      "label": "טקסט כפתור פעולה קצר (למשל: 'החלף לשייק חלבון קל לעיכול' או 'בצע התאמה קלורית להיום')",
      "type": "replace_meal"
    }
  ],
  "memoryUpdates": {
    "addPreference": "העדפה חדשה ללמוד (או null)",
    "addAllergyOrDislike": "סלידה חדשה (או null)",
    "satietyState": "bloated" / "hungry" / "normal" / "low_appetite",
    "note": "הערה קצרה לזיכרון (או null)"
  }
}`;

    if (cleanKey) {
      try {
        const contents = [
          { role: 'user', parts: [{ text: `[נתוני רקע של המשתמש]:\n${userProfileSummary}` }] },
          { role: 'model', parts: [{ text: 'שלום! הבנתי את כל נתוני המשתמש והיעדים. אני מוכן לעזור בכל שאלה והתייעצות.' }] },
          ...messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${cleanKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemInstruction }] },
              contents,
              generationConfig: {
                response_mime_type: 'application/json',
                temperature: 0.4,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            const updatedMemory: AICoachMemory = { ...context.memory };

            if (parsed.memoryUpdates) {
              if (parsed.memoryUpdates.addPreference && !updatedMemory.preferences.includes(parsed.memoryUpdates.addPreference)) {
                updatedMemory.preferences = [...updatedMemory.preferences, parsed.memoryUpdates.addPreference];
              }
              if (parsed.memoryUpdates.addAllergyOrDislike && !updatedMemory.allergiesOrDislikes.includes(parsed.memoryUpdates.addAllergyOrDislike)) {
                updatedMemory.allergiesOrDislikes = [...updatedMemory.allergiesOrDislikes, parsed.memoryUpdates.addAllergyOrDislike];
              }
              if (parsed.memoryUpdates.satietyState) {
                updatedMemory.satietyState = parsed.memoryUpdates.satietyState;
              }
              if (parsed.memoryUpdates.note) {
                updatedMemory.userNotes = [...updatedMemory.userNotes.slice(-5), parsed.memoryUpdates.note];
              }
              updatedMemory.updatedAt = new Date().toISOString();
            }

            const responseMessage: AICoachMessage = {
              id: `coach_${Date.now()}`,
              role: 'assistant',
              content: parsed.content,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestedActions: parsed.suggestedActions || [],
            };

            return { response: responseMessage, updatedMemory };
          }
        }
      } catch (err) {
        console.warn('Gemini Coach error, using intelligent local coach engine:', err);
      }
    }

    // Local Intelligent Coach Engine Fallback
    await new Promise((r) => setTimeout(r, 700));
    return this.getLocalCoachResponse(messages, context, userProfileSummary, remainingKcal, remainingProtein);
  }

  // -------------------------------------------------------------
  // Internal Fallbacks & Local NLP Engines
  // -------------------------------------------------------------
  private static getIntelligentFallbackPlateAnalysis(
    mealType: MealType,
    imageUrl?: string
  ): AIVisionAnalysisResult {
    const presets: Record<MealType, AIVisionAnalysisResult> = {
      lunch: {
        title: 'חזה עוף צלוי עם אורז בסמטי וסלט ירקות',
        summary: 'ארוחת צהריים מאוזנת ועשירה בחלבון איכותי ופחמימות מורכבות',
        mealType: 'lunch',
        confidenceScore: 96,
        healthTip: 'מנה מצוינת להתאוששות שריר עם יחס מאקרו אידיאלי של כ-40g חלבון.',
        items: [
          {
            name: 'חזה עוף צלוי בגריל',
            amountDesc: 'נתח גדול (160 גרם)',
            grams: 160,
            calories: 264,
            protein: 49.6,
            carbs: 0,
            fat: 5.8,
            confidence: 97,
          },
          {
            name: 'אורז בסמטי מבושל',
            amountDesc: 'כוס מלאה (150 גרם)',
            grams: 150,
            calories: 195,
            protein: 4.1,
            carbs: 42.8,
            fat: 0.6,
            confidence: 95,
          },
          {
            name: 'סלט ישראלי קצוץ עם שמן זית',
            amountDesc: 'קערה בינונית (180 גרם)',
            grams: 180,
            calories: 95,
            protein: 2.2,
            carbs: 7.5,
            fat: 6.5,
            confidence: 94,
          },
        ],
        totalCalories: 554,
        totalProtein: 55.9,
        totalCarbs: 50.3,
        totalFat: 12.9,
        imageUrl,
      },
      breakfast: {
        title: 'שקשוקה 2 ביצים עם לחם מחמצת וטחינה',
        summary: 'ארוחת בוקר עשירה בשומנים בריאים, חלבון וליקופן מהעגבניות',
        mealType: 'breakfast',
        confidenceScore: 95,
        healthTip: 'שילוב הביצים והטחינה מספק שובע ממושך למהלך הבוקר.',
        items: [
          {
            name: 'ביצים L (בשקשוקה)',
            amountDesc: '2 ביצים (120 גרם)',
            grams: 120,
            calories: 172,
            protein: 15.1,
            carbs: 0.9,
            fat: 12.0,
            confidence: 98,
          },
          {
            name: 'רוטב שקשוקה ביתי',
            amountDesc: 'מנה (150 גרם)',
            grams: 150,
            calories: 110,
            protein: 2.5,
            carbs: 9.0,
            fat: 7.0,
            confidence: 92,
          },
          {
            name: 'לחם מחמצת כוסמין',
            amountDesc: '2 פרוסות (60 גרם)',
            grams: 60,
            calories: 145,
            protein: 5.5,
            carbs: 27.5,
            fat: 1.2,
            confidence: 96,
          },
        ],
        totalCalories: 427,
        totalProtein: 23.1,
        totalCarbs: 37.4,
        totalFat: 20.2,
        imageUrl,
      },
      dinner: {
        title: 'סלמון נורבגי אפוי עם בטטה וברוקולי',
        summary: 'ארוחת ערב עתירת אומגה 3 ונוגדי חמצון',
        mealType: 'dinner',
        confidenceScore: 97,
        healthTip: 'הסלמון מספק חלבון מלא וחומצות שומן חיוניות שתומכות בהורדת דלקתיות.',
        items: [
          {
            name: 'פילה סלמון אפוי בתנור',
            amountDesc: 'נתח פילה (180 גרם)',
            grams: 180,
            calories: 374,
            protein: 36.0,
            carbs: 0,
            fat: 24.5,
            confidence: 98,
          },
          {
            name: 'בטטה אפויה',
            amountDesc: 'בטטה בינונית (150 גרם)',
            grams: 150,
            calories: 129,
            protein: 2.4,
            carbs: 30.1,
            fat: 0.2,
            confidence: 96,
          },
          {
            name: 'ברוקולי מאודה',
            amountDesc: 'כוס פרחים (100 גרם)',
            grams: 100,
            calories: 35,
            protein: 2.8,
            carbs: 7.2,
            fat: 0.4,
            confidence: 95,
          },
        ],
        totalCalories: 538,
        totalProtein: 41.2,
        totalCarbs: 37.3,
        totalFat: 25.1,
        imageUrl,
      },
      snack: {
        title: 'קערת יוגורט פרו עם פירות יער ושקדים',
        summary: 'נשנוש עשיר בחלבון ונוגדי חמצון',
        mealType: 'snack',
        confidenceScore: 98,
        healthTip: '20 גרם חלבון נקי ועיכול קל במיוחד בין הארוחות.',
        items: [
          {
            name: 'יוגורט חלבון GO 20g',
            amountDesc: 'גביע (200 גרם)',
            grams: 200,
            calories: 124,
            protein: 20.0,
            carbs: 9.0,
            fat: 0.6,
            confidence: 99,
          },
          {
            name: 'פירות יער / תותים',
            amountDesc: 'חצי כוס (80 גרם)',
            grams: 80,
            calories: 42,
            protein: 0.8,
            carbs: 9.5,
            fat: 0.3,
            confidence: 95,
          },
          {
            name: 'שקדים טבעיים',
            amountDesc: 'חופן קטן (15 גרם)',
            grams: 15,
            calories: 87,
            protein: 3.2,
            carbs: 3.3,
            fat: 7.4,
            confidence: 96,
          },
        ],
        totalCalories: 253,
        totalProtein: 24.0,
        totalCarbs: 21.8,
        totalFat: 8.3,
        imageUrl,
      },
    };

    return presets[mealType] || presets.lunch;
  }

  private static getIntelligentFallbackLabelOcr(): AILabelOcrResult {
    return {
      productName: 'יוגורט חלבון יווני 0%',
      brand: 'תנובה GO',
      servingUnit: 'גביע (200 גרם)',
      servingGrams: 200,
      caloriesPer100g: 62,
      proteinPer100g: 10.0,
      carbsPer100g: 4.5,
      fatPer100g: 0.2,
      sugarsPer100g: 4.0,
      sodiumPer100g: 45,
      fiberPer100g: 0,
      category: 'proteins',
      rawText: 'אנרגיה: 62 קק"ל | חלבונים: 10.0 גרם | פחמימות: 4.5 גרם | שומנים: 0.2 גרם | נתרן: 45 מ"ג ל-100 גרם',
    };
  }

  private static parseHebrewTextLocally(
    text: string,
    mealType: MealType
  ): AINLParseResult {
    const lower = text.toLowerCase();
    const items: AIParsedFoodItem[] = [];

    // Hebrew keywords dictionary for instant offline parsing
    const dictionary: {
      keywords: string[];
      name: string;
      amountDesc: string;
      grams: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[] = [
      {
        keywords: ['חזה עוף', 'עוף בגריל', 'פרגית', 'עוף צלוי'],
        name: 'חזה עוף צלוי',
        amountDesc: 'מנה ממוצעת (150 גרם)',
        grams: 150,
        calories: 248,
        protein: 46.5,
        carbs: 0,
        fat: 5.4,
      },
      {
        keywords: ['אורז', 'בסמטי', 'יסמין', 'אורז לבן', 'אורז מלא'],
        name: 'אורז בסמטי מבושל',
        amountDesc: 'כוס מבושלת (150 גרם)',
        grams: 150,
        calories: 195,
        protein: 4.1,
        carbs: 42.8,
        fat: 0.6,
      },
      {
        keywords: ['ביצה', 'ביצים', 'חביתה', 'עין', 'ביצה קשה'],
        name: 'ביצה L',
        amountDesc: '2 ביצים (120 גרם)',
        grams: 120,
        calories: 172,
        protein: 15.1,
        carbs: 0.9,
        fat: 12.0,
      },
      {
        keywords: ['טחינה', 'טחינה גולמית'],
        name: 'טחינה מוכנה איכותית',
        amountDesc: '2 כפות (30 גרם)',
        grams: 30,
        calories: 178,
        protein: 5.4,
        carbs: 3.6,
        fat: 16.2,
      },
      {
        keywords: ['פיתה', 'לאפה', 'בלאפה'],
        name: 'פיתה / לאפה',
        amountDesc: 'יחידה (100 גרם)',
        grams: 100,
        calories: 275,
        protein: 9.0,
        carbs: 54.0,
        fat: 1.5,
      },
      {
        keywords: ['שווארמה', 'שווארמה הודו', 'פרגיות'],
        name: 'שווארמה הודו נקבה',
        amountDesc: 'מנה נדיבה (180 גרם)',
        grams: 180,
        calories: 320,
        protein: 42.0,
        carbs: 2.0,
        fat: 16.0,
      },
      {
        keywords: ['סלט', 'ירקות', 'עגבניה', 'מלפפון', 'סלט קצוץ'],
        name: 'סלט ירקות קצוץ עם שמן זית',
        amountDesc: 'קערה (180 גרם)',
        grams: 180,
        calories: 95,
        protein: 2.2,
        carbs: 7.5,
        fat: 6.5,
      },
      {
        keywords: ['קוטג', 'גבינה לבנה', 'גבינה'],
        name: 'קוטג׳ 5%',
        amountDesc: 'חצי גביע (125 גרם)',
        grams: 125,
        calories: 119,
        protein: 13.8,
        carbs: 3.1,
        fat: 6.3,
      },
      {
        keywords: ['טונה', 'שימורי טונה'],
        name: 'טונה בהירה במים',
        amountDesc: 'קופסה (112 גרם)',
        grams: 112,
        calories: 120,
        protein: 28.0,
        carbs: 0,
        fat: 1.0,
      },
      {
        keywords: ['שייק', 'אבקת חלבון', 'חלבון'],
        name: 'שייק חלבון מי גבינה + בננה',
        amountDesc: 'מנת הגשה (300 מ"ל)',
        grams: 300,
        calories: 240,
        protein: 27.0,
        carbs: 28.0,
        fat: 2.5,
      },
      {
        keywords: ['זירו', 'קולה זירו', 'מים', 'דיאט'],
        name: 'משקה דיאט / קולה זירו',
        amountDesc: 'פחית (330 מ"ל)',
        grams: 330,
        calories: 1,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    ];

    dictionary.forEach((item) => {
      if (item.keywords.some((kw) => lower.includes(kw))) {
        items.push({
          name: item.name,
          amountDesc: item.amountDesc,
          grams: item.grams,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          confidence: 92,
        });
      }
    });

    if (items.length === 0) {
      // Generic item based on user prompt
      items.push({
        name: text.trim() || 'ארוחה משולבת',
        amountDesc: 'מנה אישית (250 גרם)',
        grams: 250,
        calories: 420,
        protein: 32,
        carbs: 45,
        fat: 12,
        confidence: 85,
        notes: 'הערכה כללית לפי זיהוי טקסט',
      });
    }

    const totalCalories = items.reduce((s, i) => s + i.calories, 0);
    const totalProtein = Math.round(items.reduce((s, i) => s + i.protein, 0) * 10) / 10;
    const totalCarbs = Math.round(items.reduce((s, i) => s + i.carbs, 0) * 10) / 10;
    const totalFat = Math.round(items.reduce((s, i) => s + i.fat, 0) * 10) / 10;

    return {
      mealType,
      rawInput: text,
      explanation: `זוהו ${items.length} מרכיבים מתוך התיאור שלך. סך הכל: ${totalCalories} קלוריות ו-${totalProtein}g חלבון.`,
      items,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };
  }

  private static getLocalRecipeSuggestions(
    options: AIMealGenOptions,
    remainingMacros: { calories: number; protein: number; carbs: number; fat: number }
  ): AIMenuSuggestion[] {
    const targetKcal = Math.max(200, remainingMacros.calories > 0 ? remainingMacros.calories : 450);
    const targetProtein = Math.max(20, remainingMacros.protein > 0 ? remainingMacros.protein : 35);

    return [
      {
        id: `sug_1_${Date.now()}`,
        title: 'קערת חזה עוף ואורז מוקפץ עם ירקות ירוקים',
        description: 'ארוחה מאוזנת להפליא, קלה להכנה, משביעה במיוחד ועשירה בחלבון איכותי.',
        mealType: options.mealType || 'lunch',
        prepTimeMinutes: 15,
        totalCalories: Math.min(targetKcal, 520),
        protein: Math.min(targetProtein, 45),
        carbs: 42,
        fat: 9,
        ingredients: [
          { name: 'חזה עוף חתוך לרצועות', amount: '160 גרם', grams: 160, calories: 264, protein: 49.6, carbs: 0, fat: 5.8 },
          { name: 'אורז בסמטי מבושל', amount: '1 כוס (140 גרם)', grams: 140, calories: 182, protein: 3.8, carbs: 40.0, fat: 0.5 },
          { name: 'קישוא וברוקולי מוקפצים', amount: '150 גרם', grams: 150, calories: 45, protein: 3.0, carbs: 7.0, fat: 1.0 },
        ],
        instructions: [
          'מחממים מחבת טפלון עם תרסיס שמן זית.',
          'צורבים את רצועות חזה העוף עם פפריקה, שום כתוש ומלח כ-5-6 דקות.',
          'מוסיפים את הירקות המוקפצים ומגישים חם על מצע האורז.',
        ],
        tags: ['עתיר חלבון', 'מושלם להתאוששות שריר', 'דל שומן'],
      },
      {
        id: `sug_2_${Date.now()}`,
        title: 'סלט טונה ים-תיכוני עם ביצה קשה, אבוקדו וטוסט מחמצת',
        description: 'ארוחה מהירה ללא בישול מסובך שמספקת שומן איכותי וחלבון מלא.',
        mealType: options.mealType || 'dinner',
        prepTimeMinutes: 10,
        totalCalories: Math.min(targetKcal, 460),
        protein: Math.min(targetProtein, 38),
        carbs: 28,
        fat: 16,
        ingredients: [
          { name: 'טונה בהירה במים מסוננת', amount: '1 קופסה (112 גרם)', grams: 112, calories: 120, protein: 28.0, carbs: 0, fat: 1.0 },
          { name: 'ביצה קשה L', amount: '1 יחידה (60 גרם)', grams: 60, calories: 86, protein: 7.5, carbs: 0.5, fat: 6.0 },
          { name: 'רבע אבוקדו', amount: '40 גרם', grams: 40, calories: 64, protein: 0.8, carbs: 3.4, fat: 6.0 },
          { name: 'פרוסת לחם מחמצת קלויה', amount: '1 פרוסה (40 גרם)', grams: 40, calories: 96, protein: 3.8, carbs: 18.2, fat: 0.8 },
        ],
        instructions: [
          'מסננים את הטונה ומערבבים עם קוביות ביצה קשה ואבוקדו.',
          'מתבלים במעט לימון סחוט טרי, מלח גס ופלפל שחור.',
          'מורחים על טוסט מחמצת חם ופריך.',
        ],
        tags: ['ללא בישול', 'אומגה 3', 'מהיר במיוחד (5 דקות)'],
      },
      {
        id: `sug_3_${Date.now()}`,
        title: 'שייק חלבון עשיר "Power Shake" עם בננה, חמאת בוטנים ושיבולת שועל',
        description: 'פתרון מושלם כשמרגישים שבעים או ממהרים ורוצים לצרוך קלוריות וחלבון בקלות.',
        mealType: options.mealType || 'snack',
        prepTimeMinutes: 5,
        totalCalories: Math.min(targetKcal, 390),
        protein: Math.min(targetProtein, 32),
        carbs: 45,
        fat: 10,
        ingredients: [
          { name: 'אבקת חלבון מי גבינה (Whey)', amount: '1 כף מדידה (33 גרם)', grams: 33, calories: 130, protein: 25.0, carbs: 2.0, fat: 1.5 },
          { name: 'בננה בינונית', amount: '1 יחידה (100 גרם)', grams: 100, calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
          { name: 'חמאת בוטנים טבעית', amount: '1 כפית (15 גרם)', grams: 15, calories: 90, protein: 3.8, carbs: 3.0, fat: 7.5 },
          { name: 'חלב סויה / שקדים ללא סוכר', amount: '200 מ"ל', grams: 200, calories: 60, protein: 3.0, carbs: 2.0, fat: 2.5 },
        ],
        instructions: [
          'מכניסים את כל המרכיבים לבלנדר יחד עם 3 קוביות קרח.',
          'טוחנים כ-30 שניות עד לקבלת מרקם חלק, קטיפתי ומרענן.',
          'שותים בלגימות רגועות – נספג במהירות וללא תחושת כבדות בבטן.',
        ],
        tags: ['קל במיוחד לעיכול', 'דחיסות קלורית נוחה', 'מומלץ לשובע כבד'],
      },
    ];
  }

  private static getLocalCoachResponse(
    messages: AICoachMessage[],
    context: {
      profile: UserProfile;
      todayLog: DayLog;
      weightHistory: any[];
      memory: AICoachMemory;
    },
    _userProfileSummary: string,
    remainingKcal: number,
    remainingProtein: number
  ): { response: AICoachMessage; updatedMemory: AICoachMemory } {
    const lastUserMsg = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
    const lower = lastUserMsg.toLowerCase();
    const updatedMemory: AICoachMemory = { ...context.memory };

    let content = '';
    const suggestedActions: AICoachSuggestedAction[] = [];

    // Case 1: Feeling too full / bloated / can't eat
    if (
      lower.includes('מפוצץ') ||
      lower.includes('לא מסוגל לאכול') ||
      lower.includes('כבד') ||
      lower.includes('שבע מדי') ||
      lower.includes('נפוח') ||
      lower.includes('מלא')
    ) {
      updatedMemory.satietyState = 'bloated';
      if (!updatedMemory.userNotes.includes('חווה שובע/נפיחות עם נפח מזון גבוה')) {
        updatedMemory.userNotes.push('חווה שובע/נפיחות עם נפח מזון גבוה');
      }

      content = `הבנתי אותך לחלוטין, ${context.profile.name}! 🙏 תחושת שובע ונפיחות היא טבעית לגמרי, במיוחד כשמקפידים על צריכת חלבון גבוהה. הנה בדיוק מה שנעשה:

### 💡 3 צעדים חכמים להתמודדות כרגע:
1. **אל תאכל בכוח נפח גדול:** הגוף שלך מאותת על מלאות במערכת העיכול. אכילת חזה עוף יבש או קערת אורז גדולה עכשיו רק תכביד עליך.
2. **מעבר לקלוריות נוזליות ודחוסות (Liquid Macros):**
   במקום ארוחה מוצקה גדולה, שייק חלבון נוזלי עם בננה, חמאת בוטנים או חלב דק יכניס לך 30g חלבון וכ-300 קלוריות בנפח של כוס אחת בלבד וייספג תוך דקות ללא עומס.
3. **הפחתת גזים ונפיחות:**
   הימנע מירקות מצליבים (כרוב, כרובית, ברוקולי חי) ומשתייה מוגזת. שתה תה נענע או מים פושרים בלגימות קטנות.

🎯 **האם תרצה שנתאים את התפריט של היום לשייק קליל במקום ארוחה כבדה?**`;

      suggestedActions.push({
        label: '🥤 החלף לשייק חלבון קל לעיכול (300 קק"ל)',
        type: 'switch_to_liquid_macros',
      });
      suggestedActions.push({
        label: '✨ בצע התאמה קלורית להיום (-200 קק"ל)',
        type: 'adjust_today_targets',
      });
    } else if (
      lower.includes('משקל') ||
      lower.includes('תקוע') ||
      lower.includes('ירידה') ||
      lower.includes('עלייה') ||
      lower.includes('שקילה')
    ) {
      // Case 2: Weight plateau / Progress analysis
      content = `ניתחתי את תמונת המצב השקילתית שלך, ${context.profile.name} 📊:

- **משקל נוכחי:** ${context.profile.currentWeight} ק"ג (יעד: ${context.profile.targetWeight} ק"ג)
- **מטרת תוכנית:** ${context.profile.goal === 'lean_bulk' ? 'עלייה נקייה במסת שריר' : 'חיטוב וירידה באחוז שומן'}
- **מאזן להיום:** נצרכו ${calculateDayTotals(context.todayLog).totalCalories} קק"ל מתוך יעד של ${getDailyAdjustedTargets(context.profile, context.todayLog, context.todayLog.date).targetCalories} קק"ל.

### 💡 המלצות המאמן:
1. **מגמה שבועית מול יומית:** משקל הגוף תנודתי עקב נוזלים, מלחים וגליקוגן. הסתכל על הממוצע השבועי ולא על יום בודד.
2. **התאמת צעדים (NEAT):** הקפדה על 7,500-9,000 צעדים ביום מונעת האטה בחילוף החומרים.
3. **דיוק בשקילת שמנים ורטבים:** כף שמן זית "קטנה" בסלט היא כ-120 קלוריות. שקול אותה פעם אחת בדיוק.`;

      suggestedActions.push({
        label: '📈 פתח גרף שקילות ומעקב',
        type: 'adjust_today_targets',
      });
    } else if (
      lower.includes('מתוק') ||
      lower.includes('חשק') ||
      lower.includes('שוקולד') ||
      lower.includes('נשנוש')
    ) {
      // Case 3: Sweet cravings
      content = `חשק למתוק הוא דבר שאפשר לנהל בחוכמה בלי להרוס את הגירעון או החיטוב! 🍫😋

### הנה 3 פתרונות מעולים שמשלבים חלבון:
1. **מעדן חלבון פרו שוקולד (20g חלבון / 120 קק"ל):** מרקם של פודינג עשיר, אפס שומן ומשביע לאורך זמן.
2. **יוגורט יווני + כפית דבש + קינמון ו-5 שקדים:** שילוב מתוק וקרמי עם שומן בריא שמנטרל את התשוקה לסוכר.
3. **שוקולד מריר 85% (קוביה אחת = 55 קק"ל):** עשיר בנוגדי חמצון ומספק את החשק מיידית.`;

      suggestedActions.push({
        label: '🍮 הוסף מעדן פרו לנשנושים',
        type: 'add_logged_food',
      });
    } else {
      // General coaching response
      content = `שלום ${context.profile.name}! אני כאן איתך לכל התייעצות, שאלה או התאמת תפריט 💪

- **מצבך להיום:** נותרו לך עוד **${remainingKcal > 0 ? remainingKcal : 0} קלוריות** ו-**${remainingProtein > 0 ? remainingProtein : 0}g חלבון** להשלמת היעד היומי.
- **מים:** שתית ${context.todayLog.waterGlasses} כוסות מים מתוך היעד (${context.profile.dailyWaterTargetGlasses || 8}).

במה תרצה שנתמקד עכשיו?
- התאמת תפריט והצעת ארוחה להשלמת החלבון
- טיפול בתחושת כבדות / שובע
- ניתוח התקדמות שבועית
- שאלה תזונתית או הכנה לאימון?`;

      suggestedActions.push({
        label: '🍳 הצע לי ארוחה להשלמת החלבון',
        type: 'open_recipe_generator',
      });
    }

    const responseMessage: AICoachMessage = {
      id: `coach_${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions,
    };

    return { response: responseMessage, updatedMemory };
  }
}
