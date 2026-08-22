"use client";

import UploadBox from "../components/upload/UploadBox";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import LogoutButton from "@/components/upload/LogoutButton";

export default function Home() {
    const { checkingAuth } = useRequireAuth();

    if (checkingAuth) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-gray-500">Checking session...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-10">
            <div className="mx-auto max-w-4xl">

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Draftsman
                        </h1>
                        <p className="mt-3 text-gray-600">
                            AI-powered SOP analysis and improvement.
                        </p>
                    </div>

                    <LogoutButton />
                </div>

                <div className="mt-10">
                    <UploadBox />
                </div>
            </div>
        </main>
    );
}