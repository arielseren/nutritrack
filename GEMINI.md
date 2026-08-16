# 🥗 NutriTrack - Daily Nutrition & Calorie Tracker

אפליקציית ווב ו-PWA מתקדמת למעקב תזונה יומי, ניהול קלוריות, מקרואים, שתיית מים, התראות Push חכמות, אימות ביומטרי (טביעת אצבע) ובונה תפריטים מותאמים אישית בעברית מלאה (RTL). נבנתה במלואה בהשראת מסכי ה-UI מפרויקט ה-**Stitch** ("מעקב תזונה יומי").

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
│   │   │   └── FoodSearchModal.tsx # חיפוש מאכלים, קטגוריות, מועדפים ומחשבון כמויות/גרמים
│   │   ├── scanner/
│   │   │   └── BarcodeScannerModal.tsx # סורק ברקוד (מצלמה + Open Food Facts) + זיהוי צלחות ב-AI
│   │   ├── custom/
│   │   │   └── CustomFoodModal.tsx # יצירת מאכל חדש והזנת ערכים ל-100 גרם
│   │   ├── plans/
│   │   │   ├── MealPlansModal.tsx# תפריטים מוכנים + טאב "התפריטים שלי"
│   │   │   └── CreateMealPlanModal.tsx # בונה תפריטים מותאמים אישית עם חישוב מאקרו חי
│   │   ├── profile/
│   │   │   └── ProfileSettingsModal.tsx # 5 כרטיסיות אקורדיון, מצב עריכה, Push, ביומטרי וגיבוי JSON
│   │   ├── auth/
│   │   │   └── AuthModal.tsx     # מודאל הרשמה והתחברות משתמשים / התחברות בטביעת אצבע / אורח
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

1. **לוח בקרה חכם (Dashboard):**
   - טבעת קלוריות מונפשת המציגה צריכה מול יעד יומי ויתרה/חריגה.
   - 3 מדדי מאקרו ייעודיים (חלבון, פחמימה, שומן) עם סרגלי התקדמות.
   - מעקב מים יומי (כוסות לחיצות של 250 מ"ל, חישוב ליטרים ואפקט קונפטי בהשלמת היעד).
   - יומן פעילות אחרונה ומחיקה מיידית.

2. **יומן תזונה יומי (Day Diary):**
   - חלוקה ל-4 ארוחות: בוקר, צהריים, ערב, נשנושים.
   - סיכום מאקרו וקלוריות לכל ארוחה בנפרד ולכל היום.
   - ניווט בין תאריכים (אתמול, היום, מחר ולוח שנה).

3. **בונה תפריטי תזונה מותאמים אישית (Custom Meal Plan Builder):**
   - לשונית "התפריטים שלי" במסך התפריטים.
   - בונה תפריטים מלא: הגדרת שם, מטרה, הוספת מאכלים וכמויות גרמים מדויקות ל-4 ארוחות.
   - **חישוב קלוריות ומאקרו דינמי בזמן אמת** תוך כדי עריכה.
   - החלה בלחיצה אחת על יומן היום, עריכה ומחיקה של תפריטים אישיים.

4. **אימות ביומטרי והתחברות מאובטחת (WebAuthn Fingerprint / FaceID):**
   - התחברות בלחיצה אחת באמצעות טביעת אצבע / FaceID.
   - מערכת ניהול משתמשים עם שמירת נתונים מבודדת לכל משתמש.
   - התנתקות מסודרת ("התנתק מהחשבון") ומעבר בין חשבונות.

5. **התראות Web Push ותזמון זמני ארוחות עצמאיות:**
   - הפעלה וכיבוי של התראות Push בזמן אמת.
   - הגדרת שעות תזכורת עצמאיות לארוחת בוקר, צהריים וערב ישירות מתוך מודאל ההתראות (🔔).
   - כפתור שליחת התראת בדיקה למכשיר.

6. **כרטיסיות נפתחות (Accordion) עם מצב עריכה מוגן:**
   - חלוקה ל-5 כרטיסיות נפתחות במסך הפרופיל וההגדרות.
   - מצב תצוגה לקריאה בלבד -> לחיצה על "ערוך" פותחת את שדות הקלט עם שמירה/ביטול.
   - חוויית הזנת מספרים חלקה ללא הישארות של הספרה '0' במחיקה.

7. **חיפוש ומאגר מזון עשיר ומורחב:**
   - מאגר מובנה מגוון של עשרות מוצרים ומאכלים ישראליים: קציצות בקר, עוף, דגים, ירק ועדשים, פתיתים, מג'דרה, שווארמה, שניצל, דגים, גבינות, ממרחים ונשנושים.
   - מחשבון כמויות מודולרי: לפי יחידות מנה או לפי גרמים מדויקים.
   - סימון מאכלים מועדפים (❤️), קטגוריות ויצירת מאכל מותאם אישית.

8. **סורק ברקוד וזיהוי צלחות ב-AI:**
   - סריקה ישירה מהמצלמה או הזנה ידנית של ברקוד.
   - חיבור ישיר למאגר **Open Food Facts** אונליין.
   - לשונית **זיהוי צלחות ותמונות ב-AI** עם ניתוח מרכיבים והערכת ערכים אוטומטית.

9. **אנימציות ומעברי עמודים חלקים (Fluid Transitions):**
   - מעבר רך (`animate-page-enter`) בין מסכי האפליקציה.
   - סדינים מודאליים מונפשים ומיקרו-אינטראקציות בלחיצה.

10. **PWA ומצב לילה:**
    - תמיכה מלאה בהתקנה למסך הבית (Add to Home Screen) ב-iOS וב-Android עם לוגו AI יוקרתי.
    - מעבר מהיר בין מצב יום למצב לילה ב-Header.

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
