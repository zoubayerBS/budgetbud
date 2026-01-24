import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../lib/auth-client';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signUp.email({
                email,
                password,
                name,
            }, {
                onSuccess: () => {
                    navigate('/');
                },
                onError: (ctx) => {
                    setError(ctx.error.message || 'Erreur lors de l\'inscription');
                }
            });
        } catch (err) {
            setError('Erreur de connexion au serveur d\'authentification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#eef2f6] dark:bg-[#111827] p-4">
            <div className="clay-card p-8 w-full max-w-md animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-[1.75rem] flex items-center justify-center shadow-xl shadow-emerald-500/20 text-white mb-6 transition-transform hover:scale-110 duration-500">
                        <span className="font-black text-3xl tracking-tighter">B</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight">BudgetBud</h2>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-3">Création de Profil Zen</p>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Nom complet</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-800 dark:text-white font-bold shadow-inner outline-none focus:ring-2 focus:ring-emerald-500/50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-800 dark:text-white font-bold shadow-inner outline-none focus:ring-2 focus:ring-emerald-500/50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-800 dark:text-white font-bold shadow-inner outline-none focus:ring-2 focus:ring-emerald-500/50"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="clay-button bg-emerald-500 text-white w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-lg shadow-xl shadow-emerald-500/30 disabled:opacity-50"
                    >
                        {loading ? 'Création en cours...' : 'S\'inscrire'}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-500 font-medium text-sm">
                    Déjà un compte ? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
