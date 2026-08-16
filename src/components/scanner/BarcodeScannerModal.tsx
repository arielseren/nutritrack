import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  X,
  Camera,
  Check,
  AlertCircle,
  Utensils,
  Sparkles,
  Loader2,
  Upload,
  Globe,
  Plus,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import type { FoodItem, MealType } from '../../types';
import { calculateItemNutrition } from '../../services/nutritionCalculator';
import { OpenFoodFactsService } from '../../services/openFoodFacts';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodDatabase: FoodItem[];
  defaultMealType?: MealType;
  onLogFood: (mealType: MealType, food: FoodItem, grams: number, amount: number, unit: string) => void;
}

type ScannerTab = 'barcode' | 'ai_camera';

interface AIFoodAnalysisResult {
  title: string;
  description: string;
  confidence: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingGrams: number;
  servingUnit: string;
  imageUrl: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  foodDatabase,
  defaultMealType = 'lunch',
  onLogFood,
}) => {
  const [activeTab, setActiveTab] = useState<ScannerTab>('barcode');

  // Barcode scanner state
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);
  const [amountValue, setAmountValue] = useState(1);

  // AI Meal Recognition state
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiResult, setAiResult] = useState<AIFoodAnalysisResult | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'reader-barcode-scanner';

  useEffect(() => {
    if (isOpen) {
      setSelectedMealType(defaultMealType);
      setScannedFood(null);
      setScanError(null);
      setManualBarcode('');
      setAmountValue(1);
      setAiResult(null);
      setIsAnalyzingAI(false);
    } else {
      stopCamera();
    }
  }, [isOpen, defaultMealType]);

  const startCamera = async () => {
    try {
      setScanError(null);
      setIsCameraActive(true);

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 160 },
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
    } catch (err: any) {
      console.warn('Camera error:', err);
      setIsCameraActive(false);
      setScanError('לא ניתן לגשת למצלמה במכשיר זה. ניתן להשתמש בהזנה ידנית או בברקודים לדוגמה למטה.');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleBarcodeDetected = (code: string) => {
    stopCamera();
    findFoodByBarcode(code);
  };

  const findFoodByBarcode = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setScanError(null);
    setScannedFood(null);

    // 1. Check local food database
    const localFound = foodDatabase.find((f) => f.barcode === cleanCode);
    if (localFound) {
      setScannedFood(localFound);
      return;
    }

    // 2. Fetch live from Open Food Facts API
    setIsSearchingOnline(true);
    try {
      const onlineProduct = await OpenFoodFactsService.fetchProductByBarcode(cleanCode);
      if (onlineProduct) {
        setScannedFood(onlineProduct);
      } else {
        setScanError(`לא נמצא מוצר עבור ברקוד: ${cleanCode} (נבדק גם במאגר העולמי)`);
      }
    } catch (err) {
      setScanError(`שגיאה בחיפוש הברקוד: ${cleanCode}`);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      findFoodByBarcode(manualBarcode);
    }
  };

  const handleConfirmLog = () => {
    if (!scannedFood) return;
    const totalGrams = Math.round(amountValue * scannedFood.servingGrams);
    onLogFood(selectedMealType, scannedFood, totalGrams, amountValue, scannedFood.servingUnit);
    onClose();
  };

  // AI Meal Recognition Demo Presets & Image Upload
  const aiPresetDemos: AIFoodAnalysisResult[] = [
    {
      title: 'חזה עוף צלוי עם אורז בסמטי ושעועית ירוקה',
      description: 'מנת צהריים מאוזנת עשירה בחלבון רזה ופחמימות מורכבות',
      confidence: 96,
      calories: 460,
      protein: 42,
      carbs: 48,
      fat: 9,
      servingGrams: 350,
      servingUnit: 'צלחת מלאה (350 גרם)',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    },
    {
      title: 'סלט יווני ים-תיכוני עם גבינת פטה וזיתי קלמטה',
      description: 'עגבניות, מלפפון, בצל סגול, שמן זית כתית מעולה וגבינת פטה 16%',
      confidence: 94,
      calories: 320,
      protein: 14,
      carbs: 12,
      fat: 24,
      servingGrams: 280,
      servingUnit: 'קערה גדולה (280 גרם)',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
    },
    {
      title: 'טוסט לחם מחמצת עם אבוקדו וביצת עין',
      description: '2 פרוסות לחם כוסמין, חצי אבוקדו מעוך, ביצה וגרעיני צ\'יה',
      confidence: 98,
      calories: 390,
      protein: 17,
      carbs: 34,
      fat: 21,
      servingGrams: 220,
      servingUnit: 'מנה (220 גרם)',
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80',
    },
    {
      title: 'פילה סלמון אפוי עם בטטה צלויה וברוקולי',
      description: 'עשיר באומגה 3, ויטמינים וחלבון איכותי',
      confidence: 95,
      calories: 520,
      protein: 38,
      carbs: 42,
      fat: 22,
      servingGrams: 320,
      servingUnit: 'צלחת עיקרית (320 גרם)',
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const handleSimulateAIAnalysis = (demoResult?: AIFoodAnalysisResult) => {
    setIsAnalyzingAI(true);
    setAiResult(null);
    setTimeout(() => {
      const selected = demoResult || aiPresetDemos[Math.floor(Math.random() * aiPresetDemos.length)];
      setAiResult(selected);
      setIsAnalyzingAI(false);
    }, 1200);
  };

  const handleConfirmAILog = () => {
    if (!aiResult) return;
    const foodItem: FoodItem = {
      id: `ai_${Date.now()}`,
      name: aiResult.title,
      calories: Math.round((aiResult.calories / aiResult.servingGrams) * 100),
      protein: Math.round((aiResult.protein / aiResult.servingGrams) * 100 * 10) / 10,
      carbs: Math.round((aiResult.carbs / aiResult.servingGrams) * 100 * 10) / 10,
      fat: Math.round((aiResult.fat / aiResult.servingGrams) * 100 * 10) / 10,
      servingUnit: aiResult.servingUnit,
      servingGrams: aiResult.servingGrams,
      category: 'popular',
      imageUrl: aiResult.imageUrl,
    };

    onLogFood(selectedMealType, foodItem, aiResult.servingGrams, 1, aiResult.servingUnit);
    onClose();
  };

  // Sample quick barcodes
  const sampleBarcodes = [
    { code: '729000000004', name: 'גבינת קוטג\' 5%' },
    { code: '729000000005', name: 'יוגורט PRO 20g חלבון' },
    { code: '729000000003', name: 'טונה במי מלח' },
    { code: '729000000027', name: 'חטיף חלבון Barebells' },
    { code: '729000000017', name: 'אבוקדו בשל' },
  ];

  if (!isOpen) return null;

  const calculatedNutrition = scannedFood
    ? calculateItemNutrition(scannedFood, Math.round(amountValue * scannedFood.servingGrams))
    : { calculatedCalories: 0, calculatedProtein: 0, calculatedCarbs: 0, calculatedFat: 0 };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] max-h-[92vh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              {activeTab === 'barcode' ? <QrCode className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                {activeTab === 'barcode' ? 'סורק ברקוד חכם' : 'זיהוי מנות וצלחות ב-AI'}
              </h3>
              <p className="text-xs text-outline">
                {activeTab === 'barcode'
                  ? 'סריקה מקומית + חיבור למאגר בינלאומי Open Food Facts'
                  : 'צלם את הצלחת וקבל חישוב קלוריות ומאקרו אוטומטי'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="סגור"
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Barcode vs AI Vision */}
        <div className="p-3 pb-0">
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface-container-low rounded-2xl border border-surface-container-high text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('barcode');
              }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'barcode'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>סורק ברקוד מוצרים</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveTab('ai_camera');
              }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ai_camera'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Sparkles className="w-4 h-4 text-tertiary" />
              <span>זיהוי צלחת ב-AI</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: BARCODE SCANNER */}
          {activeTab === 'barcode' && (
            <>
              {/* Scanner Viewfinder Box */}
              <div className="relative w-full h-52 bg-surface-container-high rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-outline/30">
                <div id={scannerContainerId} className="w-full h-full object-cover"></div>

                {!isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container p-4 text-center">
                    <Camera className="w-9 h-9 text-primary mb-1.5 animate-bounce" />
                    <p className="text-sm font-bold text-on-surface">סריקה ישירה מהמצלמה</p>
                    <p className="text-xs text-outline mt-0.5 mb-2.5">כוון את המצלמה לברקוד על גבי אריזת המוצר</p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>הפעל מצלמה עכשיו</span>
                    </button>
                  </div>
                )}

                {isCameraActive && (
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={stopCamera}
                      className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-bold backdrop-blur-sm hover:bg-black/80"
                    >
                      עצור מצלמה
                    </button>
                  </div>
                )}
              </div>

              {/* Manual Barcode Input Form */}
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="הזן ברקוד ידנית (לדוגמה: 729000000004)"
                  className="flex-1 bg-surface-container-low text-on-surface py-2 px-3 rounded-xl border border-surface-container-high text-xs focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  type="submit"
                  disabled={isSearchingOnline}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  {isSearchingOnline ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>אתר</span>
                </button>
              </form>

              {/* Online database hint */}
              <div className="flex items-center gap-1 text-[11px] text-outline">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>מחובר למאגר Open Food Facts (מיליוני מוצרים ישראליים ועולמיים)</span>
              </div>

              {/* Quick Demo Barcodes List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-outline block">ברקודים לדוגמה:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleBarcodes.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => findFoodByBarcode(item.code)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-[11px] font-semibold text-on-surface-variant transition-all active:scale-95 flex items-center gap-1"
                    >
                      <span>{item.name}</span>
                      <span className="text-outline text-[10px]">({item.code.slice(-4)})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan Error Message */}
              {scanError && (
                <div className="p-3 rounded-xl bg-error-container/40 text-error text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Scanned Food Card */}
              {scannedFood && (
                <div className="p-4 rounded-2xl bg-surface-container-low border border-primary/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    {scannedFood.imageUrl ? (
                      <img
                        src={scannedFood.imageUrl}
                        alt={scannedFood.name}
                        className="w-12 h-12 rounded-xl object-cover bg-surface-container"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-outline">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">{scannedFood.name}</h4>
                      <p className="text-xs text-outline">{scannedFood.brand || 'מוצר מאומת'}</p>
                    </div>
                  </div>

                  {/* Nutrition breakdown */}
                  <div className="grid grid-cols-4 gap-1 text-center bg-surface-container-lowest p-2 rounded-xl border border-surface-container-high text-xs">
                    <div>
                      <span className="text-[10px] text-outline block">קלוריות</span>
                      <span className="font-bold text-tertiary">{calculatedNutrition.calculatedCalories}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline block">חלבון</span>
                      <span className="font-bold text-on-surface">{calculatedNutrition.calculatedProtein}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline block">פחמימה</span>
                      <span className="font-bold text-on-surface">{calculatedNutrition.calculatedCarbs}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline block">שומן</span>
                      <span className="font-bold text-on-surface">{calculatedNutrition.calculatedFat}g</span>
                    </div>
                  </div>

                  {/* Amount Stepper */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-outline font-semibold">
                      כמות: {amountValue} {scannedFood.servingUnit} ({Math.round(amountValue * scannedFood.servingGrams)}g)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAmountValue(Math.max(0.5, amountValue - 0.5))}
                        className="w-7 h-7 rounded-lg bg-surface-container font-bold hover:bg-surface-container-high"
                      >
                        -
                      </button>
                      <span className="font-display font-bold text-sm min-w-[24px] text-center">
                        {amountValue}
                      </span>
                      <button
                        onClick={() => setAmountValue(amountValue + 0.5)}
                        className="w-7 h-7 rounded-lg bg-surface-container font-bold hover:bg-surface-container-high"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Confirm Log */}
                  <button
                    onClick={handleConfirmLog}
                    className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>הוסף לארוחה</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* TAB 2: AI MEAL / PHOTO RECOGNITION */}
          {activeTab === 'ai_camera' && (
            <div className="space-y-4">
              {/* Photo Upload / Camera snap box */}
              <div className="p-5 bg-surface-container-low rounded-2xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">זיהוי מנות וצלחות ב-AI</h4>
                  <p className="text-xs text-outline mt-0.5">
                    העלה או צלם תמונה של הצלחת, וה-AI יזהה את המרכיבים ויחשב את הערכים
                  </p>
                </div>

                <div className="flex gap-2 w-full pt-1">
                  <label className="flex-1 py-2.5 px-3 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:opacity-90 active:scale-95 transition-all">
                    <Camera className="w-4 h-4" />
                    <span>צלם צלחת</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={() => handleSimulateAIAnalysis()}
                    />
                  </label>

                  <label className="flex-1 py-2.5 px-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-on-surface font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                    <Upload className="w-4 h-4 text-outline" />
                    <span>העלה תמונה</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={() => handleSimulateAIAnalysis()}
                    />
                  </label>
                </div>
              </div>

              {/* AI Demo Preset cards */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-outline block">או בחר מנה לדוגמה לניתוח AI מהיר:</span>
                <div className="grid grid-cols-2 gap-2">
                  {aiPresetDemos.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSimulateAIAnalysis(preset)}
                      className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-right flex flex-col gap-1.5 active:scale-95 transition-all"
                    >
                      <img
                        src={preset.imageUrl}
                        alt={preset.title}
                        className="w-full h-20 rounded-lg object-cover bg-surface-container"
                      />
                      <span className="font-bold text-xs text-on-surface line-clamp-1">{preset.title}</span>
                      <span className="text-[10px] text-tertiary font-semibold">{preset.calories} קק"ל ({preset.protein}g חלבון)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Analyzing Spinner */}
              {isAnalyzingAI && (
                <div className="p-6 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col items-center justify-center space-y-2 animate-in fade-in">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="font-bold text-xs text-on-surface">מנתח את המנה באמצעות מודל AI...</p>
                  <p className="text-[11px] text-outline">מזהה רכיבים, נפח והערכת ערכים תזונתיים</p>
                </div>
              )}

              {/* AI Result Card */}
              {aiResult && !isAnalyzingAI && (
                <div className="p-4 bg-surface-container-low rounded-2xl border border-primary/40 space-y-3 animate-in slide-in-from-bottom duration-200">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>דיוק זיהוי: {aiResult.confidence}%</span>
                    </span>
                    <span className="text-[11px] font-bold text-outline">{aiResult.servingUnit}</span>
                  </div>

                  <div className="flex gap-3 items-center">
                    <img
                      src={aiResult.imageUrl}
                      alt={aiResult.title}
                      className="w-14 h-14 rounded-xl object-cover bg-surface-container flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">{aiResult.title}</h4>
                      <p className="text-xs text-outline leading-relaxed">{aiResult.description}</p>
                    </div>
                  </div>

                  {/* Macros breakdown */}
                  <div className="grid grid-cols-4 gap-1 text-center bg-surface-container-lowest p-2 rounded-xl border border-surface-container-high">
                    <div>
                      <span className="text-[10px] text-outline block">קלוריות</span>
                      <span className="font-bold text-tertiary text-sm">{aiResult.calories}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline block">חלבון</span>
                      <span className="font-bold text-on-surface text-sm">{aiResult.protein}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline block">פחמימה</span>
                      <span className="font-bold text-on-surface text-sm">{aiResult.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline block">שומן</span>
                      <span className="font-bold text-on-surface text-sm">{aiResult.fat}g</span>
                    </div>
                  </div>

                  {/* Add to diary button */}
                  <button
                    onClick={handleConfirmAILog}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-xs shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>הוסף מנה זו ישירות ליומן</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
