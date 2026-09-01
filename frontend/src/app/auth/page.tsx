"use client";

import { useRef, useState } from "react";
import { loginUser, registerUser } from "@/services/auth";
import Globe from "@/components/Globe"; // adjust path to wherever you saved Globe.tsx

function CornerTick({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
    const sides: Record<string, string> = {
        tl: "-left-px -top-px border-l-2 border-t-2",
        tr: "-right-px -top-px border-r-2 border-t-2",
        bl: "-left-px -bottom-px border-l-2 border-b-2",
        br: "-right-px -bottom-px border-r-2 border-b-2",
    };
    return (
        <span
            className={`absolute h-3 w-3 border-[#3DD9C4] [transform:translateZ(36px)] ${sides[position]}`}
        />
    );
}

function Field({
    id,
    label,
    children,
}: {
    id: string;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="transition-transform duration-300 [transform:translateZ(14px)] focus-within:[transform:translateZ(30px)]">
            <label htmlFor={id} className="text-xs text-[#6C82A0]">
                {label}
            </label>
            <div className="mt-1">{children}</div>
        </div>
    );
}

const inputClass =
    "w-full border border-[#25334A] bg-[#0C1524] px-3 py-2 text-sm text-[#F6F8FB] placeholder-[#4D5F78] outline-none transition-colors focus:border-[#FF3D8F]";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    // separate state per face, since both the login and register forms
    // now live in the DOM at the same time (front/back of the flip card)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [showRegPassword, setShowRegPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // --- card tilt + spotlight state ---
    const cardRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
    const [spot, setSpot] = useState({ x: 50, y: 50, opacity: 0 });
    const [transitioning, setTransitioning] = useState(false);

    // --- page-level parallax for the globe backdrop, a second depth layer ---
    const [parallax, setParallax] = useState({ x: 0, y: 0 });

    function handlePageMove(e: React.MouseEvent<HTMLElement>) {
        const px = e.clientX / window.innerWidth - 0.5;
        const py = e.clientY / window.innerHeight - 0.5;
        setParallax({ x: px * 24, y: py * 24 });
    }

    function handleCardMove(e: React.MouseEvent<HTMLDivElement>) {
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width; // 0..1
        const py = (e.clientY - rect.top) / rect.height; // 0..1

        setTransitioning(false);
        // tilt: center is flat, edges tilt up to ~7deg
        setTilt({
            rx: (0.5 - py) * 14,
            ry: (px - 0.5) * 14,
        });
        setSpot({ x: px * 100, y: py * 100, opacity: 1 });
    }

    function handleCardLeave() {
        setTransitioning(true);
        setTilt({ rx: 0, ry: 0 });
        setSpot((s) => ({ ...s, opacity: 0 }));
    }

    function flipTo(target: boolean) {
        setIsLogin(target);
        setError("");
        setMessage("");
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            await loginUser({ email, password });
            setMessage("Login successful!");
            setTimeout(() => {
                window.location.href = "/";
            }, 700);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            await registerUser({ name: regName, email: regEmail, password: regPassword });
            setMessage("Registration successful! Please login.");
            setRegPassword("");
            flipTo(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            onMouseMove={handlePageMove}
            className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1120] px-4"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
            `}</style>

            {/* interactive globe background — drifts opposite the cursor for a parallax depth cue */}
            <div
                className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
                style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.05)` }}
            >
                <Globe
                    dot="#F6F8FB"
                    net="#FF3D8F"
                    density={14}
                    spin={6}
                    spinDir="right"
                    hoverOn={true}
                    sizePercent={150}
                    dots={{ size: 6, wobble: 6, flicker: 6 }}
                    cage={{ detail: 1, spread: 8, glow: 9 }}
                    shimmer={{ color: "#3DD9C4", speed: 7, style: "sweep", angle: 90, width: 7 }}
                    waves={{ color: "#FF7A45", color2: "#7C5CFF", size: 9, glow: 10, speed: 6 }}
                    hover={{ fill: 7, glow: 10, reach: 9 }}
                />
            </div>

            {/* dark vignette so the card stays readable over the globe */}
            <div
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                    background:
                        "radial-gradient(circle at center, transparent 0%, rgba(11,17,32,0.55) 55%, rgba(11,17,32,0.92) 100%)",
                }}
            />

            {/* perspective wrapper for the tilt + flip effect */}
            <div className="relative z-10 w-full max-w-sm" style={{ perspective: "1100px" }}>
                <div
                    ref={cardRef}
                    onMouseMove={handleCardMove}
                    onMouseLeave={handleCardLeave}
                    className="relative border border-[#25334A] bg-[#111B2E]/90 backdrop-blur-sm"
                    style={{
                        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                        transformStyle: "preserve-3d",
                        transition: transitioning
                            ? "transform 0.5s ease-out"
                            : "transform 0.08s ease-out",
                        boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6)",
                    }}
                >
                    {/* cursor-tracking spotlight */}
                    <div
                        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
                        style={{
                            opacity: spot.opacity * 0.5,
                            background: `radial-gradient(320px circle at ${spot.x}% ${spot.y}%, rgba(255,122,69,0.25), rgba(255,61,143,0.12) 40%, transparent 70%)`,
                        }}
                    />
                    {/* edge highlight that tracks the cursor */}
                    <div
                        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
                        style={{
                            opacity: spot.opacity,
                            background: `radial-gradient(200px circle at ${spot.x}% ${spot.y}%, rgba(61,217,196,0.15), transparent 60%)`,
                            mixBlendMode: "screen",
                        }}
                    />

                    <CornerTick position="tl" />
                    <CornerTick position="tr" />
                    <CornerTick position="bl" />
                    <CornerTick position="br" />

                    <div
                        className="h-[3px] w-full [transform:translateZ(20px)]"
                        style={{ background: "linear-gradient(90deg, #FF7A45, #FF3D8F, #7C5CFF)" }}
                    />

                    {/* the flip stage — front face is Login, back face is Register */}
                    <div
                        className="relative h-[540px]"
                        style={{
                            transformStyle: "preserve-3d",
                            transform: `rotateY(${isLogin ? 0 : 180}deg)`,
                            transition: "transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)",
                        }}
                    >
                        {/* FRONT — Login */}
                        <div
                            className="absolute inset-0 p-6"
                            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                            aria-hidden={!isLogin}
                        >
                            <div className="flex h-full flex-col">
                                <div className="[transform:translateZ(18px)]">
                                    <h1
                                        className="text-2xl font-bold text-[#F6F8FB]"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        Draftsman
                                    </h1>
                                    <p className="mt-1.5 text-sm text-[#8CA0B8]">
                                        Sign in to continue to your analyses.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleLogin}
                                    className="mt-6 flex flex-1 flex-col justify-center space-y-3"
                                >
                                    <Field id="email" label="Email">
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required={isLogin}
                                            tabIndex={isLogin ? 0 : -1}
                                            className={inputClass}
                                            placeholder="you@example.com"
                                        />
                                    </Field>

                                    <Field id="password" label="Password">
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required={isLogin}
                                                tabIndex={isLogin ? 0 : -1}
                                                minLength={8}
                                                className={`${inputClass} pr-14`}
                                                placeholder="Minimum 8 characters"
                                            />
                                            <button
                                                type="button"
                                                tabIndex={isLogin ? 0 : -1}
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#3DD9C4]"
                                            >
                                                {showPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </Field>

                                    {isLogin && error && (
                                        <div className="border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 px-3 py-2 [transform:translateZ(16px)]">
                                            <p className="text-xs font-medium text-[#FF9B9B]">{error}</p>
                                        </div>
                                    )}
                                    {isLogin && message && (
                                        <div className="border border-[#4ADE80]/30 bg-[#4ADE80]/10 px-3 py-2 [transform:translateZ(16px)]">
                                            <p className="text-xs font-medium text-[#7EEDA3]">{message}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        tabIndex={isLogin ? 0 : -1}
                                        className="w-full px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-300 [transform:translateZ(30px)] hover:[transform:translateZ(46px)] disabled:cursor-not-allowed disabled:opacity-40"
                                        style={{ background: "linear-gradient(90deg, #FF7A45, #FF3D8F)" }}
                                    >
                                        {loading ? "Please wait..." : "Login"}
                                    </button>
                                </form>

                                <div className="mt-5 text-center text-sm text-[#6C82A0] [transform:translateZ(16px)]">
                                    Don&apos;t have an account?
                                    <button
                                        type="button"
                                        tabIndex={isLogin ? 0 : -1}
                                        onClick={() => flipTo(false)}
                                        className="ml-2 font-semibold text-[#3DD9C4] underline underline-offset-2"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* BACK — Register */}
                        <div
                            className="absolute inset-0 p-6"
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                            }}
                            aria-hidden={isLogin}
                        >
                            <div className="flex h-full flex-col">
                                <div className="[transform:translateZ(18px)]">
                                    <h1
                                        className="text-2xl font-bold text-[#F6F8FB]"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        Draftsman
                                    </h1>
                                    <p className="mt-1.5 text-sm text-[#8CA0B8]">
                                        Create an account to get started.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleRegister}
                                    className="mt-6 flex flex-1 flex-col justify-center space-y-3"
                                >
                                    <Field id="reg-name" label="Name">
                                        <input
                                            id="reg-name"
                                            type="text"
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                            required={!isLogin}
                                            tabIndex={!isLogin ? 0 : -1}
                                            className={inputClass}
                                            placeholder="Your name"
                                        />
                                    </Field>

                                    <Field id="reg-email" label="Email">
                                        <input
                                            id="reg-email"
                                            type="email"
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            required={!isLogin}
                                            tabIndex={!isLogin ? 0 : -1}
                                            className={inputClass}
                                            placeholder="you@example.com"
                                        />
                                    </Field>

                                    <Field id="reg-password" label="Password">
                                        <div className="relative">
                                            <input
                                                id="reg-password"
                                                type={showRegPassword ? "text" : "password"}
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                required={!isLogin}
                                                tabIndex={!isLogin ? 0 : -1}
                                                minLength={8}
                                                className={`${inputClass} pr-14`}
                                                placeholder="Minimum 8 characters"
                                            />
                                            <button
                                                type="button"
                                                tabIndex={!isLogin ? 0 : -1}
                                                onClick={() => setShowRegPassword(!showRegPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#3DD9C4]"
                                            >
                                                {showRegPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </Field>

                                    {!isLogin && error && (
                                        <div className="border border-[#FF6B6B]/30 bg-[#FF6B6B]/10 px-3 py-2 [transform:translateZ(16px)]">
                                            <p className="text-xs font-medium text-[#FF9B9B]">{error}</p>
                                        </div>
                                    )}
                                    {!isLogin && message && (
                                        <div className="border border-[#4ADE80]/30 bg-[#4ADE80]/10 px-3 py-2 [transform:translateZ(16px)]">
                                            <p className="text-xs font-medium text-[#7EEDA3]">{message}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        tabIndex={!isLogin ? 0 : -1}
                                        className="w-full px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-300 [transform:translateZ(30px)] hover:[transform:translateZ(46px)] disabled:cursor-not-allowed disabled:opacity-40"
                                        style={{ background: "linear-gradient(90deg, #FF7A45, #FF3D8F)" }}
                                    >
                                        {loading ? "Please wait..." : "Create account"}
                                    </button>
                                </form>

                                <div className="mt-5 text-center text-sm text-[#6C82A0] [transform:translateZ(16px)]">
                                    Already have an account?
                                    <button
                                        type="button"
                                        tabIndex={!isLogin ? 0 : -1}
                                        onClick={() => flipTo(true)}
                                        className="ml-2 font-semibold text-[#3DD9C4] underline underline-offset-2"
                                    >
                                        Login
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}