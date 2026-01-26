import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, X, Loader2, TrendingUp, Landmark } from 'lucide-react';
import { cn } from '../../lib/utils';

import { useBudget } from '../../context/BudgetContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const NeuralButler: React.FC = () => {
    const { user, refresh } = useBudget();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Bienvenue. Je suis votre Neural Butler. Comment puis-je assister votre gestion de capital aujourd\'hui ?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusText, setStatusText] = useState('Le Butler réfléchit...');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || ''
                },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            });
            const data = await res.json();

            if (data.content) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            }

            if (data.actionTaken) {
                setStatusText("Exécution en cours...");
                await refresh(); // Refresh app data if AI took an action
            }

        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, j'ai rencontré un problème pour accéder au réseau neural." }]);
        } finally {
            setIsLoading(false);
            setStatusText("Le Butler réfléchit...");
        }
    };

    const suggestions = [
        { label: "Résumé du mois", icon: TrendingUp },
        { label: "Budgets en danger ?", icon: X },
        { label: "Conseil épargne", icon: Landmark }
    ];

    return (
        <div className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-[200]">
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-2xl relative group overflow-hidden",
                    isOpen
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 rotate-90"
                        : "bg-indigo-600 text-white animate-blink-glow"
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isOpen ? <X className="w-6 h-6" /> : <BrainCircuit className="w-8 h-8" />}
            </button>

            {/* Chat Interface */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[90vw] md:w-[450px] max-h-[70vh] flex flex-col bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">

                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center gap-4 bg-gradient-to-r from-indigo-600/10 to-purple-600/10">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] dark:text-white">Neural Butler</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">En ligne</span>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide min-h-[300px]"
                    >
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "flex flex-col max-w-[85%]",
                                m.role === 'user' ? "ml-auto items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm",
                                    m.role === 'user'
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none"
                                        : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{statusText}</span>
                            </div>
                        )}
                    </div>

                    {/* Footer / Input */}
                    <div className="p-6 border-t border-white/5 space-y-4">
                        {/* Quick Suggestions */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(s.label)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 transition-all shrink-0 active:scale-95"
                                >
                                    <s.icon className="w-3 h-3" />
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Posez une question..."
                                className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white dark:placeholder-slate-500"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 transition-all active:scale-90 disabled:opacity-50 disabled:grayscale"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeuralButler;
