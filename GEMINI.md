# 🥗 NutriTrack - Daily Nutrition & Calorie Tracker

אפליקציית ווב ו-PWA מתקדמת למעקב תזונה יומי, ניהול קלוריות, מקרואים, שתיית מים, התראות Push חכמות, אימות ביומטרי (טביעת אצבע), תהליך קליטה אינטראקטיבי (Onboarding), תמיכה בעלייה נקייה במסת שריר (Lean Bulk) ובונה תפריטים מותאמים אישית בעברית מלאה (RTL). נבנתה במלואה בהשראת מסכי ה-UI מפרויקט ה-**Stitch** ("מעקב תזונה יומי").

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
- **Typography & Fonts:** Hanken Grotesk, Plus Jakarta Sans, Heebo (Google Fonts)
- **Icons & Visual Effects:** Lucide React, Google Material Symbols, Canvas Confetti
- **Camera & Barcode Scanner:** `html5-qrcode` + Open Food Facts API + AI Food Image Recognition
- **Biometric Security:** WebAuthn API (`navigator.credentials`) להתחברות בטביעת אצבע / FaceID
- **Push & Service Worker:** Service Worker API (`public/sw.js`) + Notification API לתזכורות מים וארוחות
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
│   │   └── index.ts              # הגדרות TypeScript (FoodItem, LoggedFoodItem, DayLog, UserProfile ועוד)
│   ├── data/
│   │   ├── foodDatabase.ts       # מאגר מאכלים ישראלי ובינלאומי עשיר (קציצות, בשרים, חלבונים, פחמימות, שומנים)
│   │   └── presetMenus.ts        # תפריטי תזונה מוכנים (חיטוב 1,800, מסה 2,400, ים-תיכוני 2,000)
│   ├── services/
│   │   ├── nutritionCalculator.ts# מחשבוני BMR & TDEE (Mifflin-St Jeor), מאקרואים ותאריכים
│   │   ├── storageService.ts     # שירות שמירת LocalStorage, גיבויים, משתמשים ותפריטים מותאמים
│   │   ├── biometricAuthService.ts# שירות אימות ביומטרי WebAuthn (טביעת אצבע / FaceID)
│   │   ├── notificationService.ts# שירות תזמון התראות Web Push ובדיקת זמני ארוחות
│   │   └── openFoodFacts.ts      # חיבור API אונליין למאגר Open Food Facts (מיליוני ברקודים)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # סרגל עליון: לוגו AI, בורר תאריכים, מעבר יום/לילה, פרופיל והתראות
│   │   │   └── BottomNav.tsx     # סרגל ניווט תחתון + כפתור Quick-Add מרכזי
│   │   ├── dashboard/
│   │   │   ├── DashboardView.tsx # תצוגת לוח הבקרה הראשית
│   │   │   ├── CalorieRing.tsx   # טבעת קלוריות מונפשת (SVG Circular Progress)
│   │   │   ├── MacroBreakdown.tsx# פירוט 3 מאקרואים (חלבון, פחמימה, שומן) עם סרגלי התקדמות
│   │   │   ├── WaterTracker.tsx  # מעקב 8 כוסות מים אינטראקטיביות + אפקט קונפטי
│   │   │   └── RecentActivity.tsx# רשימת פעילות אחרונה עם מחיקה מהירה
│   │   ├── diary/
│   │   │   └── DayDiaryView.tsx  # יומן ארוחות יומי (בוקר, צהריים, ערב, נשנושים) ומעבר ימים
│   │   ├── search/
│   │   │   └── FoodSearchModal.tsx # חיפוש מאכלים, מדריך כמויות ללא משקל, קטגוריות ומועדפים
│   │   ├── scanner/
│   │   │   └── BarcodeScannerModal.tsx # סורק ברקוד (מצלמה + Open Food Facts) + זיהוי צלחות ב-AI
│   │   ├── custom/
│   │   │   └── CustomFoodModal.tsx # יצירת מאכל חדש והזנת ערכים ל-100 גרם
│   │   ├── plans/
│   │   │   ├── MealPlansModal.tsx# תפריטים מוכנים + טאב "התפריטים שלי" (Inline & Modal)
│   │   │   └── CreateMealPlanModal.tsx # בונה תפריטים מותאמים אישית עם חישוב מאקרו חי
│   │   ├── profile/
│   │   │   └── ProfileSettingsModal.tsx # 5 כרטיסיות אקורדיון, מצב עריכה, Push, ביומטרי (Inline & Modal)
│   │   ├── auth/
│   │   │   └── AuthModal.tsx     # אשף קליטת משתמש (Onboarding 3 שלבים) + התחברות בטביעת אצבע
│   │   ├── notifications/
│   │   │   └── NotificationsModal.tsx # התראות, תזמון זמני ארוחות עצמאיות ובדיקת Push
│   │   └── common/
│   │       └── DatePickerModal.tsx # בורר תאריכים מלוח שנה וקיצורי דרך
│   ├── index.css                 # עיצוב Design Tokens, אנימציות עמודים, משתני Dark Mode
│   ├── App.tsx                   # רכיב האפליקציה הראשי, מעברי עמודים וניהול ה-State
│   └── main.tsx                  # נקודת כניסה
├── render.yaml                   # קובץ הגדרות פריסה אוטומטית ל-Render
├── package.json
└── tsconfig.json
```

---

## 🌟 יכולות מרכזיות (Core Features)

1. **אשף קליטת משתמש חדש (Onboarding Wizard ב-3 שלבים):**
   - הרשמה חכמה עם הזנת פרטים אישיים: שם, אימייל, סיסמה.
   - הזנת מדדי גוף אמיתיים: מין, גיל, גובה, משקל נוכחי ומשקל יעד.
   - בחירת מטרת תזונה ורמת פעילות גופנית -> חישוב יעדים מדעי (BMR & TDEE) אוטומטי.
   - **יומן נקי לחלוטין למשתמש החדש (0 קלוריות, 0 מים, ללא מידע דמה)** להתחלה אישית ונקייה!

2. **תמיכה במטרת "עלייה נקייה במסת שריר" (Lean Bulk):**
   - הוספת מטרת 'lean_bulk' למערכת היעדים והמחשבונים המדעיים.
   - חישוב עודף קלורי מתון ומבוקר (+220 עד +250 קק"ל) עם יחס חלבון גבוה (כ-32% מסך הקלוריות / 2.2g לק"ג) לתוספת מסת שריר ללא שומן מיותר.

3. **תיעוד מזון נוח למי שלא שוקל במאזניים (Portion Guide & Units):**
   - **מדריך כמויות ויזואלי מהיר (שיטת כף היד)** מובנה במסך החיפוש:
     - 🖐️ כף יד פתוחה = מנת חלבון (בשר / עוף / קציצות ~ 120-150g)
     - ✊ אגרוף סגור = מנת פחמימה (אורז / פתיתים / פסטה / תפו"א ~ 1 כוס)
     - 🤲 שתי כפות ידיים = סלט וירקות מבושלים (~ 200g)
     - 👍 אגודל מלא = שומן וממרח (כף טחינה / שמן זית ~ 15g)
   - אפשרות בחירה לפי **יחידות מנה מובנות** (קציצה 1, ביצה, פרוסה, גביע).
   - זיהוי צלחות ותמונות ב-AI וסריקת ברקוד בלחיצה.

4. **תצוגת כרטיסיות מותאמת לדסקטופ ולמובייל (Clean Inline Rendering):**
   - מסכי הפרופיל והתפריטים מוצגים כעמודים טבעיים חלקים (Inline) ללא כיסוי שחור או חיתוך כותרות.
   - שמירה על רספונסיביות מלאה בדסקטופ, טאבלט, ואייפון 13 Pro (כולל אזורי Safe Area עליונים ותחתונים).

5. **לוח בקרה חכם (Dashboard):**
   - טבעת קלוריות מונפשת המציגה צריכה מול יעד יומי ויתרה/חריגה.
   - 3 מדדי מאקרו ייעודיים (חלבון, פחמימה, שומן) עם סרגלי התקדמות.
   - מעקב מים יומי (כוסות לחיצות של 250 מ"ל, חישוב ליטרים ואפקט קונפטי בהשלמת היעד).
   - יומן פעילות אחרונה ומחיקה מיידית.

6. **יומן תזונה יומי (Day Diary):**
   - חלוקה ל-4 ארוחות: בוקר, צהריים, ערב, נשנושים.
   - סיכום מאקרו וקלוריות לכל ארוחה בנפרד ולכל היום.
   - ניווט בין תאריכים (אתמול, היום, מחר ולוח שנה).

7. **בונה תפריטי תזונה מותאמים אישית (Custom Meal Plan Builder):**
   - לשונית "התפריטים שלי" במסך התפריטים.
   - בונה תפריטים מלא: הגדרת שם, מטרה, הוספת מאכלים וכמויות גרמים מדויקות ל-4 ארוחות.
   - **חישוב קלוריות ומאקרו דינמי בזמן אמת** תוך כדי עריכה.
   - החלה בלחיצה אחת על יומן היום, עריכה ומחיקה של תפריטים אישיים.

8. **בידוד נתונים ושמירה אישית מלאה לכל משתמש (User-Scoped Data Isolation):**
   - כל המידע (יומני יום, ארוחות שנרשמו, מעקב שתיית מים, מאכלים מותאמים אישית, תפריטים אישיים והתראות) נשמר תחת מזהה המשתמש הייחודי (`nutritrack_day_logs_v1_{userId}`, `nutritrack_custom_food_db_v1_{userId}`, `nutritrack_custom_meal_plans_v1_{userId}`).
   - מעבר בין משתמשים או הרשמת משתמש חדש מציגים אך ורק את הנתונים והיעדים שהמשתמש הספציפי הזין, ללא שיתוף או דליפת מידע בין חשבונות.
   - בורר חשבונות מהיר מובנה במסך ההתחברות ובלשונית האבטחה בפרופיל.

9. **אימות ביומטרי והתחברות מאובטחת (WebAuthn Fingerprint / FaceID):**
   - התחברות בלחיצה אחת באמצעות טביעת אצבע / FaceID.
   - מערכת ניהול משתמשים עם שמירת נתונים מבודדת לכל משתמש.
   - התנתקות מסודרת ("התנתק מהחשבון") ומעבר בין חשבונות.

9. **התראות Web Push ותזמון זמני ארוחות עצמאיות:**
   - הפעלה וכיבוי של התראות Push בזמן אמת.
   - הגדרת שעות תזכורת עצמאיות לארוחת בוקר, צהריים וערב ישירות מתוך מודאל ההתראות (🔔).
   - כפתור שליחת התראת בדיקה למכשיר.

10. **מאגר מזון ישראלי מורחב ומגוון:**
    - קציצות בקר, עוף, דגים, ירק ועדשים, פתיתים, מג'דרה, שווארמה, שניצל, דגים, גבינות, ממרחים ונשנושים.
    - סימון מאכלים מועדפים (❤️), קטגוריות ויצירת מאכל מותאם אישית.

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
