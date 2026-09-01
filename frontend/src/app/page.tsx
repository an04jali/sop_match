"use client";

import UploadBox from "@/components/upload/UploadBox";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import LogoutButton from "@/components/upload/LogoutButton";
import Globe from "@/components/Globe";

export default function Home() {
    const { checkingAuth } = useRequireAuth();

    if (checkingAuth) {
        return (
            <main
                className="flex min-h-screen items-center justify-center bg-[#0B1120]"
                style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}
            >
                <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin border-2 border-[#25334A] border-t-[#3DD9C4]" />
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#6C82A0]">
                        Checking session...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main
            className="relative min-h-screen overflow-hidden bg-[#0B1120] px-4 py-6 sm:px-6 lg:px-10"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}
        >
            {/* Background grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.16]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(61,217,196,0.08) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(61,217,196,0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Ambient animated globe — brand colours, matching the corner-tick motif */}
            <div className="pointer-events-none absolute inset-0 opacity-70">
                <Globe
                    dot="#3DD9C4"
                    net="#7C5CFF"
                    density={14}
                    spin={6}
                    spinDir="right"
                    hoverOn={false}
                    sizePercent={170}
                    dots={{ size: 6, wobble: 5, flicker: 6 }}
                    cage={{ detail: 1, spread: 9, glow: 11 }}
                    shimmer={{ color: "#FF3D8F", speed: 6, style: "sweep", angle: 100, width: 9 }}
                    waves={{ color: "#FF7A45", color2: "#FF3D8F", size: 10, glow: 11, speed: 5 }}
                    hover={{ fill: 4, glow: 8, reach: 9 }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl">

                {/* HEADER */}
                <header className="mb-8 flex items-center justify-between border-b border-[#25334A] pb-5">

                    <div className="flex items-center gap-4">

                        {/* Logo mark */}
                        <div className="relative flex h-10 w-10 items-center justify-center border border-[#25334A] bg-[#111B2E]">
                            <span className="absolute -left-px -top-px h-2.5 w-2.5 border-l-2 border-t-2 border-[#3DD9C4]" />
                            <span className="absolute -right-px -top-px h-2.5 w-2.5 border-r-2 border-t-2 border-[#FF3D8F]" />
                            <span className="absolute -bottom-px -left-px h-2.5 w-2.5 border-b-2 border-l-2 border-[#FF7A45]" />
                            <span className="absolute -bottom-px -right-px h-2.5 w-2.5 border-b-2 border-r-2 border-[#7C5CFF]" />

                            <span
                                className="text-lg font-bold text-[#F6F8FB]"
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                }}
                            >
                                D
                            </span>
                        </div>

                        <div>
                            <h1
                                className="text-xl font-bold tracking-tight text-[#F6F8FB] sm:text-2xl"
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                }}
                            >
                                Draftsman
                            </h1>

                            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#6C82A0] sm:text-[10px]">
                                SOP Intelligence System
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <LogoutButton />
                    </div>
                </header>

                {/* HERO */}
                <section className="mb-8">

                    <div className="mb-3 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-[#3DD9C4]" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3DD9C4]">
                            Analysis Workspace
                        </span>
                    </div>

                    <h2
                        className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-[#F6F8FB] sm:text-4xl lg:text-5xl"
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                        }}
                    >
                        Turn your SOP into a{" "}
                        <span
                            style={{
                                background:
                                    "linear-gradient(90deg, #FF7A45, #FF3D8F, #7C5CFF)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            stronger application.
                        </span>
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-[#8CA0B8] sm:text-base">
                        Upload your Statement of Purpose and get structured
                        AI feedback across clarity, specificity, motivation,
                        programme fit, academic readiness, career vision,
                        and writing quality.
                    </p>
                </section>

                {/* STATUS BAR */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-[#25334A] bg-[#111B2E]/80 px-4 py-3">

                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping bg-[#3DD9C4] opacity-60" />
                            <span className="relative inline-flex h-2 w-2 bg-[#3DD9C4]" />
                        </span>

                        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8CA0B8]">
                            AI analysis engine ready
                        </span>
                    </div>

                    <span className="font-mono text-[10px] text-[#6C82A0]">
                        07 DIMENSIONS
                    </span>
                </div>

                {/* WORKSPACE */}
                <section className="relative border border-[#25334A] bg-[#111B2E]/75 backdrop-blur-sm">

                    {/* top gradient */}
                    <div
                        className="h-[3px] w-full"
                        style={{
                            background:
                                "linear-gradient(90deg, #FF7A45, #FF3D8F, #7C5CFF)",
                        }}
                    />

                    {/* corner ticks */}
                    <span className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#3DD9C4]" />
                    <span className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#FF3D8F]" />
                    <span className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#FF7A45]" />
                    <span className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#7C5CFF]" />

                    <div className="p-4 sm:p-6 lg:p-8">
                        <UploadBox />
                    </div>
                </section>

                {/* FOOTER INFO */}
                <footer className="mt-5 flex flex-col justify-between gap-2 border-t border-[#25334A] pt-4 text-[10px] sm:flex-row">
                    <span className="font-mono uppercase tracking-[0.15em] text-[#4D5F78]">
                        Draftsman / Workspace
                    </span>

                    <span className="font-mono text-[#4D5F78]">
                        PDF • DOCX / AI EVALUATION
                    </span>
                </footer>

            </div>
        </main>
    );
}