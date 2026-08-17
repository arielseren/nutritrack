import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  Sparkles,
  Zap,
  Dumbbell,
  Calendar,
  Utensils,
  Shield,
  Bell,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Scale,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideSection {
  id: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  summary: string;
  content: React.ReactNode;
  keywords: string[];
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('onboarding');

  const guideSections: GuideSection[] = [
    {
      id: 'onboarding',
      title: '1. תהליך ההרשמה וחישוב יעדים מדעי (BMR & TDEE)',
      badge: 'יעדים ומדדים',
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      summary: 'הזנת פרטים אישיים, מדדי גוף, יעדי תזונה וחישוב צריכה קלורית מדעית',
      keywords: ['הרשמה', 'BMR', 'TDEE', 'יעדים', 'קלוריות', 'משקל', 'גובה', 'חיטוב', 'מסה', 'lean bulk'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            אשף הקליטה (Onboarding) של <strong>NutriTrack</strong> מבוסס על משוואת מיפלין סנט ג'ור (<strong>Mifflin-St Jeor</strong>) המדויקת:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-outline">
            <li><strong className="text-on-surface">שלב 1 - פרטי גישה:</strong> שם, אימייל וסיסמה.</li>
            <li><strong className="text-on-surface">שלב 2 - מדדי גוף:</strong> מין, גיל, גובה, משקל נוכחי ומשקל יעד.</li>
            <li><strong className="text-on-surface">שלב 3 - מטרת תזונה ופעילות:</strong> בחירה בין ירידה במשקל, שמירה על משקל, עלייה נקייה במסת שריר (Lean Bulk) או עלייה במסה.</li>
          </ul>
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold">
            ✨ משתמש חדש מתחיל עם יומן נקי לחלוטין (0 קלוריות, 0 מים וללא מידע דמה) להתחלה אישית וחלקה!
          </div>
        </div>
      ),
    },
    {
      id: 'direct_logging',
      title: '2. הזנה ישירה ותיעוד מזון מהיר (ללא 100 גרם)',
      badge: 'תיעוד מהיר',
      icon: <Zap className="w-4 h-4 text-tertiary" />,
      summary: 'הזנת קלוריות ומאקרו ישירות ליומן, שיטת כף היד וחיפוש במאגר הישראלי',
      keywords: ['הזנה ישירה', '100 גרם', 'כף יד', 'חיפוש', 'מאכלים', 'גרמים', 'מנה'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            אינך צריך לחשב ערכים ל-100 גרם או לשקול כל מאכל במאזניים:
          </p>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
              <strong className="text-primary block mb-1">לשונית "הזנה ישירה" במסך החיפוש:</strong>
              <p className="text-outline text-[11px]">
                הזן את סך הקלוריות, החלבון, הפחמימות והשומן של המנה או הארוחה והוסף ישירות ליומן היום ללא צורך במדידות!
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
              <strong className="text-primary block mb-1">מדריך כמויות ויזואלי (שיטת כף היד):</strong>
              <ul className="text-outline text-[11px] space-y-1">
                <li>• <strong>כף יד פתוחה:</strong> מנת חלבון (בשר/עוף/קציצות ~ 120-150g).</li>
                <li>• <strong>אגרוף סגור:</strong> מנת פחמימה (אורז/פתיתים/פסטה ~ 1 כוס).</li>
                <li>• <strong>שתי כפות ידיים:</strong> סלט וירקות מבושלים (~ 200g).</li>
                <li>• <strong>אגודל מלא:</strong> שומן וממרח (כף טחינה/שמן זית ~ 15g).</li>
              </ul>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
              <strong className="text-primary block mb-1">חיפוש במאגר ישראלי עשיר ועריכת מאכלים:</strong>
              <p className="text-outline text-[11px]">
                חפש מאכלים, בחר לפי יחידות מנה מובנות (קציצה, ביצה, פרוסה, גביע) או הזן גרמים בקלות.
              </p>
              <p className="text-outline text-[11px] mt-1 pt-1 border-t border-surface-container-high/60">
                ✨ <strong>עריכה ומחיקה:</strong> ליד כל מאכל אישי שיצרת מופיעים כפתורי <strong>עריכה (✏️)</strong> ו-<strong>מחיקה (🗑️)</strong> לעדכון ערכים או הסרה מיידית.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'workout_cycling',
      title: '3. סייקלינג קלוריות יומי והתאמה לאימונים',
      badge: 'אימונים ומנוחה',
      icon: <Dumbbell className="w-4 h-4 text-primary" />,
      summary: 'התאמת יעד הקלוריות והפחמימות לכל יום בנפרד לפי סוג ועצימות האימון',
      keywords: ['אימון', 'אימונים', 'מנוחה', 'סייקלינג', 'כוח', 'אירובי', 'HIIT', 'שריפת קלוריות'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            מערכת <strong>Workout & Calorie Cycling</strong> מתאימה אוטומטית את יעד הקלוריות והפחמימות לכל יום:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="font-bold text-on-surface block">יום מנוחה:</span>
              <span className="text-outline">מאזן בסיסי לשיקום השרירים</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="font-bold text-primary block">אימון כוח:</span>
              <span className="text-outline">+250 קק"ל ופחמימות למילוי מאגרים</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="font-bold text-tertiary block">אימון כבד/רגליים:</span>
              <span className="text-outline">+450 קק"ל ואנרגיה מקסימלית</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-container-low border border-surface-container-high">
              <span className="font-bold text-secondary block">אירובי / ריצה:</span>
              <span className="text-outline">+350 קק"ל לפעילות סיבולת</span>
            </div>
          </div>
          <p className="text-outline text-[11px]">
            ניתן לבחור מצב אימון בלחיצה על "שינוי" בדף הבית, או להגדיר לוח שבועי קבוע בהגדרות הפרופיל (תבניות AB, PPL, Full Body).
          </p>
        </div>
      ),
    },
    {
      id: 'weekly_planner',
      title: '4. מתכנן תפריט שבועי ורשימת קניות חכמה',
      badge: 'תכנון שבועי',
      icon: <Calendar className="w-4 h-4 text-secondary" />,
      summary: 'תכנון 7 ימי השבוע, שכפול תפריטים, החלה על היומן והפקת רשימת קניות',
      keywords: ['תכנון שבועי', 'מתכנן', 'רשימת קניות', 'שבוע', 'קניות', 'סופר', 'שכפול', 'וואטסאפ'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            מסך <strong>תכנון שבועי</strong> בלשונית התפריטים מאפשר לך לסדר את כל השבוע מראש:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-outline">
            <li><strong className="text-on-surface">שיבוץ יומי:</strong> בחר תפריט מוכן או אישי לכל יום מראשון עד שבת.</li>
            <li><strong className="text-on-surface">שכפול מהיר:</strong> שכפל תפריט של יום ראשון לכל שאר ימי השבוע בלחיצה אחת.</li>
            <li><strong className="text-on-surface">החלה מלאה על היומן:</strong> בלחיצה על כפתור "החל את כל השבוע", כל 7 הימים הקרובים ביומן יתמלאו בארוחות המתאימות!</li>
            <li><strong className="text-on-surface">רשימת קניות שבועית 🛒:</strong> מרכזת אוטומטית את כל המצרכים, המשקלים ומספר הארוחות לשבוע הקרוב, עם צ'קבוקסים לסימון בסופר וכפתור העתקה מהירה ל-WhatsApp.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'meal_builder',
      title: '5. בונה תפריטי תזונה מותאמים אישית',
      badge: 'תפריטים אישיים',
      icon: <Utensils className="w-4 h-4 text-primary" />,
      summary: 'הרכבת תפריטים אישיים ל-4 ארוחות עם חישוב מאקרו דינמי בזמן אמת',
      keywords: ['בונה תפריטים', 'תפריט אישי', 'הרכבה', 'חישוב מאקרו', 'תפריט מוכן'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            בלשונית <strong>"התפריטים שלי"</strong> תוכל לבנות תפריטים מותאמים אישית:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-outline">
            <li><strong className="text-on-surface">הגדרת תפריט:</strong> שם התפריט, מטרת התזונה ותיאור.</li>
            <li><strong className="text-on-surface">הוספת מאכלים וחיפוש:</strong> בחירת מאכלים מתוך המאגר וכמויות מדויקות ל-4 ארוחות (בוקר, צהריים, ערב, נשנוש).</li>
            <li><strong className="text-on-surface">יצירת מאכל והזנה ישירה על המקום:</strong> בלשונית הוספת מאכל, ניתן ליצור מאכל מותאם או להזין קלוריות ומאקרו ישירות ללא צורך לצאת מבונה התפריט!</li>
            <li><strong className="text-on-surface">חישוב חי בזמן אמת:</strong> סרגלי המאקרו והקלוריות מתעדכנים מיידית תוך כדי עריכת המאכלים.</li>
            <li><strong className="text-on-surface">עריכה ומחיקה לתפריטים:</strong> כל תפריט שבנית ניתן לעריכה חוזרת או למחיקה בלשונית "התפריטים שלי".</li>
            <li><strong className="text-on-surface">החלה ושיבוץ:</strong> החלה בלחיצה אחת על יומן היום או שיבוץ במתכנן השבועי.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'data_isolation',
      title: '6. אבטחה ביומטרית ובידוד נתונים לכל משתמש',
      badge: 'אבטחה ופרטיות',
      icon: <Shield className="w-4 h-4 text-primary" />,
      summary: 'התחברות בטביעת אצבע, הפרדת נתונים מוחלטת לכל חשבון ובורר משתמשים',
      keywords: ['ביומטרי', 'טביעת אצבע', 'FaceID', 'אבטחה', 'משתמשים', 'חשבונות', 'בידוד', 'פרטיות'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            כל הנתונים ב-<strong>NutriTrack</strong> מבודדים ומאובטחים:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-outline">
            <li><strong className="text-on-surface">בידוד מלא לכל משתמש:</strong> כל יומן, ארוחה, מעקב מים, תפריט ומאכל אישי נשמרים תחת מזהה המשתמש הייחודי.</li>
            <li><strong className="text-on-surface">בורר חשבונות מהיר:</strong> מעבר בין חשבונות שונים באותו מכשיר בלחיצה אחת מתוך מסך ההתחברות או הגדרות הפרופיל.</li>
            <li><strong className="text-on-surface">אימות ביומטרי (WebAuthn):</strong> התחברות מאובטחת ומהירה באמצעות טביעת אצבע, Touch ID או Face ID.</li>
            <li><strong className="text-on-surface">ייצוא וייבוא גיבויים:</strong> שמירת כל נתוני המשתמש כקובץ JSON מקומי לשחזור קל.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'push_reminders',
      title: '7. התראות ותזכורות Push חכמות',
      badge: 'התראות ומים',
      icon: <Bell className="w-4 h-4 text-secondary" />,
      summary: 'תזכורות לשתיית מים וארוחות ישירות למכשיר והגדרת שעות מדויקות',
      keywords: ['התראות', 'תזכורות', 'Push', 'מים', 'ארוחות', 'שעות', 'פעמון'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            הפעלת התראות Web Push לתזכורות בזמן אמת:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-outline">
            <li><strong className="text-on-surface">תזכורת שתיית מים:</strong> תזכורת בכל 90 דקות (או מרווח שתבחר) לעמידה ביעד 8 כוסות המים.</li>
            <li><strong className="text-on-surface">תזמון שעות ארוחה עצמאי:</strong> הגדרת שעות מדויקות לארוחת בוקר, צהריים וערב ישירות מתוך פעמון ההתראות (🔔).</li>
            <li><strong className="text-on-surface">בדיקת התראה:</strong> כפתור בדיקה מיידי לווידוא קבלת התראות במכשיר.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'pwa_theme',
      title: '8. התקנה כאפליקציה (PWA) ומצב לילה',
      badge: 'PWA & Theme',
      icon: <Smartphone className="w-4 h-4 text-tertiary" />,
      summary: 'התקנה למסך הבית בטלפון ומעבר בין מצב יום למצב לילה',
      keywords: ['PWA', 'התקנה', 'אפליקציה', 'מסך הבית', 'מצב לילה', 'Dark Mode', 'אייפון', 'אנדרואיד'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            אפליקציית NutriTrack מותאמת באופן מלא להתקנה ישירה במסך הבית:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-outline">
            <li><strong className="text-on-surface">באייפון (Safari iOS):</strong> לחץ על כפתור השיתוף בתחתית ובחר <em>"הוסף למסך הבית"</em>.</li>
            <li><strong className="text-on-surface">באנדרואיד (Chrome):</strong> לחץ על תפריט 3 הנקודות ובחר <em>"התקן אפליקציה"</em> או <em>"הוסף למסך הבית"</em>.</li>
            <li><strong className="text-on-surface">מצב יום / לילה:</strong> מעבר בלחיצה אחת על סמל השמש / ירח בסרגל העליון לנוחות מרבית בחושך.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'weight_tracking',
      title: '9. מעקב משקל, גרפים ותזכורת שקילה שבועית',
      badge: 'משקל וגרפים',
      icon: <Scale className="w-4 h-4 text-primary" />,
      summary: 'מעקב אחר משקל התחלתי, משקל נוכחי ומשקל יעד, גרף מגמה ותזכורות',
      keywords: ['משקל', 'שקילה', 'גרף', 'התקדמות', 'יעד', 'משקל התחלתי', 'משקל יעד', 'תזכורת שקילה'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            מסך <strong>"מעקב משקל, גרפים והתקדמות"</strong> (נגיש מדף הבית ומהפרופיל) מאפשר לך:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-outline">
            <li><strong className="text-on-surface">3 מדדי מפתח:</strong> משקל התחלתי, משקל נוכחי ומשקל יעד עם חישוב אחוז ההתקדמות וק״ג שנותרו.</li>
            <li><strong className="text-on-surface">גרף מגמה אינטראקטיבי:</strong> מציג את עקומת השינוי לאורך הזמן ביחס לקו היעד.</li>
            <li><strong className="text-on-surface">רישום שקילה מהיר:</strong> הזנת משקל (ק"ג), תאריך והערות בכל שקילה.</li>
            <li><strong className="text-on-surface">תזכורת שקילה שבועית:</strong> קבלת התראת Push שבועית ביום ובשעה שתבחר (למשל: כל יום ראשון ב-08:00).</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'ai_suite',
      title: '10. חבילת ה-AI החכמה: סורק צלחות, OCR תוויות והזנה קולית',
      badge: 'כלי AI מתקדמים',
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      summary: 'סריקת צלחות בתמונה, חילוץ ערכי 100 גרם מתוויות והזנה קולית חופשית בעברית',
      keywords: ['AI', 'בינה מלאכותית', 'סורק צלחת', 'מצלמה', 'תמונה', 'OCR', 'תווית', 'הזנה קולית', 'מיקרופון', 'מתכונים'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            מרכז ה-AI של <strong>NutriTrack</strong> (כפתור ✨ AI בסרגל העליון ובדף הבית) כולל 4 מנועי בינה מלאכותית עוצמתיים:
          </p>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
              <strong className="text-primary block mb-1">📸 סורק צלחות וארוחות (AI Plate Scanner):</strong>
              <p className="text-outline text-[11px]">
                צלם את הצלחת או בחר תמונה מהגלריה — ה-AI מזהה את כל המרכיבים בצלחת, מעריך משקלים בגרמים, מחשב קלוריות ומאקרו ומאפשר הוספה מהירה ליומן.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
              <strong className="text-primary block mb-1">🏷️ סורק תוויות ערכים תזונתיים (Nutrition Label OCR):</strong>
              <p className="text-outline text-[11px]">
                צלם את טבלת ה-100 גרם מגב המוצר בסופר — המערכת מחלצת אוטומטית קלוריות, חלבון, פחמימות, שומן וסודיום ושומרת כמאכל אישי במאגר.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
              <strong className="text-primary block mb-1">🎙️ הזנה קולית וחופשית בעברית טבעית:</strong>
              <p className="text-outline text-[11px]">
                לחץ על המיקרופון ודבר חופשי (למשל: <em>"אכלתי 160 גרם חזה עוף עם כוס אורז בסמטי וסלט קצוץ עם שמן זית"</em>) — ה-AI מפרק למרכיבים ומתעד ביומן.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
              <strong className="text-primary block mb-1">🍳 מחולל מתכונים והשלמת חוסרי מאקרו:</strong>
              <p className="text-outline text-[11px]">
                מחשב את יתרת הקלוריות והחלבון שחסרים לך להיום ומייצר 3 הצעות לארוחות/מתכונים שסוגרים בדיוק את היעד!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'ai_coach_personas',
      title: '11. יועצי התזונה והספורט ב-AI (איתי ומאיה) והתמודדות עם שובע כבד',
      badge: 'ייעוץ וזיכרון',
      icon: <Sparkles className="w-4 h-4 text-tertiary" />,
      summary: 'בחירת יועץ/יועצת אישיים, מענה מדעי למצבי כבדות ונפיחות וזיכרון מתמשך',
      keywords: ['יועץ', 'יועצת', 'איתי', 'מאיה', 'מאמן AI', 'שובע', 'מפוצץ', 'כבד', 'נפיחות', 'שייק חלבון', 'זיכרון'],
      content: (
        <div className="space-y-2.5 text-xs text-on-surface leading-relaxed">
          <p>
            צ'אט המאמן האישי מבוסס על ספר חוקים קליני ומדעי מלא:
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
                <span className="font-bold text-on-surface block">👨‍⚕️ איתי (M.Sc):</span>
                <span className="text-outline">דיאטן קליני וספורט • ממוקד ביצועים, סייקלינג פחמימות, עלייה נקייה בשריר והיפרטרופיה.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
                <span className="font-bold text-on-surface block">👩‍⚕️ מאיה (R.D):</span>
                <span className="text-outline">תזונאית קלינית • מומחית להקשבה לגוף, בריאות מערכת העיכול, הפחתת נפיחות והרגלים.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-on-surface">
              <strong className="text-amber-500 block mb-1">🤢 התמודדות עם תחושת פיצוץ, כבדות ושובע קיצוני:</strong>
              <p className="text-outline text-[11px]">
                כאשר אתה מדווח שאתה מרגיש "מפוצץ ולא מסוגל לאכול עוד", היועץ לעולם לא יכריח אותך לאכול נפח גדול! הוא יציע לעבור ל<strong>קלוריות נוזליות ודחוסות (Liquid Macros)</strong> כמו שייק חלבון קל לעיכול שנספג במהירות, או יבצע התאמה קלורית להיום, וילמד את ההעדפה בזיכרון המערכת.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-high">
              <strong className="text-primary block mb-1">🧠 זיכרון אישי ופרוטוקול קליני:</strong>
              <p className="text-outline text-[11px]">
                היועצים זוכרים את ההעדפות והרגישויות שלך. ניתן לצפות בזיכרון המערכת ובספר החוקים הקליני ישירות מתוך כפתור <strong>"פרוטוקול" (📄)</strong> בצ'אט.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return guideSections;
    const q = searchQuery.toLowerCase().trim();
    return guideSections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery, guideSections]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] sm:max-w-xl h-[94dvh] sm:h-[88dvh] sm:max-h-[90dvh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high animate-modal-sheet modal-safe-bottom">
        
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high bg-surface-container-low flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">מדריך למשתמש</h3>
              <p className="text-[11px] text-outline">כל הכלים והיכולות של NutriTrack במקום אחד</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search inside guide */}
        <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש נושא במדריך (אימונים, הזנה ישירה, תפריט שבועי)..."
              className="w-full bg-surface-container-lowest text-on-surface py-2 pr-9 pl-8 rounded-xl border border-surface-container-high focus:border-primary text-xs outline-hidden"
            />
            <Search className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-outline hover:text-on-surface absolute left-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Accordions List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {filteredSections.length === 0 ? (
            <div className="py-12 text-center text-outline">
              <p className="font-bold text-sm text-on-surface">לא נמצאו נושאים התואמים לחיפוש</p>
              <p className="text-xs mt-1">נסה לחפש מילים כמו: קלוריות, אימון, תפריט, מים, ברקוד</p>
            </div>
          ) : (
            filteredSections.map((sec) => {
              const isExpanded = expandedSectionId === sec.id;
              return (
                <div
                  key={sec.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-surface-container-lowest border-primary/40 shadow-xs'
                      : 'bg-surface-container-low border-surface-container-high/60 hover:bg-surface-container'
                  }`}
                >
                  <div
                    onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                    className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                        {sec.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-headline font-bold text-xs text-on-surface truncate">
                            {sec.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-md bg-surface-container text-primary font-bold text-[9px]">
                            {sec.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-outline truncate mt-0.5">{sec.summary}</p>
                      </div>
                    </div>

                    <div className="p-1 text-outline">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3.5 pt-1 border-t border-surface-container-high/60 bg-surface-container-lowest animate-in fade-in duration-150">
                      {sec.content}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-surface-container-high text-center text-[10px] text-outline flex-shrink-0">
          🥗 NutriTrack Israel • מעקב תזונה יומי ואימונים חכם
        </div>

      </div>
    </div>
  );
};
