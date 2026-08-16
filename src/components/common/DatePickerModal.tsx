import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { getTodayDateString } from '../../services/nutritionCalculator';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  onSelectDate: (date: string) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  onSelectDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedDate(currentDate);
    }
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  const today = getTodayDateString();

  const handleQuickSelect = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split('T')[0];
    onSelectDate(dateStr);
    onClose();
  };

  const handleConfirm = () => {
    onSelectDate(selectedDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[380px] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-surface-container-high space-y-4 animate-modal-sheet modal-safe-bottom">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="font-headline font-bold text-base text-on-surface">בחירת תאריך יומן</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-1 text-outline hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Native Date Input */}
        <div>
          <label className="text-xs font-semibold text-outline block mb-1.5">בחר תאריך מלוח השנה:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface p-3 rounded-2xl border border-surface-container-high text-sm font-bold text-center focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Quick Jump Buttons */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-outline block">קיצורי דרך:</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect(0)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDate === today
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              היום
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(-1)}
              className="py-2 rounded-xl text-xs font-bold bg-surface-container-low text-on-surface hover:bg-surface-container transition-all"
            >
              אתמול
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(-2)}
              className="py-2 rounded-xl text-xs font-bold bg-surface-container-low text-on-surface hover:bg-surface-container transition-all"
            >
              שלשום
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>עבור לתאריך זה</span>
        </button>
      </div>
    </div>
  );
};
