# 🥗 NutriTrack - Daily Nutrition & Calorie Tracker

אפליקציית ווב ו-PWA מתקדמת למעקב תזונה יומי, ניהול קלוריות, מקרואים, שתיית מים ותפריטים מותאמים אישית בעברית (RTL). נבנתה במלואה בהשראת מסכי ה-UI מפרויקט ה-**Stitch** ("מעקב תזונה יומי").

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
- **Typography & Fonts:** Hanken Grotesk, Plus Jakarta Sans, Heebo (Google Fonts)
- **Icons & Visual Effects:** Lucide React, Google Material Symbols, Canvas Confetti
- **Camera & Barcode Scanner:** `html5-qrcode` + Open Food Facts API + AI Food Image Recognition
- **Data Persistence:** LocalStorage API + Local JSON Backup Export / Import

---

## 📁 מבנה הפרויקט (Project Architecture)

```
c:\projects\nutrition
├── public/
│   ├── icon.svg                  # אייקון האפליקציה (PWA & iOS/Android Home Screen)
│   ├── manifest.json             # Web App Manifest להתקנה ישירה כאפליקציה
│   └── index.html                # תבנית מוכנה להפצה ישירה ב-Render
├── src/
│   ├── types/
│   │   └── index.ts              # הגדרות TypeScript (FoodItem, LoggedFoodItem, DayLog, UserProfile ועוד)
│   ├── data/
│   │   ├── foodDatabase.ts       # מאגר מאכלים ישראלי ובינלאומי עשיר בעברית
│   │   └── presetMenus.ts        # תפריטי תזונה מוכנים (חיטוב 1,800, מסה 2,400, ים-תיכוני 2,000)
│   ├── services/
│   │   ├── nutritionCalculator.ts# מחשבוני BMR & TDEE (Mifflin-St Jeor), מאקרואים ותאריכים
│   │   ├── storageService.ts     # שירות שמירת LocalStorage, גיבויים, איפוס ומעקב מים
│   │   └── openFoodFacts.ts      # חיבור API אונליין למאגר Open Food Facts (מיליוני ברקודים)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # סרגל עליון: בורר תאריכים, מותג, מעבר יום/לילה, פרופיל והתראות
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
│   │   │   └── MealPlansModal.tsx# תפריטים מוכנים עם כפתור החלה בלחיצה אחת
│   │   ├── profile/
│   │   │   └── ProfileSettingsModal.tsx # עריכת נתוני גוף, מחשבון יעדים, ערכת נושא וגיבוי JSON
│   │   ├── auth/
│   │   │   └── AuthModal.tsx     # מודאל הרשמה והתחברות משתמשים / המשך כאורח
│   │   ├── notifications/
│   │   │   └── NotificationsModal.tsx # התראות ותזכורות
│   │   └── common/
│   │       └── DatePickerModal.tsx # בורר תאריכים מלוח שנה וקיצורי דרך
│   ├── index.css                 # עיצוב Design Tokens, משתני Dark Mode ורוחב רספונסיבי
│   ├── App.tsx                   # רכיב האפליקציה הראשי וניהול ה-State
│   └── main.tsx                  # נקודת כניסה
├── render.yaml                   # קובץ הגדרות פריסה אוטומטית ל-Render
├── package.json
└── tsconfig.json
```

---

## 🌟 יכולות מרכזיות (Core Features)

1. **לוח בקרה חכם (Dashboard):**
   - טבעת קלוריות מונפשת המציגה צריכה מול יעד יומי ויתרה/חריגה.
   - 3 מדדי מאקרו ייעודיים (חלבון בכתום-חום, פחמימה בטורקיז, שומן באפור-תכלת).
   - מעקב מים יומי (כוסות לחיצות של 250 מ"ל, חישוב ליטרים ואפקט קונפטי בהשלמת היעד).
   - יומן פעילות אחרונה ומחיקה מיידית.

2. **יומן תזונה יומי (Day Diary):**
   - חלוקה ל-4 ארוחות: בוקר, צהריים, ערב, נשנושים.
   - סיכום מאקרו וקלוריות לכל ארוחה בנפרד ולכל היום.
   - ניווט בין תאריכים (אתמול, היום, מחר ולוח שנה).

3. **חיפוש ומאגר מזון:**
   - מאגר מובנה עשיר בעברית של עשרות מוצרים ומאכלים ישראליים.
   - מחשבון כמויות מודולרי: בחירה לפי יחידות מנה מוגדרות או לפי גרמים מדויקים.
   - סימון מאכלים מועדפים (❤️) וסינון לפי קטגוריות.
   - יצירת מאכל מותאם אישית ושמירתו במאגר המקומי.

4. **סורק ברקוד וזיהוי צלחות ב-AI:**
   - סריקה ישירה מהמצלמה או הזנה ידנית של ברקוד.
   - חיבור ישיר למאגר **Open Food Facts** (שליפת מוצרים ישראליים ועולמיים אונליין).
   - לשונית **זיהוי צלחות ותמונות ב-AI** עם ניתוח מרכיבים והערכת ערכים אוטומטית.

5. **תפריטים מוכנים מראש (Meal Plans):**
   - 3 תפריטים מקצועיים מובנים (חיטוב, מסה, ים-תיכוני) עם פירוט ארוחות וכפתור החלה בלחיצה אחת על היומן.

6. **פרופיל ומחשבון יעדים מדעי:**
   - חישוב BMR ו-TDEE לפי משוואת **Mifflin-St Jeor**.
   - התאמה אישית של כל יעד גרמים וכוסות מים.
   - ייצוא וייבוא גיבויי JSON מקומיים ואיפוס מלא.

7. **הרשמה והתחברות (Auth):**
   - אפשרות להרשמה, התחברות או שימוש כאורח ללא הרשמה.

8. **מצב לילה (Dark Mode) ו-PWA:**
   - מעבר בלחיצה אחת בין מצב יום למצב לילה ב-Header.
   - תמיכה מלאה בהתקנה למסך הבית (Add to Home Screen) ב-iOS וב-Android.

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
