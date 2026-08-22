"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "../services/auth";

export default function LogoutButton() {
    const router = useRouter();

    function handleLogout() {
        logoutUser();
        router.replace("/auth");
    }

    return (
        <button
            onClick={handleLogout}
            className="border border-[#C2792E] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#C2792E] transition-colors hover:bg-[#C2792E] hover:text-white"
        >
            Logout
        </button>
    );
}