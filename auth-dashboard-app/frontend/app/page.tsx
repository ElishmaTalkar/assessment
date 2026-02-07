'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ParallaxBackground from '../components/ParallaxBackground';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [showIntro, setShowIntro] = useState(true);
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Design new landing page', priority: 2, deadline: '2024-03-15' },
        { id: 2, title: 'Fix critical bug in auth', priority: 1, deadline: '2024-03-10' },
        { id: 3, title: 'Update documentation', priority: 3, deadline: '2024-03-20' },
        { id: 4, title: 'Team meeting preparation', priority: 2, deadline: '2024-03-12' },
    ]);
    const [sorting, setSorting] = useState(false);
    const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

    // Redirect removed to allow logged-in users to view landing page
    // useEffect(() => {
    //     if (!loading && user) {
    //         router.push('/dashboard');
    //     }
    // }, [user, loading, router]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Check session storage to avoid repeating intro
        const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
        if (hasSeenIntro) {
            setTimeout(() => setShowIntro(false), 0);
            return;
        }

        const timer = setTimeout(() => {
            setShowIntro(false);
            sessionStorage.setItem('hasSeenIntro', 'true');
        }, 3500); // Reduced from 11000ms to 3500ms for a snappier experience
        return () => clearTimeout(timer);
    }, []);

    // Scroll-triggered animation observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections((prev) => new Set(prev).add(entry.target.id));
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
        );

        const sections = document.querySelectorAll('[data-animate]');
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [showIntro]);

    const handleMagicSort = () => {
        setSorting(true);
        setTimeout(() => {
            const sorted = [...tasks].sort((a, b) => a.priority - b.priority);
            setTasks(sorted);
            setSorting(false);
        }, 800);
    };

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: darkMode ? '#0a0f1e' : '#ffffff' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: ${darkMode ? '#0a0f1e' : '#ffffff'};
            color: ${darkMode ? '#ffffff' : '#0a0f1e'};
            overflow-x: hidden;
            transition: background 0.3s, color 0.3s;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        @keyframes glow {
            0%, 100% { box-shadow: 0 0 30px rgba(37, 99, 235, 0.3); }
            50% { box-shadow: 0 0 60px rgba(37, 99, 235, 0.5); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes taskSort {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }

        @keyframes badgeEntrance {
          0% {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            opacity: 1;
          }
          50% {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            opacity: 1;
          }
          100% {
            position: relative;
            top: auto;
            left: auto;
            transform: translate(0, 0);
            z-index: 1;
            opacity: 1;
          }
        }

        @keyframes contentFadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .spinner {
          border: 3px solid rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          border-top: 3px solid rgb(139, 92, 246);
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }

        /* 1. Scroll-triggered fade-in animation */
        [data-animate] {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        [data-animate].visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* 2. 3D Card Tilt Effect */
        .card-tilt {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          transform-style: preserve-3d;
        }

        .card-tilt:hover {
          transform: perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) scale(1.02);
          box-shadow: 0 20px 40px rgba(96, 165, 250, 0.2), 0 0 80px rgba(96, 165, 250, 0.1);
        }

        /* 3. Gradient Flow Animation */
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .gradient-flow {
          background: linear-gradient(135deg, #5b9dd9, #a8cde8, #4a7ba7, #5b9dd9);
          background-size: 300% 300%;
          animation: gradientFlow 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* 4. Shimmer Effect for Buttons */
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }

        .btn-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 3s infinite;
        }

        /* Minimalist Background Animations */
        
        /* Floating Particles Animation */
        .floating-particle {
          position: fixed;
          border-radius: 50%;
          background: ${darkMode ? 'rgba(91, 157, 217, 0.6)' : 'rgba(91, 157, 217, 0.4)'};
          pointer-events: none;
          z-index: 0;
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(var(--float-x, 20px), var(--float-y, -30px)) scale(1.1);
            opacity: 1;
          }
        }

        /* Gradient Shift Animation */
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Grid Wave Morphing */
        @keyframes gridWave {
          0%, 100% {
            transform: translateY(0) skewY(0deg);
          }
          50% {
            transform: translateY(2px) skewY(0.5deg);
          }
        }


        .background-pattern {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            opacity: ${darkMode ? '0.15' : '0.08'};
            transition: opacity 2s ease;
            background-image: 
                linear-gradient(30deg, transparent 12%, ${darkMode ? 'rgba(91, 157, 217, 0.03)' : 'rgba(91, 157, 217, 0.02)'} 12%, ${darkMode ? 'rgba(91, 157, 217, 0.03)' : 'rgba(91, 157, 217, 0.02)'} 13%, transparent 13%);
            background-size: 70px 120px;
            animation: gridWave 8s ease-in-out infinite;
        }

        .glow-orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(120px);
            opacity: ${darkMode ? '0.08' : '0.04'};
            transition: opacity 2s ease;
            pointer-events: none;
            z-index: 0;
        }

        .glow-orb-1 {
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(91, 157, 217, 0.4), transparent);
            top: -200px;
            right: -200px;
            animation: float 20s ease-in-out infinite, gradientShift 15s ease infinite;
        }

        .glow-orb-2 {
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(74, 123, 167, 0.3), transparent);
            bottom: -150px;
            left: -150px;
            animation: float 25s ease-in-out infinite reverse, gradientShift 18s ease infinite;
        }

        header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            padding: 1.5rem 4rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
        }

        header.scrolled {
            background: ${darkMode ? 'rgba(10, 15, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)'};
            backdrop-filter: blur(${scrolled ? '25px' : '10px'});
            border-bottom: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            padding: 1rem 4rem;
        }

        .nav-menu {
            display: flex;
            gap: 2.5rem;
            align-items: center;
        }

        .nav-item {
            color: ${darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'};
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.3s;
            position: relative;
        }

        .nav-item:hover {
            color: #5b9dd9;
        }

        .theme-toggle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.3s;
        }

        .theme-toggle:hover {
            background: ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
            transform: rotate(180deg);
        }

        .btn-login {
            padding: 0.65rem 1.8rem;
            background: transparent;
            border: 1.5px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
            color: ${darkMode ? '#ffffff' : '#0a0f1e'};
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            border-radius: 8px;
        }

        .btn-login:hover {
            border-color: #5b9dd9;
            background: rgba(96, 165, 250, 0.1);
            transform: translateY(-2px);
        }

        .btn-primary {
            padding: 0.65rem 2rem;
            background: linear-gradient(135deg, #2563eb, #5b9dd9);
            border: none;
            color: #ffffff;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(37, 99, 235, 0.4);
        }

        .hero-section {
            position: relative;
            z-index: 1;
            padding: 12rem 4rem 4rem;
            text-align: center;
            max-width: 1400px;
            margin: 0 auto;
        }

        .hero-badge {
            display: inline-block;
            padding: 0.7rem 1.8rem;
            border: 1.5px solid rgba(96, 165, 250, 0.3);
            background: rgba(37, 99, 235, 0.1);
            font-size: 0.85rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 2rem;
            border-radius: 50px;
            animation: ${showIntro ? 'badgeEntrance 3.5s ease-in-out forwards' : 'fadeIn 1s ease-out'};
        }

        .hero-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 4.5rem;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            animation: ${showIntro ? 'contentFadeIn 1s ease-out 2s backwards' : 'fadeInUp 1s ease-out 0.2s backwards'};
        }

        .gradient-text {
            background: linear-gradient(135deg, #5b9dd9, #dbeafe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-subtitle {
            font-size: 1.1rem;
            color: ${darkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.6)'};
            max-width: 750px;
            margin: 0 auto 3rem;
            line-height: 1.8;
            animation: ${showIntro ? 'contentFadeIn 1s ease-out 2.3s backwards' : 'fadeInUp 1s ease-out 0.4s backwards'};
        }

        .cta-buttons {
            display: flex;
            gap: 1.5rem;
            justify-content: center;
            justify-content: center;
            animation: ${showIntro ? 'contentFadeIn 1s ease-out 2.6s backwards' : 'fadeInUp 1s ease-out 0.6s backwards'};
        }

        .btn-large {
            padding: 1.2rem 3rem;
            font-size: 1.05rem;
        }

        .btn-secondary {
            padding: 1.2rem 3rem;
            background: ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            border: 1.5px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
            color: ${darkMode ? '#ffffff' : '#0a0f1e'};
            font-size: 1.05rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
            background: ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            border-color: #5b9dd9;
            transform: translateY(-2px);
        }

        .ai-dashboard {
            position: relative;
            z-index: 1;
            padding: 4rem;
            max-width: 900px;
            margin: 4rem auto;
            background: ${darkMode ? 'rgba(26, 38, 66, 0.4)' : 'rgba(255, 255, 255, 0.8)'};
            backdrop-filter: blur(20px);
            border: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            border-radius: 20px;
            box-shadow: 0 20px 60px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .dashboard-title {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .magic-sort-btn {
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #8b5cf6, #a78bfa);
            border: none;
            color: #ffffff;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .magic-sort-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
        }

        .magic-sort-btn.sorting {
            animation: glow 1s infinite;
        }

        .task-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .task-item {
            padding: 1rem 1.5rem;
            background: ${darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.9)'};
            border: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .task-item.sorting {
            animation: taskSort 0.8s ease-in-out;
        }

        .priority-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
font-weight: 600;
        }

        .priority-1 { background: #fca5a5; color: #7f1d1d; }
        .priority-2 { background: #fde68a; color: #78350f; }
        .priority-3 { background: #86efac; color: #14532d; }

        .bento-grid-section {
            position: relative;
            z-index: 1;
            padding: 6rem 4rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .interactive-bento {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 300px);
            gap: 1.5rem;
        }

        .bento-card {
            background: ${darkMode ? 'rgba(26, 38, 66, 0.4)' : 'rgba(255, 255, 255, 0.8)'};
            backdrop-filter: blur(20px);
            border: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
            border-radius: 20px;
            padding: 2rem;
            transition: all 0.3s;
            overflow: hidden;
            position: relative;
        }

        .bento-card:hover {
            transform: translateY(-5px);
            border-color: rgba(96, 165, 250, 0.3);
        }

        .bento-card.large {
            grid-column: span 2;
            grid-row: span 1;
        }

        .bento-card.wide {
            grid-column: span 3;
        }

        .avatar-stack {
            display: flex;
            margin-top: 1.5rem;
        }

        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid ${darkMode ? '#0a0f1e' : '#ffffff'};
            margin-left: -12px;
            background: linear-gradient(135deg, #2563eb, #5b9dd9);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .avatar:first-child {
            margin-left: 0;
        }

        .search-bar {
            width: 100%;
            padding: 0.75rem 1rem;
            background: ${darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.9)'};
            border: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            border-radius: 10px;
            color: ${darkMode ? '#ffffff' : '#0a0f1e'};
            font-size: 0.95rem;
            margin-top: 1rem;
        }

        .timeline-bar {
            width: 100%;
            height: 40px;
            background: ${darkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.9)'};
            border-radius: 10px;
            margin-top: 1rem;
            position: relative;
            overflow: hidden;
        }

        .timeline-segment {
            position: absolute;
            height: 100%;
            background: linear-gradient(135deg, #2563eb, #5b9dd9);
            border-radius: 10px;
            display: flex;
            align-items: center;
            padding: 0 1rem;
            color: white;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .terminal-section {
            position: relative;
            z-index: 1;
            padding: 6rem 4rem;
            max-width: 1000px;
            margin: 0 auto;
        }

        .terminal-window {
            background: #1e1e1e;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .terminal-header {
            background: #323232;
            padding: 0.75rem 1rem;
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .terminal-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .dot-red { background: #ff5f56; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #27c93f; }

        .terminal-body {
            padding: 1.5rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            line-height: 1.8;
            color: #d4d4d4;
        }

        .terminal-prompt {
            color: #4ec9b0;
        }

        .terminal-string {
            color: #ce9178;
        }

        .terminal-keyword {
            color: #c586c0;
        }

        .terminal-comment {
            color: #6a9955;
        }

        .trusted-section {
            position: relative;
            z-index: 1;
            padding: 4rem 4rem;
            text-align: center;
            border-top: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            border-bottom: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            margin: 4rem 0;
        }

        .trusted-title {
            font-size: 0.9rem;
            color: ${darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
            margin-bottom: 2rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
        }

        .company-logos {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 4rem;
            flex-wrap: wrap;
        }

        .company-logo {
            font-size: 1.8rem;
            font-weight: 700;
            color: ${darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
            opacity: 0.6;
            transition: opacity 0.3s;
        }

        .company-logo:hover {
            opacity: 1;
        }

        .features-grid {
            position: relative;
            z-index: 1;
            padding: 6rem 4rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }

        .section-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2.8rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .section-subtitle {
            font-size: 1.2rem;
            color: ${darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'};
        }

        .simple-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .feature-card {
            background: ${darkMode ? 'rgba(26, 38, 66, 0.4)' : 'rgba(255, 255, 255, 0.8)'};
            backdrop-filter: blur(20px);
            border: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
            padding: 3rem 2.5rem;
            border-radius: 20px;
            position: relative;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #2563eb, #5b9dd9);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.4s;
        }

        .feature-card:hover::before {
            transform: scaleX(1);
        }

        .feature-card:hover {
            background: ${darkMode ? 'rgba(26, 38, 66, 0.6)' : 'rgba(255, 255, 255, 1)'};
            border-color: rgba(96, 165, 250, 0.2);
            transform: translateY(-10px);
        }

        .feature-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(96, 165, 250, 0.15));
            border: 2px solid rgba(96, 165, 250, 0.3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
            transition: all 0.3s;
        }

        .feature-card:hover .feature-icon {
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(96, 165, 250, 0.25));
            border-color: #5b9dd9;
        }

        .feature-title {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .feature-description {
            font-size: 1rem;
            color: ${darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
            line-height: 1.7;
        }

        .cta-final {
            position: relative;
            z-index: 1;
            padding: 8rem 4rem;
            text-align: center;
        }

        .cta-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 3.2rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
        }

        .cta-subtitle {
            font-size: 1.3rem;
            color: ${darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
            margin-bottom: 3rem;
        }

        footer {
            position: relative;
            z-index: 1;
            padding: 4rem 4rem 2rem;
            border-top: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
        }

        .footer-content {
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3rem;
        }

        .footer-brand {
            max-width: 350px;
        }

        .footer-logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .footer-description {
            font-size: 0.95rem;
            color: ${darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'};
            line-height: 1.7;
        }

        .footer-column h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #5b9dd9;
        }

        .footer-links {
            list-style: none;
            padding: 0;
        }

        .footer-links li {
            margin-bottom: 0.8rem;
        }

        .footer-links a {
            color: ${darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'};
            font-size: 0.9rem;
            transition: color 0.3s;
            cursor: pointer;
        }

        .footer-links a:hover {
            color: #5b9dd9;
        }

        .footer-bottom {
            max-width: 1400px;
            margin: 0 auto;
            padding-top: 2rem;
            border-top: 1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .footer-copyright {
            color: ${darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
            font-size: 0.9rem;
        }

        .social-links {
            display: flex;
            gap: 1.5rem;
        }

        .social-link {
            color: ${darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'};
            font-size: 1.2rem;
            transition: color 0.3s;
            cursor: pointer;
        }

        .social-link:hover {
            color: #5b9dd9;
        }

        @media (max-width: 1024px) {
            header { padding: 1.5rem 2rem; }
            header.scrolled { padding: 1rem 2rem; }
            .hero-section { padding: 10rem 2rem 4rem; }
            .hero-title { font-size: 4rem; }
            .footer-content { grid-template-columns: 1fr 1fr; }
            .interactive-bento { grid-template-columns: 1fr; grid-template-rows: auto; }
            .bento-card.large, .bento-card.wide { grid-column: span 1; }
        }

        @media (max-width: 768px) {
            .nav-menu { display: none; }
            .hero-title { font-size: 3rem; }
            .cta-buttons { flex-direction: column; }
            .footer-content { grid-template-columns: 1fr; }
            .footer-bottom { flex-direction: column; gap: 1rem; }
        }
      `}</style>

            <ParallaxBackground showIntro={showIntro} darkMode={darkMode} />

            <header className={scrolled ? 'scrolled' : ''} style={{ opacity: showIntro ? 0 : undefined }}>
                <nav className="nav-menu">
                    <span className="nav-item">Solutions</span>
                    <span className="nav-item">Features</span>
                    <span className="nav-item">Customers</span>
                    <span className="nav-item">Pricing</span>
                    <span className="nav-item">Resources</span>
                </nav>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                    {user ? (
                        <button className="btn-primary" onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
                    ) : (
                        <>
                            <button className="btn-login" onClick={() => router.push('/login')}>Log In</button>
                            <button className="btn-primary" onClick={() => router.push('/signup')}>Request Demo</button>
                        </>
                    )}
                </div>
            </header>

            <section className="hero-section">
                <div className="hero-badge">
                    MODERN TASK MANAGEMENT
                </div>
                <h1 className="hero-title" style={{ opacity: showIntro ? 0 : undefined }}>
                    Organize Your Work<br />
                    <span className="gradient-flow">Boost Productivity</span>
                </h1>
                <p className="hero-subtitle" style={{ opacity: showIntro ? 0 : undefined }}>
                    A beautiful, intuitive task management platform designed to help you stay organized, focused, and productive. Built with modern technologies for the best user experience.
                </p>
                <div className="cta-buttons" style={{ opacity: showIntro ? 0 : undefined }}>
                    <button className="btn-primary btn-large btn-shimmer" onClick={() => router.push('/login')}>Start Free Trial</button>
                    <button className="btn-secondary btn-large" onClick={() => router.push('/signup')}>Sign In</button>
                </div>
            </section>

            {/* AI Task Prioritizer Dashboard */}
            <div id="ai-dashboard" data-animate className={`ai-dashboard ${visibleSections.has('ai-dashboard') ? 'visible' : ''}`} style={{ opacity: showIntro ? 0 : undefined }}>
                <div className="dashboard-header">
                    <h3 className="dashboard-title">AI Task Prioritizer</h3>
                    <button className={`magic-sort-btn ${sorting ? 'sorting' : ''}`} onClick={handleMagicSort} disabled={sorting}>
                        <span>✨</span>
                        <span>{sorting ? 'Sorting...' : 'Magic Sort'}</span>
                    </button>
                </div>
                <div className="task-list">
                    {tasks.map((task) => (
                        <div key={task.id} className={`task-item ${sorting ? 'sorting' : ''}`}>
                            <span>{task.title}</span>
                            <span className={`priority-badge priority-${task.priority}`}>
                                Priority {task.priority}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Bento Grid */}
            <section id="bento-grid" data-animate className={`bento-grid-section ${visibleSections.has('bento-grid') ? 'visible' : ''}`} style={{ opacity: showIntro ? 0 : undefined }}>
                <div className="section-header">
                    <h2 className="section-title">Interactive Workspace</h2>
                    <p className="section-subtitle">Experience collaboration in real-time</p>
                </div>
                <div className="interactive-bento">
                    <div className="bento-card large card-tilt" onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateX = ((y - centerY) / centerY) * -10;
                        const rotateY = ((x - centerX) / centerX) * 10;
                        e.currentTarget.style.setProperty('--rotate-x', `${rotateX}deg`);
                        e.currentTarget.style.setProperty('--rotate-y', `${rotateY}deg`);
                    }} onMouseLeave={(e) => {
                        e.currentTarget.style.setProperty('--rotate-x', '0deg');
                        e.currentTarget.style.setProperty('--rotate-y', '0deg');
                    }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>👥 Team Collaboration</h3>
                        <p style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', marginBottom: '1rem' }}>
                            Work together in real-time
                        </p>
                        <div className="avatar-stack">
                            <div className="avatar">A</div>
                            <div className="avatar">B</div>
                            <div className="avatar">C</div>
                            <div className="avatar">+5</div>
                        </div>
                    </div>
                    <div className="bento-card card-tilt" onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateX = ((y - centerY) / centerY) * -10;
                        const rotateY = ((x - centerX) / centerX) * 10;
                        e.currentTarget.style.setProperty('--rotate-x', `${rotateX}deg`);
                        e.currentTarget.style.setProperty('--rotate-y', `${rotateY}deg`);
                    }} onMouseLeave={(e) => {
                        e.currentTarget.style.setProperty('--rotate-x', '0deg');
                        e.currentTarget.style.setProperty('--rotate-y', '0deg');
                    }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>🔍 Global Search</h3>
                        <p style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', fontSize: '0.9rem' }}>
                            Find anything instantly
                        </p>
                        <input className="search-bar" placeholder="Search tasks..." />
                    </div>
                    <div className="bento-card wide card-tilt" onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateX = ((y - centerY) / centerY) * -10;
                        const rotateY = ((x - centerX) / centerX) * 10;
                        e.currentTarget.style.setProperty('--rotate-x', `${rotateX}deg`);
                        e.currentTarget.style.setProperty('--rotate-y', `${rotateY}deg`);
                    }} onMouseLeave={(e) => {
                        e.currentTarget.style.setProperty('--rotate-x', '0deg');
                        e.currentTarget.style.setProperty('--rotate-y', '0deg');
                    }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>📊 Project Timeline</h3>
                        <p style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', marginBottom: '1rem' }}>
                            Visualize your project progress
                        </p>
                        <div className="timeline-bar">
                            <div className="timeline-segment" style={{ left: '0%', width: '30%' }}>Design</div>
                            <div className="timeline-segment" style={{ left: '32%', width: '25%' }}>Development</div>
                            <div className="timeline-segment" style={{ left: '59%', width: '20%' }}>Testing</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Terminal Component */}
            <section id="terminal" data-animate className={`terminal-section ${visibleSections.has('terminal') ? 'visible' : ''}`} style={{ opacity: showIntro ? 0 : undefined }}>
                <div className="section-header">
                    <h2 className="section-title">Built for Developers</h2>
                    <p className="section-subtitle">Powerful API for seamless integration</p>
                </div>
                <div className="terminal-window">
                    <div className="terminal-header">
                        <div className="terminal-dot dot-red"></div>
                        <div className="terminal-dot dot-yellow"></div>
                        <div className="terminal-dot dot-green"></div>
                    </div>
                    <div className="terminal-body">
                        <div><span className="terminal-comment"># Install TaskFlow SDK</span></div>
                        <div><span className="terminal-prompt">$</span> pip install taskflow-sdk</div>
                        <div style={{ marginTop: '1rem' }}><span className="terminal-comment"># Initialize and create tasks</span></div>
                        <div><span className="terminal-keyword">from</span> taskflow <span className="terminal-keyword">import</span> TaskFlow</div>
                        <div style={{ marginTop: '0.5rem' }}>client = TaskFlow(<span className="terminal-string">&quot;your-api-key&quot;</span>)</div>
                        <div style={{ marginTop: '0.5rem' }}>task = client.create_task(</div>
                        <div style={{ paddingLeft: '2rem' }}>title=<span className="terminal-string">&quot;Build landing page&quot;</span>,</div>
                        <div style={{ paddingLeft: '2rem' }}>priority=<span className="terminal-string">&quot;high&quot;</span>,</div>
                        <div style={{ paddingLeft: '2rem' }}>deadline=<span className="terminal-string">&quot;2024-03-15&quot;</span></div>
                        <div>)</div>
                    </div>
                </div>
            </section>



            {/* Powerful Features Section */}
            <section id="features" data-animate className={`features-grid ${visibleSections.has('features') ? 'visible' : ''}`} style={{ opacity: showIntro ? 0 : undefined }}>
                <div className="section-header">
                    <h2 className="section-title">Powerful Features</h2>
                    <p className="section-subtitle">Everything you need to manage tasks efficiently</p>
                </div>
                <div className="simple-grid">
                    <div className="feature-card card-tilt">
                        <div className="feature-icon">⚡</div>
                        <h3 className="feature-title">Real-time Collaboration</h3>
                        <p className="feature-description">Work together seamlessly with your team in real-time with instant updates and notifications.</p>
                    </div>
                    <div className="feature-card card-tilt">
                        <div className="feature-icon">🤖</div>
                        <h3 className="feature-title">AI Task Prioritization</h3>
                        <p className="feature-description">Let AI help you prioritize tasks based on deadlines, importance, and dependencies.</p>
                    </div>
                    <div className="feature-card card-tilt">
                        <div className="feature-icon">🔄</div>
                        <h3 className="feature-title">Cross-platform Sync</h3>
                        <p className="feature-description">Access your tasks anywhere, anytime. Seamless synchronization across all your devices.</p>
                    </div>
                    <div className="feature-card card-tilt">
                        <div className="feature-icon">📊</div>
                        <h3 className="feature-title">Advanced Analytics</h3>
                        <p className="feature-description">Track productivity with comprehensive analytics and insightful data visualizations.</p>
                    </div>
                    <div className="feature-card card-tilt">
                        <div className="feature-icon">🔒</div>
                        <h3 className="feature-title">Enterprise Security</h3>
                        <p className="feature-description">Bank-level encryption and security measures to keep your data safe and private.</p>
                    </div>
                    <div className="feature-card card-tilt">
                        <div className="feature-icon">🎨</div>
                        <h3 className="feature-title">Customizable Workflows</h3>
                        <p className="feature-description">Tailor the platform to match your unique workflow with custom fields and views.</p>
                    </div>
                </div>
            </section>

            <section id="cta-final" data-animate className={`cta-final ${visibleSections.has('cta-final') ? 'visible' : ''}`} style={{ opacity: showIntro ? 0 : undefined }}>
                <h2 className="cta-title">Ready to Get Started?</h2>
                <p className="cta-subtitle">Join thousands of users who are already managing their tasks more efficiently</p>
                <button className="btn-primary btn-large btn-shimmer" onClick={() => router.push('/signup')}>Create Your Account</button>
            </section>

            <footer style={{ opacity: showIntro ? 0 : undefined }}>
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="footer-logo">TaskFlow</div>
                        <p className="footer-description">
                            The modern task management platform built for teams who demand excellence. Organize, prioritize, and achieve more.
                        </p>
                    </div>

                    <div className="footer-column">
                        <h4>Company</h4>
                        <ul className="footer-links">
                            <li><a>About Us</a></li>
                            <li><a>Careers</a></li>
                            <li><a>Blog</a></li>
                            <li><a>Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Resources</h4>
                        <ul className="footer-links">
                            <li><a>Documentation</a></li>
                            <li><a>Help Center</a></li>
                            <li><a>API</a></li>
                            <li><a>Community</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="footer-copyright">© 2026 TaskFlow. All rights reserved.</p>
                    <div className="social-links">
                        <span className="social-link">𝕏</span>
                        <span className="social-link">in</span>
                        <span className="social-link">f</span>
                        <span className="social-link">★</span>
                    </div>
                </div>
            </footer>
        </>
    );
}
