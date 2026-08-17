import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Send,
  Loader2,
  Check,
  Trash2,
  SunMedium,
  Sun,
  Sunset,
  Apple,
  Info,
} from 'lucide-react';
import type { MealType } from '../../types';
import type { AINLParseResult, AIParsedFoodItem } from '../../types/ai';
import { AIService } from '../../services/aiService';

interface AINaturalLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  apiKey?: string;
  onLogParsedItems: (mealType: MealType, items: AIParsedFoodItem[]) => void;
}

export const AINaturalLanguageModal: React.FC<AINaturalLanguageModalProps> = ({
  isOpen,
  onClose,
  defaultMealType = 'lunch',
  apiKey,
  onLogParsedItems,
}) => {
  const [promptText, setPromptText] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);
  const [isRecording, setIsRecording] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<AINLParseResult | null>(null);
  const [editedItems, setEditedItems] = useState<AIParsedFoodItem[]>([]);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedMealType(defaultMealType);
      setPromptText('');
      setParsedResult(null);
      setEditedItems([]);
      setSpeechError(null);
    } else {
      stopVoiceRecording();
    }
  }, [isOpen, defaultMealType]);

  const presetExamples = [
    {
      label: '🍗 צהריים עשיר בחלבון',
      text: 'חזה עוף צלוי 160 גרם עם כוס אורז בסמטי וסלט קצוץ עם שמן זית',
      mealType: 'lunch' as MealType,
    },
    {
      label: '🥑 בוקר מאוזן',
      text: '2 ביצים L, שתי פרוסות לחם כוסמין, חצי אבוקדו וכוס קפה שחור',
      mealType: 'breakfast' as MealType,
    },
    {
      label: '🥤 שייק חלבון מהיר',
      text: 'שייק עם כף אבקת חלבון, בננה אחת, כף חמאת בוטנים ו-200 מ״ל חלב שקדים',
      mealType: 'snack' as MealType,
    },
    {
      label: '🥙 שווארמה בלאפה',
      text: 'שווארמה הודו בלאפה עם 2 כפות טחינה, סלט כרוב ופחית קולה זירו',
      mealType: 'lunch' as MealType,
    },
    {
      label: '🐟 סלמון ובטטה',
      text: 'פילה סלמון אפוי 180 גרם עם בטטה אפויה בינונית וברוקולי מאודה',
      mealType: 'dinner' as MealType,
    },
  ];

  const handleStartVoiceRecording = () => {
    setSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('זיהוי קולי אינו נתמך בדפדפן זה. ניתן להקליד טקסט חופשי בתיבה.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'he-IL';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setPromptText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setSpeechError('הגישה למיקרופון נחסמה. אשר גישה בהגדרות הדפדפן.');
        } else {
          setSpeechError('לא הצלחנו לקלוט את הקול. נסה שוב או הקלד ידנית.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Voice recording setup error:', err);
      setIsRecording(false);
      setSpeechError('שגיאה בהפעלת המיקרופון.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleParseText = async (textToParse?: string) => {
    const text = (textToParse || promptText).trim();
    if (!text) return;

    stopVoiceRecording();
    setIsParsing(true);
    setSpeechError(null);

    try {
      const result = await AIService.parseNaturalLanguageMeal(text, selectedMealType, apiKey);
      setParsedResult(result);
      setEditedItems(result.items);
    } catch (err) {
      console.error('Failed to parse text with AI:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSelectPreset = (preset: (typeof presetExamples)[0]) => {
    setPromptText(preset.text);
    setSelectedMealType(preset.mealType);
    handleParseText(preset.text);
  };

  const handleUpdateItemGram = (index: number, newGrams: number) => {
    const safeGrams = Math.max(1, newGrams);
    const updated = [...editedItems];
    const item = updated[index];
    if (item.grams > 0) {
      const ratio = safeGrams / item.grams;
      item.calories = Math.round(item.calories * ratio);
      item.protein = Math.round(item.protein * ratio * 10) / 10;
      item.carbs = Math.round(item.carbs * ratio * 10) / 10;
      item.fat = Math.round(item.fat * ratio * 10) / 10;
    }
    item.grams = safeGrams;
    setEditedItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
  };

  const calculateTotals = () => {
    const totalKcal = editedItems.reduce((s, i) => s + (i.calories || 0), 0);
    const totalP = Math.round(editedItems.reduce((s, i) => s + (i.protein || 0), 0) * 10) / 10;
    const totalC = Math.round(editedItems.reduce((s, i) => s + (i.carbs || 0), 0) * 10) / 10;
    const totalF = Math.round(editedItems.reduce((s, i) => s + (i.fat || 0), 0) * 10) / 10;
    return { totalKcal, totalP, totalC, totalF };
  };

  const handleConfirmAndLog = () => {
    if (editedItems.length === 0) return;
    onLogParsedItems(selectedMealType, editedItems);
    onClose();
  };

  const totals = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-black text-base sm:text-lg text-on-surface">
                  הזנה קולית וחופשית ב-AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  טבעי ומהיר
                </span>
              </div>
              <p className="text-xs text-outline mt-0.5">
                דבר או הקלד בעברית חופשית – ה-AI יפרק למרכיבים ומאקרו
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Target Meal Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-outline block">לאיזו ארוחה לרשום?</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { type: 'breakfast' as MealType, label: 'בוקר', icon: <SunMedium className="w-3.5 h-3.5" /> },
                { type: 'lunch' as MealType, label: 'צהריים', icon: <Sun className="w-3.5 h-3.5" /> },
                { type: 'dinner' as MealType, label: 'ערב', icon: <Sunset className="w-3.5 h-3.5" /> },
                { type: 'snack' as MealType, label: 'נשנוש', icon: <Apple className="w-3.5 h-3.5" /> },
              ].map((meal) => (
                <button
                  key={meal.type}
                  type="button"
                  onClick={() => setSelectedMealType(meal.type)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                    selectedMealType === meal.type
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-surface-container-low text-on-surface border-surface-container-high/60 hover:bg-surface-container'
                  }`}
                >
                  {meal.icon}
                  <span>{meal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice / Text Input Box */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={3}
                placeholder="למשל: אכלתי בצהריים 150 גרם חזה עוף עם כוס אורז בסמטי וסלט קצוץ עם כף טחינה..."
                className="w-full p-3.5 pl-24 rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
              />

              {/* Voice Mic Button inside input */}
              <div className="absolute left-2.5 bottom-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : handleStartVoiceRecording}
                  className={`p-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1 ${
                    isRecording
                      ? 'bg-error text-on-error animate-pulse scale-105'
                      : 'bg-primary/10 hover:bg-primary/20 text-primary active:scale-95'
                  }`}
                  title={isRecording ? 'עצור הקלטה' : 'הקלטה קולית בעברית'}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span className="text-[11px] font-extrabold pr-1">מקליט...</span>
                    </>
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={!promptText.trim() || isParsing}
                  onClick={() => handleParseText()}
                  className="p-2.5 rounded-xl bg-primary text-on-primary disabled:opacity-40 hover:bg-primary-dark transition-all active:scale-95 shadow-xs"
                  title="נתח ארוחה ב-AI"
                >
                  {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {speechError && (
              <p className="text-[11px] text-error font-medium px-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{speechError}</span>
              </p>
            )}
          </div>

          {/* Preset Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-outline block">קיצורי דרך לדוגמה:</span>
            <div className="flex flex-wrap gap-1.5">
              {presetExamples.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high/60 text-xs font-semibold text-on-surface transition-all active:scale-95 truncate max-w-[210px]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parsing Spinner */}
          {isParsing && (
            <div className="p-6 rounded-2xl bg-surface-container-low/70 border border-primary/20 flex flex-col items-center justify-center gap-2 text-center animate-in fade-in">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
              <span className="text-xs font-bold text-on-surface">ה-AI מפרק את הארוחה ומחשב ערכים...</span>
              <span className="text-[11px] text-outline">בודק גרמים, חלבונים, פחמימות ושומנים</span>
            </div>
          )}

          {/* Parsed Results Breakdown & Adjustments */}
          {parsedResult && !isParsing && (
            <div className="space-y-3 pt-2 border-t border-surface-container-high animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-on-surface">פירוט המרכיבים שזוהו</h4>
                  <p className="text-[11px] text-outline">ניתן לערוך משקל או למחוק מרכיב לפני ההוספה</p>
                </div>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {editedItems.length} מרכיבים
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {editedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high/70 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs sm:text-sm text-on-surface block truncate">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-outline mt-0.5">
                        <span className="font-bold text-tertiary">{item.calories} קק"ל</span>
                        <span>•</span>
                        <span>חלבון: {item.protein}g</span>
                        <span>•</span>
                        <span>פחמ': {item.carbs}g</span>
                        <span>•</span>
                        <span>שומן: {item.fat}g</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-xl border border-surface-container-high">
                        <input
                          type="number"
                          value={item.grams}
                          onChange={(e) => handleUpdateItemGram(idx, Number(e.target.value))}
                          className="w-12 bg-transparent text-center text-xs font-bold text-on-surface focus:outline-none"
                          min={1}
                        />
                        <span className="text-[10px] text-outline font-bold">גרם</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1.5 rounded-xl hover:bg-error-container/30 text-outline hover:text-error transition-colors"
                        title="הסר מרכיב זה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Totals Card */}
              <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 grid grid-cols-4 gap-1 text-center">
                <div>
                  <span className="text-[10px] text-outline block">סך קלוריות</span>
                  <span className="font-headline font-black text-tertiary text-sm sm:text-base">
                    {totals.totalKcal}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline block">חלבון</span>
                  <span className="font-headline font-black text-on-surface text-sm sm:text-base">
                    {totals.totalP}g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline block">פחמימות</span>
                  <span className="font-headline font-black text-on-surface text-sm sm:text-base">
                    {totals.totalC}g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-outline block">שומן</span>
                  <span className="font-headline font-black text-on-surface text-sm sm:text-base">
                    {totals.totalF}g
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-container-high bg-surface-container-low/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all"
          >
            ביטול
          </button>

          {parsedResult && editedItems.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmAndLog}
              className="px-5 py-2.5 rounded-2xl bg-primary text-on-primary hover:bg-primary-dark font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>הוסף {editedItems.length} פריטים ליומן 🚀</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
