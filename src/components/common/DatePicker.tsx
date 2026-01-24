import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(value || new Date()));
    const selectedDate = new Date(value || new Date());

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
        end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
    });

    const handleDateSelect = (date: Date) => {
        onChange(format(date, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            {label && (
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold text-slate-800 dark:text-white shadow-inner flex items-center justify-between group transition-all active:scale-[0.98]"
            >
                <span>{format(selectedDate, 'dd MMMM yyyy', { locale: fr })}</span>
                <CalendarIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[110] bg-slate-900/40 animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm z-[120] clay-card p-8 animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <button
                                type="button"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:scale-110 transition-transform shadow-sm"
                            >
                                <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                            </button>

                            <div className="text-center">
                                <h4 className="font-black text-xl text-slate-800 dark:text-white capitalize tracking-tight">
                                    {format(currentMonth, 'MMMM', { locale: fr })}
                                </h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(currentMonth, 'yyyy')}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:scale-110 transition-transform shadow-sm"
                            >
                                <ChevronRight className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
                                <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {days.map((day, i) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, currentMonth);

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleDateSelect(day)}
                                        className={cn(
                                            "aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all",
                                            !isCurrentMonth && "text-slate-300 dark:text-slate-600 opacity-30",
                                            isCurrentMonth && !isSelected && "text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-500",
                                            isSelected && "bg-blue-500 text-white shadow-lg shadow-blue-500/40 scale-110 z-10"
                                        )}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDateSelect(new Date())}
                                className="py-4 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
                            >
                                Aujourd'hui
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DatePicker;
