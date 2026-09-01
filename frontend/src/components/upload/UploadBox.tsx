"use client";

import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import { analyzeSOP, improveSOP, improveFullSOP, getHistory, getHistoryItem } from "../../services/api";

const LOADING_STAGES = [
    "Reading your SOP...",
    "Extracting structure...",
    "Scoring clarity...",
    "Scoring specificity...",
    "Scoring motivation...",
    "Scoring programme fit...",
    "Scoring academic readiness...",
    "Scoring career vision...",
    "Scoring writing quality...",
    "Compiling final report...",
];

const DIMENSION_ORDER = [
    "clarity",
    "specificity",
    "motivation",
    "programme_fit",
    "academic_readiness",
    "career_vision",
    "writing_quality",
];

function formatLabel(key: string) {
    return key
        .replaceAll("_", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Corner-tick card — same motif as the workspace panel and logo mark. */
function Frame({
    children,
    className = "",
    contentClassName = "p-6",
}: {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
}) {
    return (
        <div className={`relative border border-[#25334A] bg-[#111B2E]/80 backdrop-blur-sm ${className}`}>
            <span className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-[#3DD9C4]" />
            <span className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-[#FF3D8F]" />
            <span className="absolute -left-px -bottom-px h-3 w-3 border-l-2 border-b-2 border-[#FF7A45]" />
            <span className="absolute -right-px -bottom-px h-3 w-3 border-r-2 border-b-2 border-[#7C5CFF]" />
            <div className={contentClassName}>{children}</div>
        </div>
    );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3DD9C4]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
            {children}
        </p>
    );
}

/** Ruler-style score meter — 1..5 tick marks with a fill and a pin at the score. */
function ScoreRuler({
    score,
    failed,
    weakest,
}: {
    score: number | null | undefined;
    failed?: boolean;
    weakest?: boolean;
}) {
    const clamped = typeof score === "number" ? Math.min(5, Math.max(0, score)) : 0;
    const pct = (clamped / 5) * 100;
    const fillColor = failed || weakest ? "#FF3D8F" : "#3DD9C4";

    return (
        <div className="mt-3">
            <div className="relative h-2 w-full bg-[#0B1120]">
                <div
                    className="absolute inset-y-0 left-0 transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: fillColor }}
                />
                {/* tick marks at 1-5 */}
                {[1, 2, 3, 4, 5].map((tick) => (
                    <div
                        key={tick}
                        className="absolute top-0 h-2 w-px bg-[#111B2E]/70"
                        style={{ left: `${(tick / 5) * 100}%` }}
                    />
                ))}
                {/* pin marker at score */}
                {!failed && typeof score === "number" && (
                    <div
                        className="absolute -top-1.5 h-5 w-0.5"
                        style={{ left: `${pct}%`, backgroundColor: fillColor }}
                    />
                )}
            </div>
            <div
                className="mt-1 flex justify-between text-[10px] text-[#6C82A0]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
            </div>
        </div>
    );
}

export default function UploadBox() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [stageIndex, setStageIndex] = useState(0);

    const [improving, setImproving] = useState(false);
    const [improveResult, setImproveResult] = useState<any>(null);
    const [improveError, setImproveError] = useState("");
    const [university, setUniversity] = useState("");
    const [program, setProgram] = useState("");
    const [replaced, setReplaced] = useState(false);
    const [originalParagraphSnapshot, setOriginalParagraphSnapshot] = useState("");

    const [improvingFull, setImprovingFull] = useState(false);
    const [fullImproveResult, setFullImproveResult] = useState<any>(null);
    const [fullImproveError, setFullImproveError] = useState("");

    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (loading) {
            setStageIndex(0);

            intervalRef.current = setInterval(() => {
                setStageIndex((prev) => {
                    if (prev < LOADING_STAGES.length - 1) {
                        return prev + 1;
                    }
                    return prev;
                });
            }, 2000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [loading]);

    async function handleAnalyze() {
        if (!file) {
            setError("Please select a PDF or DOCX file.");
            return;
        }

        setError("");
        setResult(null);
        setImproveResult(null);
        setImproveError("");
        setLoading(true);

        try {
            const data = await analyzeSOP(file, university, program);

            console.log("ANALYSIS RESULT:", data);

            setResult(data);
        } catch (err: any) {
            console.error(err);

            setError(
                err?.message ||
                "Something went wrong while analyzing the SOP."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleImprove() {
        if (!result?.weakest_paragraph || !result?.essay) {
            setImproveError("No weakest paragraph available to improve.");
            return;
        }

        const weakDimensionResult =
            result.dimensions?.[result.weakest_dimension];

        const originalText =
            result.weakest_paragraph.paragraph ??
            result.weakest_paragraph.text ??
            "";

        setOriginalParagraphSnapshot(originalText);
        setImproveError("");
        setImproveResult(null);
        setReplaced(false);
        setImproving(true);

        try {
            const data = await improveSOP({
                essay: result.essay,
                weakest_dimension: result.weakest_dimension,
                weakest_paragraph: originalText,
                evidence: weakDimensionResult?.evidence ?? [],
                reason: weakDimensionResult?.reason ?? "",
                university: university,
                program: program,
                analysis_id: result.id ?? null,
            });

            console.log("IMPROVE RESULT:", data);

            if (data?.error) {
                setImproveError(data.error);
            } else {
                setImproveResult(data);
            }
        } catch (err: any) {
            console.error(err);

            setImproveError(
                err?.message ||
                "Something went wrong while improving the paragraph."
            );
        } finally {
            setImproving(false);
        }
    }

    async function handleImproveFull() {
        if (!result?.essay) {
            setFullImproveError("No essay text available to improve.");
            return;
        }

        setFullImproveError("");
        setFullImproveResult(null);
        setImprovingFull(true);

        try {
            const data = await improveFullSOP({
                essay: result.essay,
                university: university,
                program: program,
                analysis_id: result.id ?? null,
            });

            console.log("FULL IMPROVE RESULT:", data);

            if (data?.error) {
                setFullImproveError(data.error);
            } else {
                setFullImproveResult(data);
            }
        } catch (err: any) {
            console.error(err);

            setFullImproveError(
                err?.message ||
                "Something went wrong while improving the full SOP."
            );
        } finally {
            setImprovingFull(false);
        }
    }

    async function handleCopyFullEssay() {
        const essay = fullImproveResult?.improved_essay ?? "";
        if (!essay) return;
        await navigator.clipboard.writeText(essay);
    }

    async function handleCopyParagraph() {
        const paragraph =
            improveResult?.improved_paragraph ??
            improveResult?.rewritten_paragraph ??
            improveResult?.rewrite ??
            "";

        if (!paragraph) return;

        await navigator.clipboard.writeText(paragraph);
    }

    function handleReplaceParagraph() {
        const paragraph =
            improveResult?.improved_paragraph ??
            improveResult?.rewritten_paragraph ??
            improveResult?.rewrite ??
            "";

        if (!paragraph || !result?.weakest_paragraph) return;

        setResult((prev: any) => ({
            ...prev,
            weakest_paragraph: {
                ...prev.weakest_paragraph,
                paragraph: paragraph,
                text: paragraph,
            },
        }));

        setReplaced(true);
    }

    async function handleToggleHistory() {
        const opening = !historyOpen;
        setHistoryOpen(opening);

        if (opening) {
            setHistoryLoading(true);
            try {
                const items = await getHistory();
                setHistoryItems(items);
            } catch (err) {
                console.error(err);
            } finally {
                setHistoryLoading(false);
            }
        }
    }

    async function handleSelectHistory(id: number) {
        try {
            const record = await getHistoryItem(id);

            if (record.analysis) {
                setResult({ ...record.analysis, id: record.id });
            }
            if (record.improvement) {
                setImproveResult(record.improvement);
            } else {
                setImproveResult(null);
            }
            if (record.full_improvement) {
                setFullImproveResult(record.full_improvement);
            } else {
                setFullImproveResult(null);
            }

            setUniversity(record.university ?? "");
            setProgram(record.program ?? "");
            setHistoryOpen(false);
        } catch (err) {
            console.error(err);
        }
    }

    function handleDownloadReport() {
        if (!result) return;

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 48;
        const maxWidth = pageWidth - margin * 2;

        let y = margin;

        function ensureSpace(height: number) {
            if (y + height > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        }

        function addHeading(text: string, size = 14) {
            ensureSpace(size + 16);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(size);
            doc.setTextColor(19, 42, 58);
            doc.text(text, margin, y);
            y += size + 10;
        }

        function addLabel(text: string) {
            ensureSpace(14);
            doc.setFont("courier", "bold");
            doc.setFontSize(8);
            doc.setTextColor(46, 111, 158);
            doc.text(text.toUpperCase(), margin, y);
            y += 14;
        }

        function addBody(text: string, size = 10) {
            if (!text) return;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(size);
            doc.setTextColor(92, 112, 128);
            const lines = doc.splitTextToSize(text, maxWidth);
            for (const line of lines) {
                ensureSpace(size + 4);
                doc.text(line, margin, y);
                y += size + 4;
            }
            y += 6;
        }

        function addDivider() {
            ensureSpace(16);
            doc.setDrawColor(220, 230, 238);
            doc.line(margin, y, pageWidth - margin, y);
            y += 16;
        }

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(19, 42, 58);
        doc.text("Draftsman — SOP Analysis Report", margin, y);
        y += 20;

        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.setTextColor(140, 160, 175);
        doc.text(
            `${result.filename ?? "SOP"}  ·  ${new Date().toLocaleDateString()}`,
            margin,
            y
        );
        y += 24;

        addDivider();

        // Summary
        addHeading("Summary");
        addBody(
            `Overall Score: ${result.overall_score ?? "N/A"} / 5`
        );
        addBody(
            `Weakest Dimension: ${
                result.weakest_dimension
                    ? formatLabel(result.weakest_dimension)
                    : "N/A"
            }`
        );
        addBody(`Word Count: ${result.structural?.words ?? "N/A"}`);

        addDivider();

        // Dimension Scores
        addHeading("Dimension Scores");
        DIMENSION_ORDER.filter((key) => result.dimensions?.[key]).forEach(
            (key) => {
                const value = result.dimensions[key];
                addLabel(
                    `${formatLabel(key)} — ${value?.score ?? "N/A"}/5`
                );
                if (value?.reason) {
                    addBody(value.reason);
                }
            }
        );

        addDivider();

        // Structural Analysis
        if (result.structural) {
            addHeading("Structural Analysis");
            const fields: [string, any][] = [
                ["Words", result.structural.words],
                ["Paragraphs", result.structural.paragraphs],
                ["Sentences", result.structural.sentences],
                ["Reading Time", result.structural.reading_time],
                ["Avg. Sentence Length", result.structural.average_sentence_length],
                ["Opening Strength", result.structural.opening_strength],
                ["Closing Strength", result.structural.closing_strength],
                ["Paragraph Balance", result.structural.paragraph_balance],
            ];
            fields
                .filter(([, v]) => v !== undefined && v !== null)
                .forEach(([label, value]) => {
                    addBody(`${label}: ${value}`);
                });

            addDivider();
        }

        // Weakest Paragraph
        if (result.weakest_paragraph) {
            addHeading("Weakest Paragraph");
            addLabel(
                `Paragraph ${
                    result.weakest_paragraph.paragraph_number ??
                    result.weakest_paragraph.number ??
                    result.weakest_paragraph.index ??
                    "?"
                }`
            );
            addBody(
                result.weakest_paragraph.text ??
                    result.weakest_paragraph.paragraph ??
                    ""
            );
            if (result.weakest_paragraph.evidence) {
                addLabel("Evidence");
                addBody(`"${result.weakest_paragraph.evidence}"`);
            }

            addDivider();
        }

        // AI Improvement
        if (improveResult) {
            addHeading("AI Suggested Improvement");

            if (improveResult.problem) {
                addLabel("Problem");
                addBody(improveResult.problem);
            }
            if (improveResult.why_weak) {
                addLabel("Why Weak");
                addBody(improveResult.why_weak);
            }
            if (Array.isArray(improveResult.suggestions)) {
                addLabel("Suggestions");
                improveResult.suggestions.forEach((s: string) => {
                    addBody(`• ${s}`);
                });
            }

            const improved =
                improveResult.improved_paragraph ??
                improveResult.rewritten_paragraph ??
                improveResult.rewrite;

            if (improved) {
                addDivider();
                addHeading("Before / After", 12);
                addLabel("Before");
                addBody(originalParagraphSnapshot);
                addLabel("After");
                addBody(improved);
            }
        }

        const safeName = (result.filename ?? "sop")
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-z0-9]+/gi, "_");

        doc.save(`draftsman_report_${safeName}.pdf`);
    }

    const orderedDimensionEntries = result?.dimensions
        ? DIMENSION_ORDER
            .filter((key) => key in result.dimensions)
            .map((key) => [key, result.dimensions[key]] as [string, any])
        : [];

    return (
        <div
            className="space-y-6"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}
        >
            {/* History Toggle */}
            <div className="flex justify-end">
                <button
                    onClick={handleToggleHistory}
                    className="border border-[#3DD9C4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#3DD9C4] transition-colors hover:bg-[#3DD9C4] hover:text-[#0B1120]"
                >
                    {historyOpen ? "Close History" : "My Analyses"}
                </button>
            </div>

            {historyOpen && (
                <Frame>
                    <Eyebrow>History</Eyebrow>
                    <h3
                        className="mt-2 text-xl font-bold text-[#F6F8FB]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        My Analyses
                    </h3>

                    {historyLoading && (
                        <p className="mt-4 text-sm text-[#6C82A0]">Loading...</p>
                    )}

                    {!historyLoading && historyItems.length === 0 && (
                        <p className="mt-4 text-sm text-[#6C82A0]">
                            No analyses saved yet.
                        </p>
                    )}

                    {!historyLoading && historyItems.length > 0 && (
                        <div className="mt-4 divide-y divide-[#25334A]">
                            {historyItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectHistory(item.id)}
                                    className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-white/5"
                                >
                                    <div>
                                        <p className="font-semibold text-[#F6F8FB]">
                                            {item.filename ?? "Untitled SOP"}
                                        </p>
                                        <p
                                            className="mt-1 text-xs text-[#6C82A0]"
                                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                        >
                                            {[item.university, item.program]
                                                .filter(Boolean)
                                                .join(" · ") || "No target specified"}
                                            {item.created_at &&
                                                ` · ${new Date(item.created_at).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className="text-lg font-bold text-[#F6F8FB]"
                                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                        >
                                            {item.overall_score ?? "N/A"}
                                            <span className="text-xs font-normal text-[#6C82A0]">
                                                /5
                                            </span>
                                        </p>
                                        <p
                                            className="text-[10px] uppercase tracking-wider text-[#FF3D8F]"
                                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                        >
                                            {item.weakest_dimension
                                                ? formatLabel(item.weakest_dimension)
                                                : "N/A"}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Frame>
            )}

            {/* Upload Box */}
            <Frame contentClassName="p-0">
                <div className="p-10 text-center">
                    <Eyebrow>Step 01 — Upload</Eyebrow>

                    <h2
                        className="mt-2 text-2xl font-bold text-[#F6F8FB]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Upload your SOP
                    </h2>

                    <p className="mt-2 text-[#8CA0B8]">
                        Upload a PDF or DOCX file for AI analysis.
                    </p>

                    <div className="mx-auto mt-6 grid max-w-md grid-cols-1 gap-4 text-left sm:grid-cols-2">
                        <div>
                            <label
                                className="text-[10px] uppercase tracking-[0.14em] text-[#6C82A0]"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                                University
                            </label>
                            <input
                                type="text"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                placeholder="e.g. Stanford University"
                                className="mt-1 w-full border border-[#25334A] bg-[#0B1120]/60 px-3 py-2 text-sm text-[#F6F8FB] outline-none placeholder:text-[#4D5F78] focus:border-[#3DD9C4]"
                            />
                        </div>
                        <div>
                            <label
                                className="text-[10px] uppercase tracking-[0.14em] text-[#6C82A0]"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                                Program
                            </label>
                            <input
                                type="text"
                                value={program}
                                onChange={(e) => setProgram(e.target.value)}
                                placeholder="e.g. MS Computer Science"
                                className="mt-1 w-full border border-[#25334A] bg-[#0B1120]/60 px-3 py-2 text-sm text-[#F6F8FB] outline-none placeholder:text-[#4D5F78] focus:border-[#3DD9C4]"
                            />
                        </div>
                    </div>

                    <label className="mt-8 inline-flex cursor-pointer flex-col items-center gap-3 border border-dashed border-[#3DD9C4]/40 px-10 py-8 transition-colors hover:border-[#3DD9C4]">
                        <span className="text-sm font-medium text-[#3DD9C4]">
                            Choose file
                        </span>
                        <input
                            type="file"
                            accept=".pdf,.docx"
                            disabled={loading}
                            className="hidden"
                            onChange={(e) => {
                                const selectedFile =
                                    e.target.files?.[0] || null;

                                setFile(selectedFile);
                                setResult(null);
                                setError("");
                            }}
                        />
                    </label>

                    {file && (
                        <p
                            className="mt-4 text-sm text-[#8CA0B8]"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                            Selected: <span className="text-[#F6F8FB]">{file.name}</span>
                        </p>
                    )}
                </div>
            </Frame>


            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="w-full px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                style={{ background: "linear-gradient(90deg, #FF7A45, #FF3D8F, #7C5CFF)" }}
            >
                {loading ? "Analyzing..." : "Analyze SOP"}
            </button>


            {/* Loading Progress */}
            {loading && (
                <Frame>
                    <Eyebrow>Processing</Eyebrow>

                    <div className="mt-3 flex items-center gap-3">
                        <div className="h-4 w-4 animate-spin border-2 border-[#3DD9C4] border-t-transparent" />
                        <p className="font-medium text-[#F6F8FB]">
                            {LOADING_STAGES[stageIndex]}
                        </p>
                    </div>

                    <div className="mt-4 h-1.5 w-full overflow-hidden bg-[#0B1120]">
                        <div
                            className="h-full transition-all duration-500"
                            style={{
                                width: `${((stageIndex + 1) / LOADING_STAGES.length) * 100}%`,
                                background: "linear-gradient(90deg, #3DD9C4, #7C5CFF)",
                            }}
                        />
                    </div>

                    <p
                        className="mt-3 text-xs text-[#6C82A0]"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                        This can take up to a minute depending on SOP length.
                    </p>
                </Frame>
            )}


            {/* Error */}
            {error && (
                <div className="border border-[#FF3D8F]/40 bg-[#FF3D8F]/10 p-4">
                    <p
                        className="text-sm font-medium text-[#FF3D8F]"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                        {error}
                    </p>
                </div>
            )}


            {/* Result */}
            {result && (
                <div className="space-y-6">

                    {/* ================= HEADER SUMMARY ================= */}
                    <Frame>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <Eyebrow>Report</Eyebrow>
                                <h2
                                    className="mt-2 text-2xl font-bold text-[#F6F8FB]"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    Analysis Complete
                                </h2>
                            </div>

                            <button
                                onClick={handleDownloadReport}
                                className="border border-[#3DD9C4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#3DD9C4] transition-colors hover:bg-[#3DD9C4] hover:text-[#0B1120]"
                            >
                                Download Report
                            </button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-px bg-[#25334A] sm:grid-cols-3">

                            <div className="bg-[#111B2E] p-4">
                                <p
                                    className="text-[10px] uppercase tracking-[0.14em] text-[#6C82A0]"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    Overall Score
                                </p>
                                <p
                                    className="mt-1 text-3xl font-bold text-[#F6F8FB]"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {result.overall_score ?? "N/A"}
                                    <span className="text-base font-normal text-[#6C82A0]">
                                        {" "}/ 5
                                    </span>
                                </p>
                            </div>

                            <div className="bg-[#111B2E] p-4">
                                <p
                                    className="text-[10px] uppercase tracking-[0.14em] text-[#6C82A0]"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    Weakest Dimension
                                </p>
                                <p
                                    className="mt-1 text-xl font-bold text-[#FF3D8F]"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {result.weakest_dimension
                                        ? formatLabel(result.weakest_dimension)
                                        : "N/A"}
                                </p>
                            </div>

                            <div className="bg-[#111B2E] p-4">
                                <p
                                    className="text-[10px] uppercase tracking-[0.14em] text-[#6C82A0]"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    Word Count
                                </p>
                                <p
                                    className="mt-1 text-3xl font-bold text-[#F6F8FB]"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {result.structural?.words ?? "N/A"}
                                </p>
                            </div>

                        </div>
                    </Frame>


                    {/* ================= DIMENSION SCORES ================= */}
                    {orderedDimensionEntries.length > 0 && (
                        <Frame>
                            <Eyebrow>Measurements</Eyebrow>
                            <h3
                                className="mt-2 text-xl font-bold text-[#F6F8FB]"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                Dimension Scores
                            </h3>

                            <div className="mt-5 divide-y divide-[#25334A]">

                                {orderedDimensionEntries.map(
                                    ([dimension, value]) => {
                                        const failed =
                                            value?.score === null ||
                                            value?.score === undefined;
                                        const isWeakest =
                                            dimension === result.weakest_dimension;

                                        return (
                                            <div
                                                key={dimension}
                                                className="py-4 first:pt-0 last:pb-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p
                                                        className="font-semibold text-[#F6F8FB]"
                                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                                    >
                                                        {formatLabel(dimension)}
                                                        {isWeakest && !failed && (
                                                            <span
                                                                className="ml-2 border border-[#FF3D8F]/40 bg-[#FF3D8F]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#FF3D8F]"
                                                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                                            >
                                                                Weakest
                                                            </span>
                                                        )}
                                                    </p>
                                                    <span
                                                        className="text-sm font-semibold text-[#F6F8FB]"
                                                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                                    >
                                                        {failed ? "N/A" : `${value.score}/5`}
                                                    </span>
                                                </div>

                                                <ScoreRuler
                                                    score={value?.score}
                                                    failed={failed}
                                                    weakest={isWeakest}
                                                />

                                                {value?.reason && (
                                                    <p className="mt-2 text-sm text-[#8CA0B8]">
                                                        {value.reason}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        </Frame>
                    )}


                    {/* ================= STRUCTURAL ANALYSIS ================= */}
                    {result.structural && (
                        <Frame>
                            <Eyebrow>Specification</Eyebrow>
                            <h3
                                className="mt-2 text-xl font-bold text-[#F6F8FB]"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                Structural Analysis
                            </h3>

                            <div className="mt-5 grid grid-cols-2 gap-px bg-[#25334A] sm:grid-cols-3">

                                {[
                                    ["Words", result.structural.words],
                                    ["Paragraphs", result.structural.paragraphs],
                                    ["Sentences", result.structural.sentences],
                                    ["Reading Time", result.structural.reading_time],
                                    ["Avg. Sentence Length", result.structural.average_sentence_length],
                                    ["Opening Strength", result.structural.opening_strength],
                                    ["Closing Strength", result.structural.closing_strength],
                                    ["Paragraph Balance", result.structural.paragraph_balance],
                                ]
                                    .filter(([, v]) => v !== undefined && v !== null)
                                    .map(([label, value]) => (
                                        <div key={label as string} className="bg-[#111B2E] p-4">
                                            <p
                                                className="text-[10px] uppercase tracking-[0.14em] text-[#6C82A0]"
                                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                            >
                                                {label}
                                            </p>
                                            <p className="mt-1 font-semibold text-[#F6F8FB]">
                                                {value as any}
                                            </p>
                                        </div>
                                    ))}

                            </div>
                        </Frame>
                    )}


                    {/* ================= WEAKEST PARAGRAPH ================= */}
                    {result.weakest_paragraph && (
                        <Frame>
                            <Eyebrow>Flagged Section</Eyebrow>
                            <h3
                                className="mt-2 text-xl font-bold text-[#F6F8FB]"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                Weakest Paragraph
                            </h3>

                            <p
                                className="mt-2 text-sm font-semibold text-[#3DD9C4]"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                                Paragraph{" "}
                                {result.weakest_paragraph.paragraph_number ??
                                    result.weakest_paragraph.number ??
                                    result.weakest_paragraph.index ??
                                    "?"}
                            </p>

                            {(result.weakest_paragraph.text ?? result.weakest_paragraph.paragraph) && (
                                <p className="mt-2 text-[#8CA0B8]">
                                    {result.weakest_paragraph.text ?? result.weakest_paragraph.paragraph}
                                </p>
                            )}

                            {result.weakest_paragraph.evidence && (
                                <div className="mt-5 border-l-2 border-[#FF3D8F] bg-[#FF3D8F]/10 py-3 pl-4">
                                    <p
                                        className="text-[10px] uppercase tracking-[0.14em] text-[#FF3D8F]"
                                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                    >
                                        Evidence
                                    </p>
                                    <p className="mt-1 italic text-[#8CA0B8]">
                                        "{result.weakest_paragraph.evidence}"
                                    </p>
                                </div>
                            )}

                            {/* Improve Button */}
                            <button
                                onClick={handleImprove}
                                disabled={improving}
                                className="mt-5 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                style={{ background: "linear-gradient(90deg, #FF3D8F, #7C5CFF)" }}
                            >
                                {improving ? "Improving..." : "Improve this paragraph"}
                            </button>

                            {improveError && (
                                <div className="mt-4 border border-[#FF3D8F]/40 bg-[#FF3D8F]/10 p-3">
                                    <p
                                        className="text-sm font-medium text-[#FF3D8F]"
                                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                    >
                                        {improveError}
                                    </p>
                                </div>
                            )}

                            {improveResult && (
                                <div className="mt-6 border-t border-[#25334A] pt-5">

                                    {improveResult.problem && (
                                        <div className="mt-2">
                                            <p
                                                className="text-[10px] uppercase tracking-[0.14em] text-[#FF3D8F]"
                                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                            >
                                                Problem
                                            </p>
                                            <p className="mt-2 text-[#8CA0B8]">
                                                {improveResult.problem}
                                            </p>
                                        </div>
                                    )}

                                    {improveResult.why_weak && (
                                        <div className="mt-5">
                                            <p
                                                className="text-[10px] uppercase tracking-[0.14em] text-[#FF3D8F]"
                                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                            >
                                                Why Weak
                                            </p>
                                            <p className="mt-2 text-[#8CA0B8]">
                                                {improveResult.why_weak}
                                            </p>
                                        </div>
                                    )}

                                    {Array.isArray(improveResult.suggestions) &&
                                        improveResult.suggestions.length > 0 && (
                                            <div className="mt-5">
                                                <p
                                                    className="text-[10px] uppercase tracking-[0.14em] text-[#FF3D8F]"
                                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                                >
                                                    Suggestions
                                                </p>
                                                <ul className="mt-2 list-disc space-y-2 pl-5 text-[#8CA0B8]">
                                                    {improveResult.suggestions.map(
                                                        (suggestion: string, i: number) => (
                                                            <li key={i}>{suggestion}</li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                    {(improveResult.improved_paragraph ??
                                        improveResult.rewritten_paragraph ??
                                        improveResult.rewrite) && (
                                        <div className="mt-6 border-l-2 border-[#3DD9C4] bg-white/5 p-5">
                                            <div className="flex items-center justify-between gap-4">
                                                <p
                                                    className="text-[10px] uppercase tracking-[0.14em] text-[#3DD9C4]"
                                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                                >
                                                    Improved Paragraph
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleCopyParagraph}
                                                        className="border border-[#3DD9C4] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3DD9C4] transition-colors hover:bg-[#3DD9C4] hover:text-[#0B1120]"
                                                    >
                                                        Copy
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleReplaceParagraph}
                                                        disabled={replaced}
                                                        className="border border-[#7C5CFF] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7C5CFF] transition-colors hover:bg-[#7C5CFF] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {replaced ? "Replaced ✓" : "Replace"}
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="mt-3 leading-7 text-[#F6F8FB]">
                                                {improveResult.improved_paragraph ??
                                                    improveResult.rewritten_paragraph ??
                                                    improveResult.rewrite}
                                            </p>
                                        </div>
                                    )}

                                    {/* ============ BEFORE / AFTER COMPARISON ============ */}
                                    {(improveResult.improved_paragraph ??
                                        improveResult.rewritten_paragraph ??
                                        improveResult.rewrite) &&
                                        result.weakest_paragraph && (
                                            <div className="mt-6">
                                                <p
                                                    className="text-[10px] uppercase tracking-[0.14em] text-[#6C82A0]"
                                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                                >
                                                    Before / After
                                                </p>

                                                <div className="mt-3 grid grid-cols-1 gap-px bg-[#25334A] sm:grid-cols-2">

                                                    <div className="bg-[#111B2E] p-4">
                                                        <p
                                                            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#FF3D8F]"
                                                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                                        >
                                                            Before
                                                        </p>
                                                        <p className="mt-2 text-sm leading-6 text-[#8CA0B8]">
                                                            {originalParagraphSnapshot}
                                                        </p>
                                                    </div>

                                                    <div className="bg-[#111B2E] p-4">
                                                        <p
                                                            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3DD9C4]"
                                                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                                        >
                                                            After
                                                        </p>
                                                        <p className="mt-2 text-sm leading-6 text-[#F6F8FB]">
                                                            {improveResult.improved_paragraph ??
                                                                improveResult.rewritten_paragraph ??
                                                                improveResult.rewrite}
                                                        </p>
                                                    </div>

                                                </div>
                                            </div>
                                        )}

                                    {!improveResult.problem &&
                                        !improveResult.why_weak &&
                                        !improveResult.suggestions &&
                                        !improveResult.improved_paragraph &&
                                        !improveResult.rewritten_paragraph &&
                                        !improveResult.rewrite && (
                                            <p className="text-sm text-[#8CA0B8]">
                                                {JSON.stringify(improveResult)}
                                            </p>
                                        )}

                                </div>
                            )}
                        </Frame>
                    )}


                    {/* ================= WEAK DIMENSION DETAILS ================= */}
                    {result.weakest_dimension &&
                        result.dimensions?.[result.weakest_dimension] && (
                            <Frame>
                                <Eyebrow>Notes</Eyebrow>
                                <h3
                                    className="mt-2 text-xl font-bold text-[#F6F8FB]"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    Why is this the weakest area?
                                </h3>

                                <p
                                    className="mt-3 text-sm font-semibold text-[#FF3D8F]"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                    {formatLabel(result.weakest_dimension)}
                                </p>

                                <p className="mt-2 text-[#8CA0B8]">
                                    {
                                        result.dimensions[
                                            result.weakest_dimension
                                        ]?.reason
                                    }
                                </p>
                            </Frame>
                        )}


                    {/* ================= FULL SOP IMPROVEMENT ================= */}
                    {result.essay && (
                        <Frame>
                            <Eyebrow>Full Rewrite</Eyebrow>
                            <h3
                                className="mt-2 text-xl font-bold text-[#F6F8FB]"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                Improve Entire SOP
                            </h3>

                            <p className="mt-2 text-sm text-[#8CA0B8]">
                                Rewrites the full SOP across all dimensions while
                                preserving your original voice, tone, and details.
                            </p>

                            <button
                                onClick={handleImproveFull}
                                disabled={improvingFull}
                                className="mt-5 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                                style={{ background: "linear-gradient(90deg, #FF7A45, #FF3D8F, #7C5CFF)" }}
                            >
                                {improvingFull ? "Rewriting..." : "Improve Entire SOP"}
                            </button>

                            {fullImproveError && (
                                <div className="mt-4 border border-[#FF3D8F]/40 bg-[#FF3D8F]/10 p-3">
                                    <p
                                        className="text-sm font-medium text-[#FF3D8F]"
                                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                    >
                                        {fullImproveError}
                                    </p>
                                </div>
                            )}

                            {fullImproveResult && (
                                <div className="mt-6 border-t border-[#25334A] pt-5">

                                    {Array.isArray(fullImproveResult.changes_summary) &&
                                        fullImproveResult.changes_summary.length > 0 && (
                                            <div>
                                                <p
                                                    className="text-[10px] uppercase tracking-[0.14em] text-[#3DD9C4]"
                                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                                >
                                                    What Changed
                                                </p>
                                                <ul className="mt-2 list-disc space-y-2 pl-5 text-[#8CA0B8]">
                                                    {fullImproveResult.changes_summary.map(
                                                        (change: string, i: number) => (
                                                            <li key={i}>{change}</li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                    {fullImproveResult.improved_essay && (
                                        <div className="mt-6 border-l-2 border-[#3DD9C4] bg-white/5 p-5">
                                            <div className="flex items-center justify-between gap-4">
                                                <p
                                                    className="text-[10px] uppercase tracking-[0.14em] text-[#3DD9C4]"
                                                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                                >
                                                    Rewritten SOP
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyFullEssay}
                                                    className="border border-[#3DD9C4] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3DD9C4] transition-colors hover:bg-[#3DD9C4] hover:text-[#0B1120]"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                            <p className="mt-3 whitespace-pre-line leading-7 text-[#F6F8FB]">
                                                {fullImproveResult.improved_essay}
                                            </p>
                                        </div>
                                    )}

                                </div>
                            )}
                        </Frame>
                    )}

                </div>
            )}

        </div>
    );
}