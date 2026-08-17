# 🥗 NutriTrack - Daily Nutrition & Calorie Tracker

אפליקציית ווב ו-PWA מתקדמת למעקב תזונה יומי, ניהול קלוריות, מקרואים, מעקב משקל שבועי וגרפי התקדמות, שתיית מים, התראות Push חכמות, אימות ביומטרי (טביעת אצבע), תהליך קליטה אינטראקטיבי (Onboarding), תמיכה בעלייה נקייה במסת שריר (Lean Bulk), בונה תפריטים מותאמים אישית, ו**חבילת AI חכמה מלאה עם יועצי תזונה קליניים מבוססי פרוטוקול מדעי (איתי ומאיה)** בעברית מלאה (RTL). נבנתה במלואה בהשראת מסכי ה-UI מפרויקט ה-**Stitch** ("מעקב תזונה יומי").

---

## 🌐 קישורים חיים ופריסה

- **🔗 כתובת האפליקציה החיה (Render Live HTTPS):**  
  [https://nutritrack-app-ck2v.onrender.com](https://nutritrack-app-ck2v.onrender.com)
- **📂 מאגר הקוד ב-GitHub:**  
  [https://github.com/arielseren/nutritrack](https://github.com/arielseren/nutritrack)

---

## 🛠️ סטאק טכנולוגי (Tech Stack)

- **Frontend Framework:** React 19 (TypeScript)
- **Bundler & Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4 + Dynamic CSS Variables (Light & Dark Theme)
- **Design Tokens & Brand:** גווני Emerald Teal (`#006b5f`, `#2dd4bf`) וענבר (`#ffab6d`), Glassmorphism, Rounded Squircles
- **Typography & Fonts:** Hanken Grotesk, Plus Jakarta Sans, Heebo (Google Fonts) - מוגדל ומוקפד לקריאות מושלמת
- **Icons & Visual Effects:** Lucide React (Clean Vector Icons), Google Material Symbols, Canvas Confetti
- **AI Intelligence:** Google Gemini 2.5 Flash API (Computer Vision, OCR, NLP, Recipe Generator) + מנוע הדמיה מקומי עשיר
- **Clinical Methodology:** פרוטוקול מערכת קליני מפורט (`src/data/nutritionCoachSystemPrompt.md`) ודמויות מומחים (`src/data/coachPersonas.ts`)
- **Biometric Security:** WebAuthn API (`navigator.credentials`) להתחברות בטביעת אצבע / FaceID
- **Push & Service Worker:** Service Worker API (`public/sw.js`) + Notification API לתזכורות מים, ארוחות ושקילה שבועית
- **Data Persistence:** LocalStorage API + Local JSON Backup Export / Import

---

## 📁 מבנה הפרויקט המלא (Project Architecture)

```
c:\projects\nutrition
├── public/
│   ├── logo.png                  # לוגו המותג שנוצר ב-AI (512x512)
│   ├── icon.png                  # אייקון PWA בגודל 192x192
│   ├── icon.svg                  # אייקון וקטורי מותאם
│   ├── favicon.svg               # סמל טאב הדפדפן
│   ├── sw.js                     # Service Worker להתראות Push ותזכורות רקע
│   ├── manifest.json             # Web App Manifest להתקנה מלאה כאפליקציה (PWA)
│   └── index.html                # תבנית מוכנה להפצה ישירה ב-Render
├── src/
│   ├── types/
│   │   ├── index.ts              # הגדרות TypeScript (FoodItem, LoggedFoodItem, DayLog, UserProfile, WeightLogEntry ועוד)
│   │   └── ai.ts                 # הגדרות מערכת ה-AI (AIVisionAnalysisResult, AILabelOcrResult, AINLParseResult, AICoachMessage ועוד)
│   ├── data/
│   │   ├── foodDatabase.ts       # מאגר מאכלים ישראלי ובינלאומי עשיר (קציצות, בשרים, חלבונים, פחמימות, שומנים)
│   │   ├── presetMenus.ts        # תפריטי תזונה מוכנים (חיטוב 1,800, מסה 2,400, ים-תיכוני 2,000)
│   │   ├── coachPersonas.ts      # הגדרות דמויות יועצי ה-AI: איתי (דיאטן ספורט) ומאיה (תזונאית קלינית)
│   │   └── nutritionCoachSystemPrompt.md # ספר החוקים, המתודולוגיה והפרוטוקול הקליני של יועצי התזונה
│   ├── services/
│   │   ├── aiService.ts          # מנוע ה-AI המשולב: Gemini Vision, OCR תוויות, ניתוח שפה טבעית, מתכונים ומאמן אישי
│   │   ├── nutritionCalculator.ts# מחשבוני BMR & TDEE (Mifflin-St Jeor), מאקרואים, סייקלינג ורצף דינמי
│   │   ├── storageService.ts     # שירות שמירת LocalStorage, גיבויים, שקילות, משתמשים, זיכרון AI ותפריטים מותאמים
│   │   ├── biometricAuthService.ts# שירות אימות ביומטרי WebAuthn (טביעת אצבע / FaceID)
│   │   └── notificationService.ts# שירות תזמון התראות Web Push, זמני ארוחות ותזכורת שקילה שבועית
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AIHubModal.tsx    # מרכז הבקרה הראשי של כל כלי ה-AI ומפתח אישי
│   │   │   ├── AINaturalLanguageModal.tsx # הזנה קולית וחופשית בעברית טבעית
│   │   │   ├── AIPhotoScannerModal.tsx    # סורק צלחות (Vision), OCR תוויות ערכים תזונתיים וברקודים
│   │   │   ├── AIMealGeneratorModal.tsx   # מחולל מתכונים, השלמת חוסרי מאקרו יומיים ושאריות מקרר
│   │   │   └── AICoachModal.tsx           # מאמן תזונה וספורט אישי עם זיכרון, למידה והתמודדות עם שובע/נפיחות
│   │   ├── layout/
│   │   │   ├── Header.tsx        # סרגל עליון: לוגו AI, כפתור AI ייעודי, בורר תאריכים, מעבר יום/לילה ורצף
│   │   │   └── BottomNav.tsx     # סרגל ניווט תחתון: דף הבית, יומן, כפתור הוספה, תפריטים, פרופיל
│   │   ├── dashboard/
│   │   │   ├── DashboardView.tsx # דף הבית הראשי, באנר אימונים, באנר AI חכם מובנה, ווידג'ט משקל
│   │   │   ├── CalorieRing.tsx   # טבעת קלוריות מונפשת (SVG Circular Progress)
│   │   │   ├── MacroBreakdown.tsx# פירוט 3 מאקרואים (חלבון, פחמימה, שומן) עם סרגלי התקדמות
│   │   │   ├── WaterTracker.tsx  # מעקב 8 כוסות מים אינטראקטיביות + אפקט קונפטי
│   │   │   ├── RecentActivity.tsx# רשימת פעילות אחרונה עם מחיקה מהירה
│   │   │   └── WorkoutModeModal.tsx# מודאל כיוונון עצימות ושריפת קלוריות באימון
│   │   ├── diary/
│   │   │   └── DayDiaryView.tsx  # יומן ארוחות יומי (בוקר, צהריים, ערב, נשנושים) ומעבר ימים
│   │   ├── search/
│   │   │   └── FoodSearchModal.tsx # חיפוש מאכלים, הזנה ישירה, כפתורי עריכה/מחיקה למאכלים אישיים, כפתור נעוץ
│   │   ├── custom/
│   │   │   └── CustomFoodModal.tsx # יצירת ועריכת מאכל אישי (ערכים ל-100 גרם או הזנה ישירה להיום)
│   │   ├── plans/
│   │   │   ├── MealPlansModal.tsx# מתכנן שבועי (7 ימים) + תפריטים מוכנים + טאב "התפריטים שלי" עם עריכה ומחיקה
│   │   │   ├── CreateMealPlanModal.tsx # בונה תפריטים מרווח (ללא חיתוך) עם יצירת מאכל והזנה ישירה על המקום
│   │   │   └── WeeklyGroceryModal.tsx  # רשימת קניות שבועית חכמה עם צ'קבוקסים ושיתוף לוואטסאפ
│   │   ├── progress/
│   │   │   └── WeightProgressModal.tsx # מעקב משקל שבועי, גרף מגמה אינטראקטיבי, משקל התחלתי מול יעד ותזכורות
│   │   ├── guide/
│   │   │   └── UserGuideModal.tsx      # מדריך למשתמש אינטראקטיבי בתוך האפליקציה עם 11 פרקים וחיפוש מהיר
│   │   ├── profile/
│   │   │   └── ProfileSettingsModal.tsx # פרופיל מלא, באנר גרפים ומשקל, לוח אימונים, ביומטרי וגיבויים
│   │   ├── auth/
│   │   │   └── AuthModal.tsx     # אשף קליטת משתמש (Onboarding 3 שלבים) + התחברות בטביעת אצבע
│   │   ├── notifications/
│   │   │   └── NotificationsModal.tsx # התראות, תזמון זמני ארוחות עצמאיות ובדיקת Push
│   │   └── common/
│   │       └── DatePickerModal.tsx # בורר תאריכים מלוח שנה וקיצורי דרך
│   ├── index.css                 # עיצוב Design Tokens, פונט מוגדל, אנימציות עמודים, משתני Dark Mode
│   ├── App.tsx                   # רכיב האפליקציה הראשי, מעברי עמודים וניהול ה-State
│   └── main.tsx                  # נקודת כניסה
├── render.yaml                   # קובץ הגדרות פריסה אוטומטית ל-Render
├── package.json
└── tsconfig.json
```

---

## 🌟 יכולות מרכזיות (Core Features)

1. **חבילת ה-AI החכמה (Gemini 2.5 Flash Vision & Intelligence):**
   - 📸 **סריקת צלחת וארוחה (Plate Vision Scanner):** צילום צלחת, זיהוי מרכיבים ומשקלים בגרמים, חישוב מאקרו וקלוריות והוספה מהירה ליומן של היום.
   - 🏷️ **סריקת תווית ערכים תזונתיים (Nutrition Label OCR):** צילום טבלת 100 גרם מגב המוצר וחילוץ אוטומטי של קלוריות, חלבון, פחמימות, שומן, סוכרים וסודיום למאגר האישי.
   - 🎙️ **הזנה קולית וחופשית בעברית טבעית (Voice & NL Logging):** דיבור למיקרופון או הקלדה חופשית (למשל: *"אכלתי פיתה עם 150 גרם חזה עוף, כף טחינה וסלט קצוץ וכוס זירו"*) -> פירוק למרכיבים ומאקרו בלחיצת כפתור.
   - 🍳 **מחולל מתכונים והשלמת מאקרו (Smart Recipe & Macro Gap Builder):** חישוב אוטומטי של החוסרים היומיים (קלוריות, חלבון, פחמימה ושומן) והצעת 3 מתכונים מדויקים להשלמת היעד, או יצירת מתכון משאריות מקרר ומזווה.
   - 🧠 **מאמן תזונה וספורט אישי ב-AI עם זיכרון והתייעצות (Personal AI Nutrition Coach):**
     - בחירה בין שני יועצים מוסמכים: **👨‍⚕️ איתי (דיאטן קליני וספורט)** לבין **👩‍⚕️ מאיה (תזונאית קלינית והרגלים)**.
     - **ספר חוקים ופרוטוקול קליני מלא (`nutritionCoachSystemPrompt.md`):** מתודולוגיה מדעית המנתחת את נתוני האמת של המשתמש.
     - **טיפול מותאם אישית לתחושת שובע, כבדות ונפיחות:** כשהמשתמש מדווח על תחושת פיצוץ ועומס מזון, ה-AI מעביר מיד לקלוריות נוזליות ודחוסות (שייק חלבון עשיר), מבצע התאמה קלורית זמנית, ולומד את ההעדפות לזיכרון עתידי!

2. **מעקב משקל שבועי, גרפים והתקדמות (Weight & Progress Tracker):**
   - 3 מדדי מפתח: משקל התחלתי, משקל נוכחי ומשקל יעד.
   - חישוב אוטומטי של סך השינוי בק"ג, אחוז ההתקדמות לעבר היעד, וק"ג שנותרו.
   - גרף מגמה אינטראקטיבי (SVG Progress Chart) ביחס לקו היעד.
   - טופס רישום שקילה מהיר והיסטוריית שקילות מפורטת.
   - תזכורת שקילה שבועית Push במכשיר.

3. **בונה תפריטים מרווח עם יצירת מאכל והזנה ישירה על המקום:**
   - כרטיסיית בונה תפריט רחבה ומרווחת ללא חיתוך.
   - חיפוש במאגר או הזנה ישירה של שם, קלוריות, חלבון, פחמימה ושומן על המקום ללא צורך לצאת מבונה התפריטים.

4. **הזנה ישירה של קלוריות ומאקרו ללא חישוב 100 גרם ושיטת כף היד:**
   - לשונית "⚡ הזנה ישירה" מובנית במסך החיפוש.
   - הוספה מיידית ליומן ללא חישובי גרמים או מאזניים.
   - מדריך כמויות ויזואלי מהיר (שיטת כף היד).

5. **מתכנן תפריט שבועי (7 ימים) ורשימת קניות שבועית חכמה:**
   - שיבוץ תפריטים מוכנים או מותאמים לכל יום מראשון עד שבת.
   - החלה בלחיצה אחת על כל 7 הימים הקרובים ביומן.
   - רשימת קניות שבועית עם צ'קבוקסים לסימון בסופר ושיתוף ישיר לוואטסאפ (WhatsApp).

6. **סייקלינג קלוריות יומי והתאמה דינמית לאימונים:**
   - התאמה מדעית של יעד הקלוריות והפחמימות לכל יום בנפרד לפי סוג הפעילות (מנוחה, כוח, אימון כבד, אירובי, HIIT).
   - לוח אימונים שבועי מובנה בפרופיל עם תבניות מוכנות (AB, PPL, Full-Body).

7. **אימות ביומטרי ובידוד נתונים לכל משתמש:**
   - התחברות בלחיצה אחת בטביעת אצבע / FaceID (WebAuthn).
   - בידוד מוחלט של כל המידע (יומנים, שקילות, מאכלים, התראות וזיכרון AI) לכל משתמש בנפרד.

8. **מדריך למשתמש אינטראקטיבי (11 פרקים):**
   - נגיש מראש מסך הפרופיל (📖) וכולל הסברים מפורטים, טיפים, מתודולוגיות AI וחיפוש טקסטואלי מהיר.

---

## 💻 הרצה מקומית ופיתוח (Local Development)

```bash
# התקנת תלויות
npm install

# הרצת שרת פיתוח מקומי
npm run dev

# הרצת שרת פיתוח החשוף לטלפונים ברשת ה-Wi-Fi הביתית
npm run dev -- --host

# בדיקת קומפילציה ובנייה (Build)
npm run build
```

---

## 🚀 פריסה ועדכונים (Deployment Workflow)

האפליקציה מוגדרת עם **Auto-Deploy** ב-Render:  
כל `git push origin master` גורר באופן אוטומטי בנייה ופריסה חיה לכתובת:  
**https://nutritrack-app-ck2v.onrender.com**
