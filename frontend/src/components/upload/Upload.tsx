"use client";

import { useState } from "react";
import { analyzeSOP, improveSOP } from "../../services/api";

export default function UploadBox() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleAnalyze() {
        if (!file) {
            setError("Please select a PDF or DOCX file.");
            return;
        }

        setError("");
        setResult(null);
        setLoading(true);

        try {
            const data = await analyzeSOP(file);

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

    return (
        <div className="space-y-6">

            {/* Upload Box */}
            <div className="border-2 border-dashed rounded-xl p-10 text-center">

                <h2 className="text-xl font-semibold mb-4">
                    Upload your SOP
                </h2>

                <p className="text-gray-500 mb-6">
                    Upload a PDF or DOCX file for AI analysis.
                </p>

                <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                        const selectedFile =
                            e.target.files?.[0] || null;

                        setFile(selectedFile);
                        setResult(null);
                        setError("");
                    }}
                />

                {file && (
                    <p className="mt-4 text-sm text-gray-700">
                        Selected: <strong>{file.name}</strong>
                    </p>
                )}

            </div>


            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="rounded-lg bg-black px-6 py-3 text-white disabled:opacity-50"
            >
                {loading ? "Analyzing..." : "Analyze SOP"}
            </button>


            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                    <p className="text-red-600">
                        {error}
                    </p>
                </div>
            )}


            {/* Result */}
            {result && (
                <div className="rounded-xl border p-6">

                    <h2 className="text-2xl font-semibold">
                        Analysis Complete
                    </h2>


                    {/* Overall Result */}
                    <div className="mt-6 space-y-3">

                        <p>
                            <strong>Overall Score:</strong>{" "}
                            {result.overall_score ?? "N/A"}
                        </p>

                        <p>
                            <strong>Weakest Dimension:</strong>{" "}
                            {result.weakest_dimension ?? "N/A"}
                        </p>

                    </div>


                    {/* Structural Analysis */}
                    {result.structural && (
                        <div className="mt-6">

                            <h3 className="text-lg font-semibold">
                                Structural Analysis
                            </h3>

                            <div className="mt-3 space-y-2">

                                <p>
                                    <strong>Words:</strong>{" "}
                                    {result.structural.words ?? "N/A"}
                                </p>

                                <p>
                                    <strong>Paragraphs:</strong>{" "}
                                    {result.structural.paragraphs ?? "N/A"}
                                </p>

                                <p>
                                    <strong>Sentences:</strong>{" "}
                                    {result.structural.sentences ?? "N/A"}
                                </p>

                                <p>
                                    <strong>Reading Time:</strong>{" "}
                                    {result.structural.reading_time ?? "N/A"}
                                </p>

                                <p>
                                    <strong>
                                        Average Sentence Length:
                                    </strong>{" "}
                                    {result.structural.average_sentence_length ?? "N/A"}
                                </p>

                            </div>

                        </div>
                    )}


                    {/* Dimension Results */}
                    {result.dimensions && (
                        <div className="mt-8">

                            <h3 className="text-lg font-semibold">
                                Dimension Scores
                            </h3>

                            <div className="mt-4 space-y-4">

                                {Object.entries(result.dimensions).map(
                                    ([dimension, value]: [string, any]) => (

                                        <div
                                            key={dimension}
                                            className="rounded-lg border p-4"
                                        >

                                            <div className="flex justify-between">

                                                <strong>
                                                    {dimension}
                                                </strong>

                                                <span>
                                                    {value?.score ?? "N/A"}/5
                                                </span>

                                            </div>

                                            {value?.reason && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    {value.reason}
                                                </p>
                                            )}

                                        </div>

                                    )
                                )}

                            </div>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}