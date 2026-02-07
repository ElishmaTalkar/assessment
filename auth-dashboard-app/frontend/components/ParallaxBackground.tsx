'use client';

import { useState, useEffect } from 'react';

interface ParallaxBackgroundProps {
    showIntro: boolean;
    darkMode: boolean;
}

export default function ParallaxBackground({ showIntro, darkMode }: ParallaxBackgroundProps) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [particles] = useState<any[]>(() => {
        return [...Array(45)].map((_, i) => ({
            id: i,
            size: Math.random() * 2 + 1,
            top: Math.random() * 100,
            left: Math.random() * 100,
            floatX: (Math.random() - 0.5) * 80,
            floatY: (Math.random() - 0.5) * 80,
            duration: Math.random() * 10 + 10,
        }));
    });

    useEffect(() => {
        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            // Use requestAnimationFrame to further optimize high-frequency events
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                setMousePos({ x: e.clientX, y: e.clientY });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            <div className="background-pattern" style={{
                opacity: showIntro ? 0 : undefined,
                transform: `translate(${mousePos.x * 0.005}px, ${mousePos.y * 0.005}px)`
            }}></div>
            <div className="glow-orb glow-orb-1" style={{
                opacity: showIntro ? 0 : (darkMode ? 0.08 : 0.04),
                transform: `translate(${mousePos.x * -0.01}px, ${mousePos.y * -0.01}px)`
            }}></div>
            <div className="glow-orb glow-orb-2" style={{
                opacity: showIntro ? 0 : (darkMode ? 0.08 : 0.04),
                transform: `translate(${mousePos.x * 0.012}px, ${mousePos.y * 0.012}px)`
            }}></div>

            {/* Floating Particles */}
            {!showIntro && particles.map((p) => {
                const style = {
                    width: p.size + 'px',
                    height: p.size + 'px',
                    top: p.top + '%',
                    left: p.left + '%',
                    '--float-x': p.floatX + 'px',
                    '--float-y': p.floatY + 'px',
                    animation: `floatParticle ${p.duration}s linear infinite`,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any;

                return (
                    <div
                        key={p.id}
                        className="floating-particle"
                        style={style}
                    />
                );
            })}
        </>
    );
}
