// app/profile/page.tsx
"use client"; // This page needs to use client-side functionality

import { useSession } from "next-auth/react";
import Image from "next/image";
import { signOut } from "next-auth/react";

export default function ProfilePage() {

    const { data: session, status } = useSession();

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    if (status === "unauthenticated") {
        return <p>Access Denied</p>;
    }

    const user = session?.user;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-3xl font-semibold mb-6 text-center">User Profile</h1>

                {user && (
                    <div className="flex flex-col items-center">
                        {user.image && (
                            <Image
                                src={user.image}
                                alt={user.name || user.email || "User Image"}
                                className="rounded-full w-24 h-24 mb-4"
                                width={48}
                                height={48}
                            />
                        )}
                        <p className="text-xl font-semibold">{user.name}</p>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                )}

                <div className="mt-6">
                    <button
                        onClick={() => signOut()}
                        className="w-full bg-red-500 text-white py-2 rounded-lg shadow hover:bg-red-600 transition"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}