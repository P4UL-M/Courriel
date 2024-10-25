import * as microsoftgraph from "@microsoft/microsoft-graph-types";
import { signOut } from "next-auth/react";

export const fetchUserProfile = async (accessToken: string) => {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    return data;
};

// Fetch emails from Microsoft Graph API
export const fetchEmailsMicrosoft = async (accessToken: string, number: number = 10, mailFolder: string | undefined = undefined) => {
    try {
        // Microsoft Graph API endpoint for fetching emails
        const response = await fetch(
            `https://graph.microsoft.com/v1.0/me/${mailFolder && "mailFolders/" + mailFolder + "/"}messages?` +
                new URLSearchParams({
                    $top: number.toString(),
                }),
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        // check if the response is successful
        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized, token is expired
                signOut();
            }
        }

        const data = await response.json();

        return data.value as microsoftgraph.Message[];
    } catch (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
};

export const fetchEmailDetailsMicrosoft = async (accessToken: string, emailId: string) => {
    try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${emailId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return (await response.json()) as microsoftgraph.Message;
    } catch (error) {
        console.error("Error fetching email details:", error);
        return {} as microsoftgraph.Message;
    }
};

export const fetchEmailAttachmentsMicrosoft = async (accessToken: string, emailId: string) => {
    try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${emailId}/attachments`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return (await response.json()).value as microsoftgraph.FileAttachment[];
    } catch (error) {
        console.error("Error fetching email attachments:", error);
        return [];
    }
};
