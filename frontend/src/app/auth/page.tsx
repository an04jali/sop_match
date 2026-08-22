"use client";

import { useState } from "react";
import { loginUser, registerUser } from "@/services/auth";

function Frame({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`relative border border-[#DCE6EE] bg-[#FBFBF8] ${className}`}>
            <span className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-[#2E6F9E]" />
            <span className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-[#2E6F9E]" />
            <span className="absolute -left-px -bottom-px h-3 w-3 border-l-2 border-b-2 border-[#2E6F9E]" />
            <span className="absolute -right-px -bottom-px h-3 w-3 border-r-2 border-b-2 border-[#2E6F9E]" />
            <div className="p-8">{children}</div>
        </div>
    );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2E6F9E]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
            {children}
        </p>
    );
}

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {
            if (isLogin) {
                await loginUser({ email, password });

                setMessage("Login successful!");

                setTimeout(() => {
                    window.location.href = "/";
                }, 700);
            } else {
                await registerUser({ name, email, password });

                setMessage("Registration successful! Please login.");

                setIsLogin(true);
                setPassword("");
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            className="flex min-h-screen items-center justify-center bg-[#FBFBF8] px-4"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
            `}</style>

            <div className="w-full max-w-md">
                <Frame>
                    <Eyebrow>
                        {isLogin ? "Sign In" : "Create Account"}
                    </Eyebrow>

                    <h1
                        className="mt-2 text-3xl font-bold text-[#132A3A]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Draftsman
                    </h1>

                    <p className="mt-2 text-[#5C7080]">
                        {isLogin
                            ? "Login to continue to your analyses."
                            : "Create your account to get started."}
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4">

                        {!isLogin && (
                            <div>
                                <label
                                    htmlFor="name"
                                    className="text-[10px] uppercase tracking-[0.14em] text-[#8CA0AF]"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="mt-1 w-full border border-[#DCE6EE] bg-[#FBFBF8] px-3 py-2.5 text-sm text-[#132A3A] outline-none focus:border-[#2E6F9E]"
                                    placeholder="Your name"
                                />
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="text-[10px] uppercase tracking-[0.14em] text-[#8CA0AF]"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 w-full border border-[#DCE6EE] bg-[#FBFBF8] px-3 py-2.5 text-sm text-[#132A3A] outline-none focus:border-[#2E6F9E]"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="text-[10px] uppercase tracking-[0.14em] text-[#8CA0AF]"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full border border-[#DCE6EE] bg-[#FBFBF8] px-3 py-2.5 pr-16 text-sm text-[#132A3A] outline-none focus:border-[#2E6F9E]"
                                    placeholder="Minimum 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-[#2E6F9E]"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="border border-[#C2792E]/40 bg-[#C2792E]/5 p-3">
                                <p
                                    className="text-sm font-medium text-[#C2792E]"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    {error}
                                </p>
                            </div>
                        )}

                        {message && (
                            <div className="border border-[#3E7A57]/40 bg-[#3E7A57]/5 p-3">
                                <p
                                    className="text-sm font-medium text-[#3E7A57]"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    {message}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#132A3A] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#FBFBF8] transition-colors hover:bg-[#2E6F9E] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {loading
                                ? "Please wait..."
                                : isLogin
                                ? "Login"
                                : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-[#5C7080]">
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}

                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                                setMessage("");
                            }}
                            className="ml-2 font-semibold text-[#2E6F9E] underline"
                        >
                            {isLogin ? "Register" : "Login"}
                        </button>
                    </div>
                </Frame>
            </div>
        </main>
    );
}