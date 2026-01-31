import React from 'react';
import { CheckCircle2, AlertCircle, Info, HelpCircle } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Continuer',
    cancelText = 'Annuler'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-10 h-10 text-lime-500" />;
            case 'error': return <AlertCircle className="w-10 h-10 text-red-500" />;
            case 'warning': return <AlertCircle className="w-10 h-10 text-lime-400" />;
            case 'confirm': return <HelpCircle className="w-10 h-10 text-lime-500" />;
            default: return <Info className="w-10 h-10 text-slate-400" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success': return 'bg-lime-50 dark:bg-lime-500/10';
            case 'error': return 'bg-red-50 dark:bg-red-500/10';
            case 'warning': return 'bg-lime-50 dark:bg-lime-400/10';
            case 'confirm': return 'bg-lime-50 dark:bg-lime-500/10';
            default: return 'bg-white dark:bg-white0/10';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 animate-in fade-in duration-300">
            <div className="clay-card w-full max-w-sm p-8 animate-in zoom-in-95 duration-300 overflow-hidden relative">
                <div className="flex flex-col items-center text-center relative z-10">
                    <div className={`p-4 rounded-[2rem] shadow-inner mb-6 ${getBgColor()}`}>
                        {getIcon()}
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        {onConfirm && (
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 ${type === 'error' ? 'clay-button-danger' : 'clay-button-primary'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-2xl bg-white dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-black text-lg hover:bg-slate-200 transition-colors"
                        >
                            {onConfirm ? cancelText : 'Fermer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
