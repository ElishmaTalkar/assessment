'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Check, Circle } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string }>({});

    // Theme State
    const [darkMode, setDarkMode] = useState(true);

    const { signup } = useAuth(); // Removed user from destructuring
    const router = useRouter();

    // Removed auto-redirect useEffect

    // Theme Initialization
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light') setDarkMode(false);
    }, []);

    // Apply Theme (corporate look)
    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.style.setProperty('--bg-primary', '#0a0f1e');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#94a3b8');
            root.style.setProperty('--input-bg', '#1e293b');
            root.style.setProperty('--border-color', '#334155');
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--text-primary', '#000000');
            root.style.setProperty('--text-secondary', '#64748b');
            root.style.setProperty('--input-bg', '#ffffff');
            root.style.setProperty('--border-color', '#cbd5e1');
        }
    }, [darkMode]);

    // Password strength
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
    };

    const validateForm = () => {
        const newErrors: { name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string } = {};
        if (!name) newErrors.name = 'Name is required';

        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

        if (!phone) newErrors.phone = 'Phone number is required';

        if (!password) newErrors.password = 'Password is required';
        else if (!Object.values(passwordChecks).every(Boolean)) newErrors.password = 'Password does not meet requirements';

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await signup(name, email, password, phone);
            router.push('/dashboard');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Error handled by toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300"
            style={{ background: 'var(--bg-primary)', fontFamily: '"Montserrat", sans-serif' }}>

            {/* Corporate Ultra Spacious Styles with Premium Font */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');

                .heading-serif {
                    font-family: 'Cormorant Garamond', serif;
                }

                .input-corporate {
                    width: 100%;
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    background: var(--input-bg);
                    padding: 0.6rem 1rem;
                    color: var(--text-primary);
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-size: 0.95rem;
                    font-family: inherit;
                }
                .input-corporate:focus {
                    border-color: #1e3a8a;
                    box-shadow: 0 0 0 1px #1e3a8a;
                }
                .label-corporate {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    letter-spacing: 0.01em;
                }
                .btn-corporate {
                    width: 100%;
                    background: #1e40af; /* Dark Blue */
                    color: white;
                    font-weight: 600;
                    padding: 0.8rem;
                    text-transform: uppercase;
                    border-radius: 4px;
                    letter-spacing: 1px;
                    transition: background 0.2s, transform 0.1s;
                    margin-top: 2rem;
                    font-size: 0.95rem;
                    cursor: pointer;
                    box-shadow: none;
                    border: none;
                }
                .btn-corporate:hover {
                    background: #1e3a8a;
                    transform: translateY(-1px);
                }
                .social-btn {
                    padding: 0.8rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    background: transparent;
                    border: 1px solid transparent; 
                    cursor: pointer;
                }
                .social-btn:hover {
                    background: rgba(148, 163, 184, 0.1);
                    transform: scale(1.1);
                }
             `}</style>

            <div className="w-full relative z-10" style={{ maxWidth: '450px' }}>
                <div className="p-8 transition-all duration-300">

                    <div className="text-center mb-16">
                        <h1 className="heading-serif font-bold mb-4 tracking-tight transition-colors"
                            style={{ color: 'var(--text-primary)', fontSize: '2.5rem', lineHeight: 1.1 }}>
                            Sign Up
                        </h1>
                        <p className="heading-serif transition-colors mt-2"
                            style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.2 }}>
                            Join us to start managing tasks
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="mb-6">
                            <label htmlFor="name" className="label-corporate">Full Name *</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-corporate"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="mb-6">
                            <label htmlFor="email" className="label-corporate">Business Email *</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-corporate"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
                        </div>

                        {/* Phone Number */}
                        <div className="mb-6">
                            <label htmlFor="phone" className="label-corporate">Phone Number *</label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input-corporate"
                                placeholder="+1 (555) 000-0000"
                            />
                            {errors.phone && <p className="text-red-500 text-sm mt-2">{errors.phone}</p>}
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label htmlFor="password" className="label-corporate">Password *</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-corporate"
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none outline-none z-10 cursor-pointer"
                                    style={{ right: '1rem', left: 'auto' }}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {password && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Password must contain:</p>
                                    <div className="space-y-2">
                                        <PasswordCheck met={passwordChecks.length} text="At least 8 characters" />
                                        <PasswordCheck met={passwordChecks.uppercase} text="One uppercase letter" />
                                        <PasswordCheck met={passwordChecks.lowercase} text="One lowercase letter" />
                                        <PasswordCheck met={passwordChecks.number} text="One number" />
                                    </div>
                                </div>
                            )}
                            {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className="label-corporate">Confirm Password *</label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (e.target.value !== password) {
                                            setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
                                        } else {
                                            setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                        }
                                    }}
                                    className="input-corporate"
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none outline-none z-10 cursor-pointer"
                                    style={{ right: '1rem', left: 'auto' }}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-corporate"
                        >
                            {loading ? 'Processing...' : 'SIGN UP'}
                        </button>
                    </form>

                    {/* Socials */}
                    <div className="mt-24">
                        <div className="flex justify-center gap-12">
                            {/* Google */}
                            <button className="social-btn" type="button" title="Sign in with Google">
                                <svg viewBox="0 0 24 24" width="36" height="36"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                            </button>
                            {/* LinkedIn */}
                            <button className="social-btn" type="button" title="Sign in with LinkedIn">
                                <svg viewBox="0 0 24 24" width="36" height="36" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                            </button>
                            {/* Microsoft */}
                            <button className="social-btn" type="button" title="Sign in with Microsoft">
                                <svg viewBox="0 0 24 24" width="36" height="36"><path fill="#f25022" d="M1 1h10v10H1z" /><path fill="#00a4ef" d="M1 13h10v10H1z" /><path fill="#7fba00" d="M13 1h10v10H13z" /><path fill="#ffb900" d="M13 13h10v10H13z" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="mt-20 text-center text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                        <Link href="/login" className="font-semibold transition-colors hover:underline" style={{ color: '#1e40af' }}>
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PasswordCheck({ met, text }: { met: boolean; text: string }) {
    return (
        <div className="flex items-center gap-2 transition-all duration-300">
            {met ? (
                <Check className="w-4 h-4 text-green-500" style={{ color: '#22c55e' }} />
            ) : (
                <Circle className="w-4 h-4 text-gray-500" style={{ color: '#6b7280' }} />
            )}
            <span className={`text-sm ${met ? 'text-green-500 font-medium' : 'text-gray-400'}`} style={{ transition: 'color 0.2s', color: met ? '#22c55e' : '#9ca3af' }}>{text}</span>
        </div>
    );
}
