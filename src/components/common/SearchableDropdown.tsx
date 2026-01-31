import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
    label: string;
    value: string;
    subLabel?: string;
    icon?: React.ElementType;
    color?: string;
}

interface SearchableDropdownProps {
    label?: string;
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    showSearch?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
    label,
    options,
    value,
    onChange,
    placeholder = "Sélectionner...",
    searchPlaceholder = "Rechercher...",
    className,
    showSearch = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.label.toLowerCase().includes(search.toLowerCase()) ||
            opt.subLabel?.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className={cn("relative w-full group", className)} ref={containerRef}>
            {label && (
                <label className="block h-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={toggle}
                className={cn(
                    "w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent outline-none font-bold text-sm text-slate-700 dark:text-slate-200 transition-all flex items-center justify-between shadow-inner hover:bg-slate-100 dark:hover:bg-white/10 group-hover:border-lime-500/20",
                    isOpen && "ring-2 ring-lime-500/20 border-lime-500/30 bg-white dark:bg-black"
                )}
            >
                <div className="flex items-center gap-3 truncate">
                    {selectedOption?.icon && (
                        <selectedOption.icon className={cn("w-4 h-4 shrink-0", selectedOption.color || "text-slate-400")} />
                    )}
                    <div className="flex flex-col items-start truncate leading-tight">
                        <span className={cn("truncate", !selectedOption && "text-slate-400 opacity-60")}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        {selectedOption?.subLabel && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {selectedOption.subLabel}
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0", isOpen && "rotate-180 text-lime-500")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-3 z-[110] bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden glass-morph"
                    >
                        {showSearch && (
                            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={searchPlaceholder}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-800 dark:text-white"
                                />
                            </div>
                        )}

                        <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group/item mb-1",
                                            value === opt.value
                                                ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                                                : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                                        )}
                                    >
                                        <div className="flex items-center gap-4 truncate">
                                            {opt.icon && (
                                                <div className={cn(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                                                    value === opt.value ? "bg-black/10" : "bg-slate-100 dark:bg-white/5 group-hover/item:bg-white dark:group-hover/item:bg-white/10"
                                                )}>
                                                    <opt.icon className={cn("w-5 h-5", value === opt.value ? "text-black" : (opt.color || "text-slate-400"))} />
                                                </div>
                                            )}
                                            <div className="flex flex-col items-start truncate leading-tight">
                                                <span className="text-sm font-black truncate tracking-tight">{opt.label}</span>
                                                {opt.subLabel && (
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest",
                                                        value === opt.value ? "text-black/60" : "text-slate-400"
                                                    )}>
                                                        {opt.subLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {value === opt.value && (
                                            <Check className="w-5 h-5 text-black shrink-0" />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50 dark:bg-white/5 rounded-2xl">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aucun résultat</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchableDropdown;
