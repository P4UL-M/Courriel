// app/profile/page.tsx
"use client"; // This page needs to use client-side functionality

import { useSession } from "next-auth/react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {

    const { data: session, status } = useSession();
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("session", session);
        if (session?.accessToken) {
            fetchGoogleEmails(session.accessToken);
        }
    }, [session]);

    const fetchEmails = async (accessToken: string) => {
        try {
            // Microsoft Graph API endpoint for fetching emails
            const response = await fetch("https://graph.microsoft.com/v1.0/me/messages", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();

            // Update the emails state with fetched emails
            setEmails(data.value);
        } catch (error) {
            console.error("Error fetching emails:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGoogleEmails = async (accessToken: string) => {
        try {
            // Google API endpoint for fetching Gmail messages
            const response = await fetch(
                "https://www.googleapis.com/gmail/v1/users/me/messages",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json();

            console.log("data", data);

            // Fetch the first 5 emails (you can adjust the number)
            const emailsData = await Promise.all(
                data.messages.slice(0, 5).map(async (message: any) => {
                    const emailRes = await fetch(
                        `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );
                    return emailRes.json();
                })
            );

            console.log("emailsData", emailsData);

            setEmails(emailsData as never[]);
        } catch (error) {
            console.error("Error fetching emails:", error);
        } finally {
            setLoading(false);
        }
    };

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

                {loading ? (
                    <p>Loading emails...</p>
                ) : (
                    <ul>
                        {emails.map((email) => (
                            <li key={email.id} className="mb-4">
                                <p className="font-bold">{email.subject}</p>
                                <p className="text-sm text-gray-500">From: {email.from?.emailAddress?.address}</p>
                                <p className="text-sm text-gray-500">Received: {email.receivedDateTime}</p>
                            </li>
                        ))}
                    </ul>
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