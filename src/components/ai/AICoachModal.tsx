import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Loader2,
  Bot,
  User,
  Brain,
  Trash2,
  Mic,
  MicOff,
} from 'lucide-react';
import type { UserProfile, DayLog, MealType } from '../../types';
import type { AICoachMessage, AICoachMemory, AICoachSuggestedAction, AIParsedFoodItem } from '../../types/ai';
import { AIService } from '../../services/aiService';
import { StorageService } from '../../services/storageService';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  dayLog: DayLog;
  apiKey?: string;
  onOpenMealGenerator?: () => void;
  onLogParsedItems?: (mealType: MealType, items: AIParsedFoodItem[]) => void;
  onAdjustDayTargets?: (calorieDelta: number) => void;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  dayLog,
  apiKey,
  onOpenMealGenerator,
  onLogParsedItems,
  onAdjustDayTargets,
}) => {
  const [messages, setMessages] = useState<AICoachMessage[]>(() =>
    StorageService.getAICoachMessages(userProfile.id)
  );
  const [memory, setMemory] = useState<AICoachMemory>(() =>
    StorageService.getAICoachMemory(userProfile.id)
  );
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages(StorageService.getAICoachMessages(userProfile.id));
      setMemory(StorageService.getAICoachMemory(userProfile.id));
    }
  }, [isOpen, userProfile.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickQuestions = [
    { label: '🤢 מרגיש מפוצץ / כבד ולא יכול לאכול', text: 'אני מרגיש מפוצץ וכבד ולא מסוגל להמשיך לאכול את התפריט של היום. מה לעשות כדי להגיע ליעד החלבון בלי להעמיס על הבטן?' },
    { label: '📉 המשקל תקוע – מה לעשות?', text: 'המשקל שלי תקוע כבר זמן מה למרות שאני מתמיד. איך לבדוק מה הבעיה ולהמשיך להתקדם?' },
    { label: '⚡ מה לאכול שעה לפני אימון?', text: 'מה הארוחה האידיאלית לאכול כשעה עד שעתיים לפני אימון כוח/אירובי כדי לקבל אנרגיה מקסימלית?' },
    { label: '🍫 חשק למתוק בלי להרוס חיטוב', text: 'יש לי חשק עז למתוק כרגע. איזה נשנוש מתוק עתיר חלבון ודל קלוריות אני יכול לאכול עכשיו?' },
    { label: '📊 נתח את תמונת המצב שלי להיום', text: 'תוכל לנתח את מה שאכלתי היום ולתת לי טיפים לשיפור?' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: AICoachMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const { response: assistantMsg, updatedMemory } = await AIService.consultNutritionCoach(
        newHistory,
        {
          profile: userProfile,
          todayLog: dayLog,
          weightHistory: userProfile.weightLogs || [],
          memory,
        },
        apiKey
      );

      const finalMessages = [...newHistory, assistantMsg];
      setMessages(finalMessages);
      setMemory(updatedMemory);

      StorageService.saveAICoachMessages(finalMessages, userProfile.id);
      StorageService.saveAICoachMemory(updatedMemory, userProfile.id);
    } catch (err) {
      console.error('Coach error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: AICoachSuggestedAction) => {
    if (action.type === 'open_recipe_generator' && onOpenMealGenerator) {
      onClose();
      onOpenMealGenerator();
    } else if (action.type === 'switch_to_liquid_macros' && onLogParsedItems) {
      // Add quick liquid shake
      onLogParsedItems('snack', [
        {
          name: 'שייק חלבון Power Shake (מי גבינה, בננה וחמאת בוטנים)',
          amountDesc: 'שייק קל לעיכול (300 מ"ל)',
          grams: 300,
          calories: 290,
          protein: 30,
          carbs: 26,
          fat: 6,
          confidence: 99,
        },
      ]);
      onClose();
    } else if (action.type === 'adjust_today_targets' && onAdjustDayTargets) {
      onAdjustDayTargets(-200);
      onClose();
    } else if (action.type === 'add_logged_food' && onLogParsedItems) {
      onLogParsedItems('snack', [
        {
          name: 'מעדן חלבון פרו שוקולד 20g',
          amountDesc: 'גביע (200 גרם)',
          grams: 200,
          calories: 124,
          protein: 20,
          carbs: 9,
          fat: 0.6,
          confidence: 99,
        },
      ]);
      onClose();
    }
  };

  const handleClearChat = () => {
    StorageService.clearAICoachHistory(userProfile.id);
    setMessages(StorageService.getAICoachMessages(userProfile.id));
    setMemory(StorageService.getAICoachMemory(userProfile.id));
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'he-IL';
      rec.onstart = () => setIsRecording(true);
      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setInputText(transcript);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-surface rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[800px]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container-high flex items-center justify-between bg-surface-container-low/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center font-bold shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-black text-base sm:text-lg text-on-surface">
                  מאמן תזונה וספורט AI
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  פעיל
                </span>
              </div>
              <p className="text-xs text-outline mt-0.5">
                ייעוץ מותאם אישית, התמודדות עם שובע ונפיחות, וליווי מטרות
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Memory Button */}
            <button
              onClick={() => setShowMemoryModal(true)}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary transition-colors flex items-center gap-1 text-xs font-bold"
              title="צפה בזיכרון ה-AI"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">זיכרון</span>
            </button>

            {/* Clear History Button */}
            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-error transition-colors"
              title="איפוס היסטוריית שיחה"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
              aria-label="סגור"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Context Summary Header */}
        <div className="px-4 py-2 bg-surface-container-low/40 border-b border-surface-container-high/60 flex items-center justify-between text-[11px] text-outline overflow-x-auto gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-bold text-on-surface">{userProfile.name}</span>
            <span>•</span>
            <span>{userProfile.currentWeight} ק"ג</span>
            <span>•</span>
            <span className="text-primary font-bold">
              {userProfile.goal === 'lean_bulk' ? 'מסה נקייה' : 'חיטוב וירידה'}
            </span>
          </div>

          {memory.satietyState && memory.satietyState !== 'normal' && (
            <div className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold flex items-center gap-1 flex-shrink-0">
              <span>מצב נוכחי: {memory.satietyState === 'bloated' ? 'נפיחות / שובע כבד' : 'תיאבון נמוך'}</span>
            </div>
          )}
        </div>

        {/* Chat Messages Scroll Container */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-xs ${
                    isUser
                      ? 'bg-primary text-on-primary'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-3xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 shadow-xs ${
                    isUser
                      ? 'bg-primary text-on-primary rounded-tr-xs'
                      : 'bg-surface-container-low text-on-surface border border-surface-container-high/80 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{msg.content}</div>

                  {/* Suggested Action Buttons in Message */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-surface-container-high/60 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(action)}
                          className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-on-primary font-bold text-xs transition-all active:scale-95 shadow-2xs flex items-center gap-1"
                        >
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-left pt-0.5 ${
                      isUser ? 'text-on-primary/70' : 'text-outline'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high flex items-center gap-2 text-xs font-bold text-outline">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>המאמן חושב ומנתח את הנתונים...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-surface-container-low/50 border-t border-surface-container-high/60 overflow-x-auto">
          <div className="flex gap-1.5 whitespace-nowrap">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.text)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-[11px] font-bold text-on-surface border border-surface-container-high/60 transition-all active:scale-95 flex-shrink-0"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 border-t border-surface-container-high bg-surface-container-low/80 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-2xl transition-all shadow-xs flex items-center justify-center ${
              isRecording
                ? 'bg-error text-on-error animate-pulse'
                : 'bg-surface-container hover:bg-surface-container-high text-primary'
            }`}
            title="הקלט הודעה בקולך"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="שאל את המאמן (למשל: אני מרגיש כבד מדי, מה להחליף?)..."
            className="flex-1 p-3 rounded-2xl bg-surface-container border border-surface-container-high text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-2xl bg-primary text-on-primary disabled:opacity-40 hover:bg-primary-dark font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* AI Memory Modal Preview */}
        {showMemoryModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm bg-surface rounded-3xl p-5 border border-surface-container-high shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h4 className="font-headline font-black text-sm text-on-surface">
                    מה ה-AI למד עליך?
                  </h4>
                </div>
                <button
                  onClick={() => setShowMemoryModal(false)}
                  className="p-1.5 rounded-xl bg-surface-container text-on-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-outline block mb-1">העדפות תזונה שנשמרו:</span>
                  {memory.preferences.length > 0 ? (
                    <ul className="list-disc list-inside space-y-0.5 text-on-surface">
                      {memory.preferences.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-outline italic">טרם נרשמו העדפות ספציפיות</span>
                  )}
                </div>

                <div>
                  <span className="font-bold text-outline block mb-1">רגישויות / סלידות:</span>
                  {memory.allergiesOrDislikes.length > 0 ? (
                    <ul className="list-disc list-inside space-y-0.5 text-on-surface">
                      {memory.allergiesOrDislikes.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-outline italic">אין רגישויות מתועדות</span>
                  )}
                </div>

                <div>
                  <span className="font-bold text-outline block mb-1">הערות מאמן:</span>
                  {memory.userNotes.length > 0 ? (
                    <ul className="list-disc list-inside space-y-0.5 text-on-surface">
                      {memory.userNotes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-outline italic">המאמן לומד את ההרגלים שלך במהלך השיחות</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowMemoryModal(false)}
                className="w-full py-2.5 rounded-2xl bg-primary text-on-primary font-bold text-xs"
              >
                הבנתי, סגור
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
