# 🥗 NutriTrack - Daily Nutrition & Calorie Tracker

[![Live App](https://img.shields.io/badge/Render-Live%20App-teal?style=for-the-badge&logo=render)](https://nutritrack-app-ck2v.onrender.com)
[![React 19](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-green?style=for-the-badge&logo=pwa)](https://nutritrack-app-ck2v.onrender.com)

אפליקציית ווב ו-PWA מתקדמת למעקב תזונה יומי, ניהול קלוריות, מקרואים, שתיית מים, התראות Push חכמות, אימות ביומטרי (טביעת אצבע), תהליך קליטה אינטראקטיבי (Onboarding), תמיכה בעלייה נקייה במסת שריר (Lean Bulk) ובונה תפריטים מותאמים אישית בעברית מלאה (RTL). נבנתה במלואה בהשראת מסכי ה-UI מפרויקט ה-**Stitch** ("מעקב תזונה יומי").

---

## 🌐 קישורים חיים

- **🔗 אפליקציה חיה ב-Render:** [https://nutritrack-app-ck2v.onrender.com](https://nutritrack-app-ck2v.onrender.com)
- **📂 מאגר GitHub:** [https://github.com/arielseren/nutritrack](https://github.com/arielseren/nutritrack)

---

## ✨ תכונות מרכזיות (Key Features)

- 🚀 **אשף קליטת משתמש חדש (Onboarding Wizard ב-3 שלבים):** הזנת פרטים אישיים, מדדי גוף, מטרת תזונה וחישוב יעדים מדעי אוטומטי, יחד עם התחלה של יומן נקי לחלוטין ללא מידע דמה מזויף.
- 💪 **עלייה נקייה במסת שריר (Lean Bulk):** מודל מדעי ייעודי המחשב עודף קלורי מתון (+250 קק"ל) עם חלבון גבוה (32% מסך הקלוריות / 2.2g לק"ג) לתוספת שריר נקייה.
- 🖐️ **מדריך כמויות חכם ללא משקל (שיטת כף היד):** אפשרות מעקב קלה למי שלא שוקל מזון במאזניים (כף יד = חלבון, אגרוף = פחמימה, אגודל = שומן, שתי כפות = ירקות, או לפי יחידות מנה שלמות).
- 🖥️ **תצוגת כרטיסיות מותאמת לדסקטופ ולמובייל:** הצגה טבעית (Inline) של מסכי הפרופיל והתפריטים ללא חיתוך או כיסוי כהה.
- 📊 **לוח בקרה חכם (Smart Dashboard):** טבעת קלוריות מונפשת, מדדי חלבון/פחמימה/שומן, מעקב 8 כוסות מים עם אפקט קונפטי.
- 📖 **יומן תזונה יומי (Day Diary):** חלוקה ל-4 ארוחות (בוקר, צהריים, ערב, נשנושים) עם סיכום מאקרו וניווט תאריכים.
- 🥗 **בונה תפריטים אישי (Custom Meal Plan Builder):** יצירת תפריטים מותאמים עם חישוב מאקרו חי והחלה בלחיצה אחת על היומן.
- ⚡ **סייקלינג קלוריות יומי והתאמת אימונים (Workout & Calorie Cycling):** התאמת קלוריות ופחמימות דינמית לפי סוג ועצימות האימון (מנוחה, כוח, אימון כבד, אירובי, HIIT) ולוח שבועי מובנה.
- 🔒 **בידוד נתונים מלא לכל משתמש (User-Scoped Data Isolation):** הפרדה מוחלטת של יומנים, מאכלים, תפריטים אישיים, מעקב מים והתראות עבור כל משתמש בנפרד (מעבר בין חשבונות מציג אך ורק את הנתונים שהמשתמש הספציפי הזין).
- 👆 **אימות ביומטרי (WebAuthn Biometric Auth):** התחברות מהירה בטביעת אצבע / FaceID / TouchID ומערכת ניהול משתמשים.
- 🔔 **התראות Web Push ותזכורות עצמאיות:** הגדרת שעות מדויקות לארוחות בוקר, צהריים, ערב ושתיית מים ישירות מפעמון ההתראות.
- 🧆 **מאגר מזון ישראלי עשיר:** מגוון קציצות (בקר, עוף, דגים, ירק, עדשים), שווארמה, שניצל, פתיתים, מג'דרה, ממרחים, גבינות ועוד.
- 📷 **סורק ברקוד ו-AI:** סריקת מוצרים ישירות מהמצלמה מול Open Food Facts וזיהוי צלחות ב-AI.
- 🌙 **מצב לילה ו-PWA:** תמיכה מלאה בהתקנה למסך הבית בטלפון ומעבר בלחיצה בין Light ל-Dark Mode.
- 🎨 **אנימציות חלקות:** מעברי עמודים וסדינים מונפשים (`animate-page-enter`, `animate-modal-sheet`).

---

## 💻 הרצה מקומית (Local Development)

```bash
# התקנת תלויות
npm install

# הרצת שרת פיתוח
npm run dev

# פתיחה למכשירים ברשת המקומית
npm run dev -- --host

# בניית גרסת ייצור
npm run build
```

---

## 🚀 פריסה אוטומטית (Deployment)

הפרויקט מחובר ב-Continuous Deployment ל-Render: כל Push לענף `master` ב-GitHub פורס אוטומטית את האפליקציה ל-HTTPS בכתובת החיה.
