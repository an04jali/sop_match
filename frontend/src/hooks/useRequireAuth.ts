"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../services/auth";

export function useRequireAuth() {
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const token = getToken();

        if (!token) {
            router.replace("/auth");
        } else {
            setCheckingAuth(false);
        }
    }, [router]);

    return { checkingAuth };
}