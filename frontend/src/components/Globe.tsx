"use client";

import { useEffect, useRef } from "react";

type GlobeProps = {
    dot?: string;
    net?: string;
    density?: number;
    spin?: number;
    spinDir?: "left" | "right";
    hoverOn?: boolean;
    sizePercent?: number;
    dots?: {
        size?: number;
        wobble?: number;
        flicker?: number;
    };
    cage?: {
        detail?: number;
        spread?: number;
        glow?: number;
    };
    shimmer?: {
        color?: string;
        speed?: number;
        style?: string;
        angle?: number;
        width?: number;
    };
    waves?: {
        color?: string;
        color2?: string;
        size?: number;
        glow?: number;
        speed?: number;
    };
    hover?: {
        fill?: number;
        glow?: number;
        reach?: number;
    };
};

export default function Globe({
    dot = "#F6F8FB",
    net = "#FF3D8F",
    density = 14,
    spin = 6,
    spinDir = "right",
    hoverOn = true,
    sizePercent = 150,
}: GlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrame: number;
        let rotation = 0;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;

            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            canvas.style.width = "100%";
            canvas.style.height = "100%";

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            ctx.clearRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            const radius =
                Math.min(width, height) * (sizePercent / 100) * 0.5;

            const points = density * 10;

            for (let i = 0; i < points; i++) {
                const phi = Math.acos(1 - (2 * (i + 0.5)) / points);
                const theta =
                    Math.PI *
                    (1 + Math.sqrt(5)) *
                    i +
                    rotation;

                const x = Math.sin(phi) * Math.cos(theta);
                const y = Math.cos(phi);
                const z = Math.sin(phi) * Math.sin(theta);

                if (z < -0.15) continue;

                const perspective = 0.72 + z * 0.28;

                const px = centerX + x * radius * perspective;
                const py = centerY + y * radius * perspective;

                const alpha = 0.15 + z * 0.7;

                ctx.beginPath();
                ctx.arc(
                    px,
                    py,
                    Math.max(1, 1.5 + z * 2),
                    0,
                    Math.PI * 2
                );

                ctx.globalAlpha = alpha;
                ctx.fillStyle = dot;
                ctx.fill();
            }

            // Globe outline
            ctx.globalAlpha = 0.16;
            ctx.strokeStyle = net;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.arc(
                centerX,
                centerY,
                radius * 0.72,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            // Glow
            const gradient = ctx.createRadialGradient(
                centerX,
                centerY,
                radius * 0.2,
                centerX,
                centerY,
                radius
            );

            gradient.addColorStop(0, "rgba(255,61,143,0.04)");
            gradient.addColorStop(0.55, "rgba(61,217,196,0.03)");
            gradient.addColorStop(1, "rgba(11,17,32,0)");

            ctx.globalAlpha = 1;
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(
                centerX,
                centerY,
                radius,
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.globalAlpha = 1;

            const direction = spinDir === "left" ? -1 : 1;

            rotation +=
                direction *
                0.0008 *
                Math.max(1, spin / 3);

            animationFrame = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener("resize", resize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", resize);
        };
    }, [dot, net, density, spin, spinDir, hoverOn, sizePercent]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
        />
    );
}