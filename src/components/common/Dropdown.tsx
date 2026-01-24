import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownProps {
    label?: string;
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn("relative w-full", className)} ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-slate-800 dark:text-white font-black text-lg shadow-inner flex items-center justify-between group transition-all"
            >
                <span>{selectedOption.label}</span>
                <ChevronDown className={cn("w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[90] bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-3 z-[100] clay-card p-2 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl font-bold transition-all",
                                    value === opt.value
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dropdown;
