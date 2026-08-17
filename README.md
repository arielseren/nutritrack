# 🥗 NutriTrack - Daily Nutrition & Calorie Tracker

אפליקציית ווב ו-PWA מתקדמת למעקב תזונה יומי, ניהול קלוריות, מקרואים, מעקב משקל שבועי וגרפי התקדמות, שתיית מים, התראות Push חכמות, אימות ביומטרי (טביעת אצבע), תהליך קליטה אינטראקטיבי (Onboarding), תמיכה בעלייה נקייה במסת שריר (Lean Bulk) ובונה תפריטים מותאמים אישית בעברית מלאה (RTL).

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
- **Icons & Visual Effects:** Lucide React (Clean Vector Icons), Google Material Symbols, Canvas Confetti
- **Biometric Security:** WebAuthn API (`navigator.credentials`) להתחברות בטביעת אצבע / FaceID
- **Push & Service Worker:** Service Worker API (`public/sw.js`) + Notification API לתזכורות מים, ארוחות ושקילה שבועית
- **Data Persistence:** LocalStorage API + Local JSON Backup Export / Import

---

## 🌟 יכולות מרכזיות

1. **מעקב משקל שבועי, גרפים והתקדמות:** משקל התחלתי, משקל נוכחי ומשקל יעד, גרף מגמה אינטראקטיבי ותזכורת שקילה שבועית.
2. **בונה תפריטים מרווח עם יצירת מאכל והזנה ישירה על המקום.**
3. **עריכה ומחיקה מלאה למאכלים אישיים ולתפריטים מותאמים.**
4. **פונט מוגדל וקריא בכל המכשירים והרזולוציות.**
5. **אשף קליטת משתמש חדש (Onboarding) עם יומן נקי.**
6. **תמיכה בעלייה נקייה במסת שריר (Lean Bulk).**
7. **הזנה ישירה של קלוריות ומאקרו ללא חישוב 100 גרם ושיטת כף היד.**
8. **מתכנן תפריט שבועי (7 ימים) ורשימת קניות שבועית חכמה עם שיתוף לוואטסאפ.**
9. **סייקלינג קלוריות יומי והתאמה לאימונים.**
10. **בידוד נתונים מוחלט לכל משתמש ואבטחה ביומטרית (WebAuthn).**
11. **התראות Web Push חכמות ומדריך למשתמש אינטראקטיבי (9 פרקים).**

---

## 💻 פיתוח מקומי

```bash
npm install
npm run dev
npm run build
```
