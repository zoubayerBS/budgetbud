import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

const SplashScreen: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => setIsVisible(false), 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);
        return () => clearInterval(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000",
            progress === 100 ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 bg-[#f8fafc] dark:bg-slate-950"
        )}>
            {/* Visual background elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="relative flex flex-col items-center">
                {/* Logo Container */}
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 text-white mb-8 animate-bounce transition-transform duration-500 hover:scale-110">
                    <span className="font-black text-4xl">B</span>
                </div>

                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter mb-2">
                    BudgetBud
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-2">
                    Chargement...
                </p>

                {/* Progress bar */}
                <div className="w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="absolute bottom-10 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] italic">
                La Révolution Financière v1.3
            </div>
        </div>
    );
};

export default SplashScreen;
