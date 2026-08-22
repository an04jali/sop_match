import { getToken } from "./auth";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";


function getAuthHeaders(): Record<string, string> {
    const token = getToken();

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
}


async function getErrorMessage(
    response: Response,
    fallback: string
): Promise<string> {
    try {
        const data = await response.json();

        if (typeof data?.detail === "string") {
            return data.detail;
        }

        if (Array.isArray(data?.detail)) {
            return data.detail
                .map((item: any) => item?.msg || "Invalid request")
                .join(", ");
        }

        return fallback;
    } catch {
        return fallback;
    }
}


async function fetchWithErrorHandling(
    url: string,
    options: RequestInit,
    fallbackMessage: string
) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const message = await getErrorMessage(
                response,
                fallbackMessage
            );

            throw new Error(message);
        }

        return response.json();

    } catch (error) {

        // Preserve our meaningful API errors
        if (error instanceof Error) {

            if (
                error.message !== "Failed to fetch" &&
                !error.message.includes("NetworkError")
            ) {
                throw error;
            }
        }

        // Backend unavailable / network failure
        throw new Error(
            "Unable to connect to Draftsman server. Please make sure the backend is running."
        );
    }
}


export async function getCurrentUser() {
    return fetchWithErrorHandling(
        `${API_BASE_URL}/auth/me`,
        {
            headers: getAuthHeaders(),
        },
        "Failed to load current user."
    );
}


// ==================== SOP ANALYSIS ====================

export async function analyzeSOP(
    file: File,
    university?: string,
    program?: string
) {
    const formData = new FormData();

    formData.append("file", file);

    if (university) {
        formData.append("university", university);
    }

    if (program) {
        formData.append("program", program);
    }

    // Note: don't set Content-Type manually with FormData —
    // the browser sets the multipart boundary automatically.
    return fetchWithErrorHandling(
        `${API_BASE_URL}/analyze`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: formData,
        },
        "Failed to analyze SOP."
    );
}


export async function improveSOP(data: {
    essay: string;
    weakest_dimension: string;
    weakest_paragraph: string;
    evidence: string[];
    reason: string;
    university?: string;
    program?: string;
    analysis_id?: number | null;
}) {
    return fetchWithErrorHandling(
        `${API_BASE_URL}/improve`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        },
        "Failed to improve paragraph."
    );
}


export async function improveFullSOP(data: {
    essay: string;
    university?: string;
    program?: string;
    analysis_id?: number | null;
}) {
    return fetchWithErrorHandling(
        `${API_BASE_URL}/improve-full`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        },
        "Failed to improve the full SOP."
    );
}


// ==================== HISTORY ====================

export async function getHistory() {
    return fetchWithErrorHandling(
        `${API_BASE_URL}/history`,
        {
            headers: getAuthHeaders(),
        },
        "Failed to load history."
    );
}


export async function getHistoryItem(id: number) {
    return fetchWithErrorHandling(
        `${API_BASE_URL}/history/${id}`,
        {
            headers: getAuthHeaders(),
        },
        "Failed to load this analysis."
    );
}


export async function deleteHistoryItem(id: number) {
    return fetchWithErrorHandling(
        `${API_BASE_URL}/history/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        },
        "Failed to delete this analysis."
    );
}