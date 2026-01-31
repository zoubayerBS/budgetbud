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
                    setTimeout(() => setIsVisible(false), 800);
                    return 100;
                }
                return prev + 2;
            });
        }, 20); // Slightly faster
        return () => clearInterval(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-700 ease-in-out overflow-hidden",
            progress === 100 ? "opacity-0 pointer-events-none scale-105" : "opacity-100 bg-white dark:bg-[#050505]"
        )}>
            {/* --- Premium Background Effects --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] mix-blend-screen dark:mix-blend-screen animate-pulse duration-[3000ms]"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-lime-400/5 rounded-full blur-[100px] animate-pulse duration-[4000ms] delay-1000"></div>

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* --- Animated Logo Container --- */}
                <div className="relative mb-12">
                    {/* Glowing Ring */}
                    <div className="absolute inset-0 rounded-3xl bg-lime-500/20 blur-xl animate-pulse"></div>

                    {/* Main Card */}
                    <div className="relative w-28 h-28 bg-white dark:bg-black rounded-[2rem] flex items-center justify-center shadow-2xl shadow-lime-500/10 border border-slate-100 dark:border-white/10 overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

                        {/* Zap Icon */}
                        <svg
                            className="w-12 h-12 text-slate-900 dark:text-white drop-shadow-lg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="none" />
                        </svg>
                    </div>
                </div>

                {/* --- Brand Name & Tagline --- */}
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mix-blend-overlay dark:mix-blend-normal">
                        BudgetBud
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">
                        Finance Executive
                    </p>
                </div>

                {/* --- Sleek Progress Bar --- */}
                <div className="relative w-64 h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.6)] rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* --- Footer Version info --- */}
            <div className="absolute bottom-12 text-[10px] font-bold text-slate-300 dark:text-slate-800 uppercase tracking-widest">
                v2.4.0 • Neon Engine
            </div>
        </div>
    );
};

export default SplashScreen;
