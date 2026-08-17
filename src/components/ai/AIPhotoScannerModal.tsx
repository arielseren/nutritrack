import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  QrCode,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Info,
  SunMedium,
  Sun,
  Sunset,
  Apple,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import type { MealType, FoodItem } from '../../types';
import type { AIVisionAnalysisResult, AILabelOcrResult, AIParsedFoodItem } from '../../types/ai';
import { AIService } from '../../services/aiService';
import { OpenFoodFactsService } from '../../services/openFoodFacts';

export type AIScannerTab = 'plate_vision' | 'label_ocr' | 'barcode';

interface AIPhotoScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AIScannerTab;
  defaultMealType?: MealType;
  foodDatabase: FoodItem[];
  apiKey?: string;
  onLogParsedItems: (mealType: MealType, items: AIParsedFoodItem[]) => void;
  onSaveCustomFood?: (food: Omit<FoodItem, 'id'>) => void;
  onLogFood?: (mealType: MealType, food: FoodItem, grams: number, amount: number, unit: string) => void;
}

export const AIPhotoScannerModal: React.FC<AIPhotoScannerModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'plate_vision',
  defaultMealType = 'lunch',
  foodDatabase,
  apiKey,
  onLogParsedItems,
  onSaveCustomFood,
  onLogFood,
}) => {
  const [activeTab, setActiveTab] = useState<AIScannerTab>(defaultTab);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);

  // Vision State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<AIVisionAnalysisResult | null>(null);
  const [visionItems, setVisionItems] = useState<AIParsedFoodItem[]>([]);

  // Label OCR State
  const [labelImage, setLabelImage] = useState<string | null>(null);
  const [isOcrAnalyzing, setIsOcrAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<AILabelOcrResult | null>(null);
  const [ocrSaved, setOcrSaved] = useState(false);

  // Barcode State
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedFood, setScannedFood] = useState<FoodItem | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [barcodeAmount, setBarcodeAmount] = useState(1);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const labelFileInputRef = useRef<HTMLInputElement | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'ai-barcode-scanner-box';

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setSelectedMealType(defaultMealType);
      setSelectedImage(null);
      setVisionResult(null);
      setVisionItems([]);
      setLabelImage(null);
      setOcrResult(null);
      setOcrSaved(false);
      setScannedFood(null);
      setScanError(null);
      setManualBarcode('');
      setBarcodeAmount(1);
    } else {
      stopBarcodeCamera();
    }
  }, [isOpen, defaultTab, defaultMealType]);

  // Demo Plate Samples
  const demoPlatePresets = [
    {
      title: 'חזה עוף, אורז וסלט',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      mealType: 'lunch' as MealType,
    },
    {
      title: 'סלמון אפוי ובטטה',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80',
      mealType: 'dinner' as MealType,
    },
    {
      title: 'טוסט אבוקדו וביצה',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
      mealType: 'breakfast' as MealType,
    },
    {
      title: 'יוגורט פרו ופירות יער',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
      mealType: 'snack' as MealType,
    },
  ];

  // 1. Vision Plate Handlers
  const handleImageSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      analyzePlateWithAI(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzePlateWithAI = async (base64Img: string) => {
    setIsAnalyzing(true);
    setVisionResult(null);
    try {
      const res = await AIService.analyzePlateImage(base64Img, selectedMealType, apiKey);
      setVisionResult(res);
      setVisionItems(res.items);
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPlatePreset = (preset: (typeof demoPlatePresets)[0]) => {
    setSelectedImage(preset.image);
    setSelectedMealType(preset.mealType);
    analyzePlateWithAI(preset.image);
  };

  const handleUpdateVisionItemGram = (idx: number, newGrams: number) => {
    const safeGrams = Math.max(1, newGrams);
    const updated = [...visionItems];
    const item = updated[idx];
    if (item.grams > 0) {
      const ratio = safeGrams / item.grams;
      item.calories = Math.round(item.calories * ratio);
      item.protein = Math.round(item.protein * ratio * 10) / 10;
      item.carbs = Math.round(item.carbs * ratio * 10) / 10;
      item.fat = Math.round(item.fat * ratio * 10) / 10;
    }
    item.grams = safeGrams;
    setVisionItems(updated);
  };

  const handleDeleteVisionItem = (idx: number) => {
    setVisionItems(visionItems.filter((_, i) => i !== idx));
  };

  const handleConfirmVisionLog = () => {
    if (visionItems.length === 0) return;
    onLogParsedItems(selectedMealType, visionItems);
    onClose();
  };

  // 2. Label OCR Handlers
  const handleLabelImageSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setLabelImage(base64);
      analyzeLabelWithAI(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeLabelWithAI = async (base64Img: string) => {
    setIsOcrAnalyzing(true);
    setOcrResult(null);
    setOcrSaved(false);
    try {
      const res = await AIService.scanNutritionLabel(base64Img, apiKey);
      setOcrResult(res);
    } catch (err) {
      console.error('OCR analysis error:', err);
    } finally {
      setIsOcrAnalyzing(false);
    }
  };

  const handleSaveOcrProduct = (logToToday: boolean = false) => {
    if (!ocrResult || !onSaveCustomFood) return;

    const newFood: Omit<FoodItem, 'id'> = {
      name: ocrResult.productName || 'מוצר חדש',
      brand: ocrResult.brand,
      calories: ocrResult.caloriesPer100g,
      protein: ocrResult.proteinPer100g,
      carbs: ocrResult.carbsPer100g,
      fat: ocrResult.fatPer100g,
      servingUnit: ocrResult.servingUnit || 'גביע (200 גרם)',
      servingGrams: ocrResult.servingGrams || 100,
      category: ocrResult.category || 'proteins',
      isCustom: true,
    };

    onSaveCustomFood(newFood);
    setOcrSaved(true);

    if (logToToday) {
      onLogParsedItems(selectedMealType, [
        {
          name: newFood.name,
          amountDesc: newFood.servingUnit,
          grams: newFood.servingGrams,
          calories: Math.round((newFood.calories * newFood.servingGrams) / 100),
          protein: Math.round(((newFood.protein * newFood.servingGrams) / 100) * 10) / 10,
          carbs: Math.round(((newFood.carbs * newFood.servingGrams) / 100) * 10) / 10,
          fat: Math.round(((newFood.fat * newFood.servingGrams) / 100) * 10) / 10,
        },
      ]);
      onClose();
    }
  };

  // 3. Barcode Handlers
  const startBarcodeCamera = async () => {
    try {
      setScanError(null);
      setIsCameraActive(true);
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 160 } },
        (decodedText) => {
          stopBarcodeCamera();
          findFoodByBarcode(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.warn('Barcode camera start error:', err);
      setIsCameraActive(false);
      setScanError('לא ניתן לגשת למצלמה. השתמש בהזנה ידנית למטה.');
    }
  };

  const stopBarcodeCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  const findFoodByBarcode = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setScanError(null);
    setScannedFood(null);

    // 1. Local check
    const local = foodDatabase.find((f) => f.barcode === cleanCode);
    if (local) {
      setScannedFood(local);
      return;
    }

    // 2. OpenFoodFacts live lookup
    setIsSearchingOnline(true);
    try {
      const product = await OpenFoodFactsService.fetchProductByBarcode(cleanCode);
      if (product) {
        setScannedFood(product);
      } else {
        setScanError(`לא נמצא מוצר עבור ברקוד: ${cleanCode}`);
      }
    } catch (err) {
      setScanError(`שגיאה בסריקת ברקוד: ${cleanCode}`);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  const handleConfirmBarcodeLog = () => {
    if (!scannedFood || !onLogFood) return;
    const totalGrams = Math.round(barcodeAmount * scannedFood.servingGrams);
    onLogFood(selectedMealType, scannedFood, totalGrams, barcodeAmount, scannedFood.servingUnit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-black text-base sm:text-lg text-on-surface">
                  סורק AI חכם
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  Vision & OCR
                </span>
              </div>
              <p className="text-xs text-outline mt-0.5">
                סריקת צלחות, טבלאות סימון תזונתי וברקודים
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

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 pt-3 pb-2 bg-surface-container-low/30 border-b border-surface-container-high">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-2xl">
            <button
              onClick={() => {
                setActiveTab('plate_vision');
                stopBarcodeCamera();
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'plate_vision'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface hover:text-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>סריקת צלחת</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('label_ocr');
                stopBarcodeCamera();
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'label_ocr'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface hover:text-primary'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>תווית ערכים</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('barcode');
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'barcode'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface hover:text-primary'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>ברקוד</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Target Meal Selector for Logging */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-outline block">לאיזו ארוחה לשייך?</label>
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
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-all ${
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

          {/* ======================================================== */}
          {/* TAB 1: PLATE VISION SCANNER                              */}
          {/* ======================================================== */}
          {activeTab === 'plate_vision' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImageSelected(e.target.files[0]);
                  }
                }}
              />

              {/* Upload / Capture Dropzone */}
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-98 text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-headline font-black text-sm sm:text-base text-on-surface block">
                      צלם צלחת או העלה תמונה
                    </span>
                    <span className="text-xs text-outline mt-1 block">
                      ה-AI יזהה את המרכיבים, יחשב גרמים ומאקרו אוטומטית
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-xl bg-surface-container text-xs font-bold text-primary flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>בחר קובץ מהגלריה</span>
                    </span>
                  </div>
                </div>
              ) : (
                /* Selected Image Preview */
                <div className="relative rounded-2xl overflow-hidden border border-surface-container-high bg-surface-container-low max-h-48 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Plate Preview"
                    className="w-full h-full object-cover max-h-48"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3">
                    <span className="text-white text-xs font-bold drop-shadow-md">
                      {isAnalyzing ? 'מנתח תמונה ב-AI...' : visionResult?.title || 'צלחת נסרקה'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setVisionResult(null);
                        setVisionItems([]);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold backdrop-blur-xs transition-colors"
                    >
                      החלף תמונה
                    </button>
                  </div>
                </div>
              )}

              {/* Sample Presets */}
              {!selectedImage && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-outline block">או נסה צלחת לדוגמה בלחיצה:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {demoPlatePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPlatePreset(preset)}
                        className="p-2 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high flex items-center gap-2 text-right transition-all active:scale-95 group"
                      >
                        <img
                          src={preset.image}
                          alt={preset.title}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                        />
                        <span className="text-xs font-bold text-on-surface truncate">
                          {preset.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vision Analyzing Spinner */}
              {isAnalyzing && (
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col items-center justify-center gap-2 text-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  <span className="text-xs font-bold text-on-surface">Gemini Vision מנתח את הצלחת...</span>
                  <span className="text-[11px] text-outline">מזהה חלבונים, פחמימות, שמנים ומשקלי הגשה</span>
                </div>
              )}

              {/* Vision Results */}
              {visionResult && !isAnalyzing && (
                <div className="space-y-3 pt-2 border-t border-surface-container-high animate-in fade-in">
                  <div className="p-3 rounded-2xl bg-surface-container-low border border-primary/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-black text-sm text-primary">
                        {visionResult.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        דיוק {visionResult.confidenceScore}%
                      </span>
                    </div>
                    <p className="text-xs text-outline">{visionResult.summary}</p>
                    {visionResult.healthTip && (
                      <p className="text-[11px] text-secondary font-medium pt-1 border-t border-surface-container-high/60 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{visionResult.healthTip}</span>
                      </p>
                    )}
                  </div>

                  {/* Components List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-outline block">מרכיבי הצלחת שזוהו:</span>
                    {visionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high/70 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs text-on-surface block truncate">
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
                              onChange={(e) => handleUpdateVisionItemGram(idx, Number(e.target.value))}
                              className="w-12 bg-transparent text-center text-xs font-bold text-on-surface focus:outline-none"
                              min={1}
                            />
                            <span className="text-[10px] text-outline font-bold">גרם</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteVisionItem(idx)}
                            className="p-1.5 rounded-xl hover:bg-error-container/30 text-outline hover:text-error transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Confirm Button */}
                  <button
                    type="button"
                    onClick={handleConfirmVisionLog}
                    className="w-full py-3 rounded-2xl bg-primary text-on-primary hover:bg-primary-dark font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>הוסף ארוחה זו ליומן של היום 🚀</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: LABEL OCR SCANNER                                 */}
          {/* ======================================================== */}
          {activeTab === 'label_ocr' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <input
                ref={labelFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleLabelImageSelected(e.target.files[0]);
                  }
                }}
              />

              {!labelImage ? (
                <div
                  onClick={() => labelFileInputRef.current?.click()}
                  className="border-2 border-dashed border-secondary/40 hover:border-secondary bg-secondary/5 hover:bg-secondary/10 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-98 text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-headline font-black text-sm sm:text-base text-on-surface block">
                      צלם טבלת סימון תזונתי בגב המוצר
                    </span>
                    <span className="text-xs text-outline mt-1 block">
                      ה-AI יקרא את ערכי ה-100 גרם וישמור את המאכל ישירות למאגר שלך
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-surface-container text-xs font-bold text-secondary flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>בחר תמונה של התווית</span>
                  </span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-surface-container-high bg-surface-container-low max-h-40 flex items-center justify-center">
                  <img src={labelImage} alt="Label OCR Preview" className="w-full h-full object-cover max-h-40" />
                  <button
                    type="button"
                    onClick={() => {
                      setLabelImage(null);
                      setOcrResult(null);
                    }}
                    className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/60 text-white text-[11px] font-bold"
                  >
                    החלף תמונה
                  </button>
                </div>
              )}

              {isOcrAnalyzing && (
                <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/20 flex flex-col items-center justify-center gap-2 text-center">
                  <Loader2 className="w-7 h-7 text-secondary animate-spin" />
                  <span className="text-xs font-bold text-on-surface">סורק טבלת ערכים תזונתיים ב-OCR...</span>
                  <span className="text-[11px] text-outline">קורא קלוריות, חלבון, פחמימות, שומן וסודיום</span>
                </div>
              )}

              {/* OCR Results View */}
              {ocrResult && !isOcrAnalyzing && (
                <div className="space-y-3 pt-2 border-t border-surface-container-high animate-in fade-in">
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-black text-sm text-on-surface">
                        {ocrResult.productName}
                      </span>
                      {ocrResult.brand && (
                        <span className="text-xs text-outline font-bold">יצרן: {ocrResult.brand}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center bg-surface-container p-2.5 rounded-xl border border-surface-container-high">
                      <div>
                        <span className="text-[10px] text-outline block">קלוריות</span>
                        <span className="font-headline font-black text-tertiary text-xs sm:text-sm">
                          {ocrResult.caloriesPer100g}
                        </span>
                        <span className="text-[9px] text-outline block">ל-100g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-outline block">חלבון</span>
                        <span className="font-headline font-black text-on-surface text-xs sm:text-sm">
                          {ocrResult.proteinPer100g}g
                        </span>
                        <span className="text-[9px] text-outline block">ל-100g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-outline block">פחמימות</span>
                        <span className="font-headline font-black text-on-surface text-xs sm:text-sm">
                          {ocrResult.carbsPer100g}g
                        </span>
                        <span className="text-[9px] text-outline block">ל-100g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-outline block">שומן</span>
                        <span className="font-headline font-black text-on-surface text-xs sm:text-sm">
                          {ocrResult.fatPer100g}g
                        </span>
                        <span className="text-[9px] text-outline block">ל-100g</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Label */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={ocrSaved}
                      onClick={() => handleSaveOcrProduct(false)}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        ocrSaved
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container-high'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{ocrSaved ? 'נשמר במאגר!' : 'שמור למאגר בלבד'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveOcrProduct(true)}
                      className="py-2.5 px-3 rounded-2xl bg-primary text-on-primary hover:bg-primary-dark font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>שמור והוסף להיום</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: BARCODE SCANNER                                   */}
          {/* ======================================================== */}
          {activeTab === 'barcode' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Camera Scanner View */}
              <div className="p-4 rounded-3xl bg-surface-container-low border border-surface-container-high space-y-3 text-center">
                <div
                  id={scannerContainerId}
                  className={`w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center ${
                    !isCameraActive ? 'hidden' : ''
                  }`}
                />

                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={startBarcodeCamera}
                    className="px-5 py-2.5 rounded-2xl bg-primary text-on-primary hover:bg-primary-dark font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto shadow-md active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>פתח מצלמה לסריקת ברקוד</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopBarcodeCamera}
                    className="px-4 py-2 rounded-xl bg-surface-container text-outline hover:text-error text-xs font-bold"
                  >
                    עצור מצלמה
                  </button>
                )}
              </div>

              {/* Manual Barcode Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  findFoodByBarcode(manualBarcode);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="או הקלד מספר ברקוד..."
                  className="flex-1 p-3 rounded-2xl bg-surface-container-low border border-surface-container-high text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="submit"
                  disabled={!manualBarcode.trim() || isSearchingOnline}
                  className="p-3 rounded-2xl bg-primary text-on-primary disabled:opacity-40 font-bold text-xs transition-all shadow-xs"
                >
                  {isSearchingOnline ? <Loader2 className="w-4 h-4 animate-spin" /> : 'חפש'}
                </button>
              </form>

              {scanError && (
                <div className="p-3 rounded-2xl bg-error-container/30 border border-error/30 text-error text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Scanned Food Result */}
              {scannedFood && (
                <div className="p-4 rounded-3xl bg-surface-container-low border border-primary/30 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-headline font-black text-sm text-on-surface block">
                        {scannedFood.name}
                      </span>
                      <span className="text-xs text-outline">
                        {scannedFood.servingUnit} ({scannedFood.servingGrams}g)
                      </span>
                    </div>
                    <span className="font-black text-primary text-sm">
                      {Math.round((scannedFood.calories * scannedFood.servingGrams) / 100)} קק"ל
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-container-high">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-outline">כמות מנות:</span>
                      <input
                        type="number"
                        value={barcodeAmount}
                        onChange={(e) => setBarcodeAmount(Math.max(0.25, Number(e.target.value)))}
                        step="0.5"
                        min="0.25"
                        className="w-14 p-1.5 rounded-xl bg-surface-container text-center text-xs font-bold text-on-surface border border-surface-container-high"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmBarcodeLog}
                      className="py-2.5 px-4 rounded-2xl bg-primary text-on-primary hover:bg-primary-dark font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>הוסף ליומן</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-container-high bg-surface-container-low/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
