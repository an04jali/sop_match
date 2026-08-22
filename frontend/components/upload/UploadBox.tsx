"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeSOP } from "../../services/api";

export default function UploadBox() {
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [university, setUniversity] = useState("");
    const [program, setProgram] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleAnalyze() {
        if (!file) {
            setError("Please select an SOP file.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const result = await analyzeSOP(
                file,
                university || undefined,
                program || undefined
            );

            localStorage.setItem(
                "latest_analysis",
                JSON.stringify(result)
            );

            router.push("/results");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to analyze SOP."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="border border-gray-200 bg-white p-8">
            <h2 className="text-xl font-semibold text-gray-900">
                Upload your SOP
            </h2>

            <p className="mt-2 text-sm text-gray-500">
                Upload your Statement of Purpose for AI analysis.
            </p>

            <div className="mt-6">
                <label className="text-sm font-medium text-gray-700">
                    SOP File
                </label>

                <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) =>
                        setFile(e.target.files?.[0] || null)
                    }
                    className="mt-2 block w-full text-sm"
                />
            </div>

            <div className="mt-5">
                <label className="text-sm font-medium text-gray-700">
                    University
                </label>

                <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
            </div>

            <div className="mt-5">
                <label className="text-sm font-medium text-gray-700">
                    Program
                </label>

                <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    placeholder="e.g. MS in Computer Science"
                    className="mt-2 w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
            </div>

            {error && (
                <p className="mt-4 text-sm text-red-600">
                    {error}
                </p>
            )}

            <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-6 w-full bg-[#132A3A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2E6F9E] disabled:opacity-50"
            >
                {loading ? "Analyzing..." : "Analyze SOP"}
            </button>
        </div>
    );
}