import useSWR, { mutate } from "swr";
import { getSession } from "next-auth/react";

const url = process.env.NEXT_PUBLIC_API_URL + "/perkara";


// Fetcher dengan Bearer Token
const fetcher = async (endpoint: string) => {
    const session = await getSession();
    const res = await fetch(endpoint, {
        headers: {
            Authorization: `Bearer ${session?.accessToken}`, // ✅ ambil accessToken dari session
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw Object.assign(new Error(data.message || "Gagal fetch data"), {
            statusCode: res.status,
        });
    }
    return data;
};

// Refresh cache manual
export function refresh(params: {
    search?: string;
    page?: number;
    perPage?: number;
    type?: string[];
}) {
    const queryParams = new URLSearchParams({
        ...(params.search && { search: params.search }),
        page: params.page?.toString() || "1",
        perPage: params.perPage?.toString() || "10", // ✅ konsisten camelCase
        ...(params.type && { type: params.type.toString() }),
    }).toString();

    return mutate(`${url}?${queryParams}`);
}

// Ambil semua data dengan pagination
export function findAll(page: number, perPage: number, search?: string) {
    const queryParams = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        ...(search && { search: search }),

    });

    const fullUrl = `${url}?${queryParams}`;
    const { data, error, isLoading } = useSWR(fullUrl, fetcher);
    return {
        data: data?.page_data,
        message: data?.message,
        isLoading,
        isError: !!error,
        errorMessage: error?.message,
        statusCode: error?.statusCode,
    };
}

export function RealfindAll(search?: string) {
    const queryParams = "";
    if (search) {
        const queryParams = `?search=${search}`
    }
    const fullUrl = `${url}/all${queryParams}`;
    const { data, error, isLoading } = useSWR(fullUrl, fetcher);
    console.log(data);
    return {
        data: data?.page_data,
        message: data?.message,
        isLoading,
        isError: !!error,
        errorMessage: error?.message,
        statusCode: error?.statusCode,
        mutate: () => mutate(fullUrl),
    };
}

export function LaporanOprasional() {

    const fullUrl = `${url}/laporan/operasional`;
    const { data, error, isLoading } = useSWR(fullUrl, fetcher);
    console.log(data);
    return {
        data: data,
        message: data?.message,
        isLoading,
        isError: !!error,
        errorMessage: error?.message,
        statusCode: error?.statusCode,
        mutate: () => mutate(fullUrl),
    };
}



// Ambil 1 data
export function findOne(id: number) {
    const fullUrl = `${url}/${id}`;
    const { data, error, isLoading } = useSWR(fullUrl, fetcher);

    return {
        data: data?.page_data,
        message: data?.message,
        isLoading,
        isError: !!error,
        errorMessage: error?.message,
        statusCode: error?.statusCode,
        mutate: () => mutate(fullUrl),
    };
}

// Create user
export async function create(data: any) {
    const session = await getSession();
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session?.accessToken}`,
        },
        body: data,
    });

    const resData = await response.json();
    if (!response.ok) {
        throw Object.assign(
            new Error(resData.message || "Gagal menambah data"),
            { statusCode: response.status }
        );
    }
    return resData;
}

// Update user
export async function update(id: number, data: any) {
    const session = await getSession();
    const response = await fetch(`${url}/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${session?.accessToken}`,
        },
        body: data,
    });

    const resData = await response.json();
    if (!response.ok) {
        throw Object.assign(
            new Error(resData.message || "Gagal mengupdate data"),
            { statusCode: response.status }
        );
    }
    return resData;
}


export async function tahapPerkara(id: number, data: any) {
    const session = await getSession();
    const response = await fetch(`${url}/tahap-perkara/${id}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${session?.accessToken}`,
        },
        body: data,
    });

    const resData = await response.json();
    if (!response.ok) {
        throw Object.assign(
            new Error(resData.message || "Gagal mengupdate data"),
            { statusCode: response.status }
        );
    }
    return resData;
}

// Hapus user
export async function remove(id: number) {
    const session = await getSession();
    const response = await fetch(`${url}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${session?.accessToken}`,
        },
    });

    const resData = await response.json();
    if (!response.ok) {
        throw Object.assign(
            new Error(resData.message || "Gagal menghapus data"),
            { statusCode: response.status }
        );
    }
    return resData;
}



