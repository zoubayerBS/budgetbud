import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import type { Currency } from '../types';
import {
    Moon, Sun, Trash2, LogOut, Repeat, User, ShieldCheck, Zap,
    Bell, Fingerprint, FileDown, Lock, Smartphone, Mail, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { formatCurrency } from '../lib/format';
import AlertModal from '../components/common/AlertModal';
import SearchableDropdown from '../components/common/SearchableDropdown';
import { signOut } from '../lib/auth-client';
// Use require or ignore if module resolution issue, but biometrics file exists
import { isBiometricSupported, registerBiometric, verifyBiometric } from '../lib/biometrics';
import { US, EU, GB, CH, JP, AU, NZ, CN, IN, SG, KR, CA, TN, AE, SA, ZA, TR, BR, MX, SE, NO, DK } from 'country-flag-icons/react/3x2';

const Settings: React.FC = () => {
    const {
        theme, toggleTheme, currency, setCurrency, recurringTemplates,
        user, resetAccount, transactions
    } = useBudget();
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState({ push: true, email: false, weekly: true });

    // Biometric State
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [isBioSupported, setIsBioSupported] = useState(false);

    useEffect(() => {
        const checkSupport = async () => {
            try {
                const supported = await isBiometricSupported();
                setIsBioSupported(supported);
                const stored = localStorage.getItem('biometric_enabled') === 'true';
                setBiometricEnabled(supported && stored);
            } catch (e) {
                console.warn("Biometric check failed", e);
            }
        };
        checkSupport();
    }, []);



    // ... existing imports ...

    const currencies: Currency[] = [
        'EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'NZD',
        'CNY', 'INR', 'SGD', 'KRW', 'TND', 'AED', 'SAR', 'ZAR',
        'TRY', 'BRL', 'MXN', 'SEK', 'NOK', 'DKK'
    ];
    const flagMap: Record<Currency, React.ElementType> = {
        'EUR': EU,
        'USD': US,
        'GBP': GB,
        'CHF': CH,
        'JPY': JP,
        'CAD': CA,
        'AUD': AU,
        'NZD': NZ,
        'CNY': CN,
        'INR': IN,
        'SGD': SG,
        'KRW': KR,
        'TND': TN,
        'AED': AE,
        'SAR': SA,
        'ZAR': ZA,
        'TRY': TR,
        'BRL': BR,
        'MXN': MX,
        'SEK': SE,
        'NOK': NO,
        'DKK': DK
    };

    const currencyOptions = currencies.map(c => ({
        label: c,
        value: c,
        icon: flagMap[c]
    }));

    const handleReset = async () => {
        if (biometricEnabled) {
            try {
                const verified = await verifyBiometric();
                if (!verified) return;
            } catch {
                alert("Authentification biométrique échouée.");
                return;
            }
        }
        await resetAccount();
        setIsResetModalOpen(false);
    };

    const handleBiometricToggle = async () => {
        if (biometricEnabled) {
            setBiometricEnabled(false);
            localStorage.setItem('biometric_enabled', 'false');
        } else {
            try {
                await registerBiometric();
                setBiometricEnabled(true);
                localStorage.setItem('biometric_enabled', 'true');
            } catch (err) {
                console.error("Biometric registration failed", err);
                alert("Impossible d'activer la biométrie. Vérifiez que votre appareil supporte FaceID/TouchID.");
            }
        }
    };

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Type,Category,Amount,Note\n"
            + transactions.map(t => `${t.date},${t.type},${t.category},${t.amount},${t.note || ''}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `budgetbud_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSignOut = async () => {
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/login';
                    },
                    onError: (ctx) => {
                        console.error('[LOGOUT] Error:', ctx.error.message);
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/login';
                    }
                }
            });
        } catch {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 md:px-8 space-y-10 animate-in fade-in duration-700 pb-32">
            {/* --- Profile Header (Glass Card) --- */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group">
                {/* Wave Background */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <svg className="absolute -top-[50%] -right-[20%] w-[120%] h-[200%] text-lime-500/20 fill-current rotate-180 opacity-60" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                        <path fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    <svg className="absolute -top-[40%] -right-[10%] w-[100%] h-[180%] text-lime-500/10 fill-current rotate-180" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                        <path fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-slate-900/10 flex items-center justify-center shadow-2xl">
                        {user?.image ? (
                            <img src={user.image} alt="Profile" className="w-full h-full object-cover rounded-[2rem]" />
                        ) : (
                            <User className="w-10 h-10 text-white dark:text-slate-900" />
                        )}
                    </div>
                    <div className="text-center md:text-left space-y-1">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">{user?.name || 'Utilisateur'}</h1>
                            <span className="px-2 py-0.5 bg-lime-500 rounded-md text-[10px] font-black uppercase tracking-widest text-black">Pro</span>
                        </div>
                        <p className="text-white/60 dark:text-slate-900/60 font-medium">{user?.email}</p>
                    </div>
                </div>

                <div className="relative z-10 flex gap-3">
                    <button onClick={handleSignOut} className="p-4 bg-white/10 dark:bg-black/5 hover:bg-red-500/20 dark:hover:bg-red-500/10 backdrop-blur-md rounded-2xl transition-all group/btn border border-white/10">
                        <LogOut className="w-5 h-5 text-red-300 dark:text-red-500" />
                    </button>
                    <button className="px-8 py-4 bg-white dark:bg-black text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                        Éditer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* --- Left Column: Settings (7 cols) --- */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Preferences */}
                    <section className="bg-white dark:bg-black rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <Zap className="w-5 h-5 text-lime-500" />
                                Préférences
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5/50 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-lime-100 dark:bg-lime-900/20 flex items-center justify-center text-lime-600 dark:text-lime-400">
                                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Apparence</p>
                                        <p className="text-xs text-slate-500 font-medium">Mode {theme === 'dark' ? 'Sombre' : 'Clair'} activé</p>
                                    </div>
                                </div>
                                <button onClick={toggleTheme} className="w-14 h-8 bg-slate-200 dark:bg-slate-700 rounded-full relative transition-colors">
                                    <div className={cn("absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300", theme === 'dark' && "translate-x-6")}></div>
                                </button>
                            </div>

                            {/* Currency Selection */}
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Devise Principale</h3>
                                <SearchableDropdown
                                    label="Devise Principale"
                                    value={currency}
                                    onChange={(val) => setCurrency(val as Currency)}
                                    options={currencyOptions}
                                    placeholder="Sélectionner..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Security & Notifications */}
                    <section className="bg-white dark:bg-black rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-lime-500" />
                                Sécurité & Alertes
                            </h2>
                        </div>

                        <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-lime-50 dark:bg-lime-900/10 rounded-lg text-lime-600"><Fingerprint className="w-5 h-5" /></div>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 dark:text-white">Biométrie</p>
                                        <p className="text-xs text-slate-500">
                                            {isBioSupported ? "Connexion par FaceID/TouchID" : "Non supporté sur cet appareil"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleBiometricToggle}
                                    disabled={!isBioSupported}
                                    className={cn("w-12 h-6 rounded-full relative transition-colors duration-300 disabled:opacity-50", biometricEnabled ? "bg-lime-500" : "bg-slate-200 dark:bg-slate-700")}
                                >
                                    <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300", biometricEnabled && "translate-x-6")}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-lime-50 dark:bg-lime-900/10 rounded-lg text-lime-600"><Bell className="w-5 h-5" /></div>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 dark:text-white">Notifications Push</p>
                                        <p className="text-xs text-slate-500">Alertes de dépenses</p>
                                    </div>
                                </div>
                                <button onClick={() => setNotifications(p => ({ ...p, push: !p.push }))} className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", notifications.push ? "bg-lime-500" : "bg-slate-200 dark:bg-slate-700")}>
                                    <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300", notifications.push && "translate-x-6")}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-lime-50 dark:bg-lime-900/10 rounded-lg text-lime-600"><Mail className="w-5 h-5" /></div>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 dark:text-white">Rapport Hebdomadaire</p>
                                        <p className="text-xs text-slate-500">Résumé par email</p>
                                    </div>
                                </div>
                                <button onClick={() => setNotifications(p => ({ ...p, weekly: !p.weekly }))} className={cn("w-12 h-6 rounded-full relative transition-colors duration-300", notifications.weekly ? "bg-lime-500" : "bg-slate-200 dark:bg-slate-700")}>
                                    <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300", notifications.weekly && "translate-x-6")}></div>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* --- Right Column: Data & System (5 cols) --- */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Data Management */}
                    <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-lime-900/40 transition-colors duration-1000"></div>
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-3 mb-2">
                                    <Lock className="w-5 h-5 text-lime-400" />
                                    Coffre-fort
                                </h2>
                                <p className="text-slate-400 text-sm">Gestion de vos données privées.</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleExport}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/item"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-lime-500/20 rounded-lg text-lime-400 group-hover/item:text-white transition-colors"><FileDown className="w-5 h-5" /></div>
                                        <div className="text-left">
                                            <p className="font-bold">Exporter les données</p>
                                            <p className="text-xs text-slate-400">Format CSV</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover/item:translate-x-1 transition-transform" />
                                </button>

                                <button
                                    onClick={() => setIsResetModalOpen(true)}
                                    className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl border border-red-500/20 transition-all group/item"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-500/20 rounded-lg text-red-500"><Trash2 className="w-5 h-5" /></div>
                                        <div className="text-left">
                                            <p className="font-bold text-red-400">Zone de Danger</p>
                                            <p className="text-xs text-red-400/60">Réinitialiser le compte</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-red-500/50 group-hover/item:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Automations (Simplified View) */}
                    <div className="bg-white dark:bg-black rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-slate-900 dark:text-white">Abonnements & Récurrences</h2>
                            <span className="px-2 py-1 bg-white dark:bg-white/5 rounded-lg text-xs font-black">{recurringTemplates.length}</span>
                        </div>
                        {recurringTemplates.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                <Zap className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-400 uppercase tracking-widest">Aucune règle</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recurringTemplates.slice(0, 3).map(r => (
                                    <div key={r.id} className="flex items-center justify-between p-3 bg-white dark:bg-white/5/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-white/5 rounded-lg shadow-sm">
                                                <Repeat className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{r.category}</span>
                                        </div>
                                        <span className="text-xs font-black">{formatCurrency(r.amount, currency)}</span>
                                    </div>
                                ))}
                                {recurringTemplates.length > 3 && (
                                    <p className="text-center text-xs font-bold text-slate-400 mt-2">et {recurringTemplates.length - 3} autres...</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* System Info */}
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-60">
                        <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">BudgetBud iOS v2.4.0</p>
                            <p className="text-[10px] text-slate-400 mt-1">Build 2024.10.25 • Neon Engine</p>
                        </div>
                        <div className="flex gap-4">
                            <a href="#" className="text-[10px] font-bold text-lime-500 hover:underline">Conditions</a>
                            <a href="#" className="text-[10px] font-bold text-lime-500 hover:underline">Confidentialité</a>
                            <a href="#" className="text-[10px] font-bold text-lime-500 hover:underline">Support</a>
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleReset}
                title="Suppression Définitive"
                message="Cette action effacera l'ensemble de vos transactions et budgets stockés sur le serveur. Voulez-vous continuer ?"
                type="error"
                confirmText="Confirmer la suppression"
                cancelText="Annuler"
            />
        </div>
    );
};

export default Settings;
