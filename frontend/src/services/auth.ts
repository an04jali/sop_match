const API_BASE_URL =
process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function registerUser(data: {
    name: string;
    email: string;
    password: string;
}) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result?.detail || "Registration failed.");
    }

    return result;
}

export async function loginUser(data: {
    email: string;
    password: string;
}) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
        throw new Error(result?.detail || "Login failed.");
    }

    if (result.access_token) {
        localStorage.setItem("access_token", result.access_token);
    }

    return result;
}

export function logoutUser() {
    localStorage.removeItem("access_token");
}

export function getToken() {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem("access_token");
}