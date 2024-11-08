import * as microsoftgraph from "@microsoft/microsoft-graph-types";
import { signOut } from "next-auth/react";
import { Email, EmailPreview, SearchParams } from "@/lib/db/types";
import { decomposeFilter } from "../utils";

export const fetchUserProfile = async (accessToken: string) => {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const data = await response.json();
    return data;
};

// Updated Microsoft email fetcher with consistent response for Email type
export const fetchEmailsMicrosoft = async (
    accessToken: string,
    number: number = 10,
    mailFolder: string | undefined = undefined,
    nextLink: string | undefined = undefined
): Promise<{ nextLink?: string; data: Email[] }> => {
    try {
        const params = new URLSearchParams({
            $top: number.toString(),
        });

        const endpoint = new URL(nextLink || `https://graph.microsoft.com/v1.0/me/${mailFolder ? `mailFolders/${mailFolder}/` : ""}messages`);

        // override duplicate url search params with new params
        params.forEach((value, key) => {
            endpoint.searchParams.set(key, value);
        });

        const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            if (response.status === 401) signOut();
            return { data: [] };
        }

        const data = await response.json();

        if (!data.value) return { data: [] };

        return {
            nextLink: data["@odata.nextLink"],
            data: data.value.map((email: microsoftgraph.Message) => ({
                id: email.id,
                sender: {
                    name: email.sender?.emailAddress?.name || "Unknown",
                    email: email.sender?.emailAddress?.address?.toLowerCase() || "",
                },
                recipients:
                    email.toRecipients?.map((recipient) => ({
                        name: recipient.emailAddress?.name || "Unknown",
                        email: recipient.emailAddress?.address?.toLowerCase() || "",
                    })) || [],
                subject: email.subject || "No Subject",
                body: email.bodyPreview || "",
                hasAttachments: email.hasAttachments,
                sentDate: new Date(email.sentDateTime || 0),
            })),
        };
    } catch (error) {
        console.error("Error fetching Microsoft emails:", error);
        return { data: [] };
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

export const fetchEmailExistMicrosoft = async (accessToken: string, emailId: string) => {
    try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${emailId}?$select=id`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.ok;
    } catch (error) {
        console.error("Error fetching email existence:", error);
        return false;
    }
};

export const searchEmailsMicrosoft = async (accessToken: string, filter: SearchParams): Promise<EmailPreview[]> => {
    try {
        const params = new URLSearchParams({
            $count: "true",
            $search: '"' + decomposeFilter(filter) + '"',
            $select: "id,subject,sender,toRecipients,bodyPreview,sentDateTime,parentFolderId",
        });

        console.log("Search params:", params.toString());

        const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            // sign out from server side
            if (response.status === 401) return [];
        }

        const data = await response.json();
        if (!data.value) return [];

        return data.value.map(
            (email: microsoftgraph.Message): EmailPreview => ({
                id: email.id!,
                sender: {
                    name: email.sender?.emailAddress?.name || "Unknown",
                    email: email.sender?.emailAddress?.address?.toLowerCase() || "",
                },
                recipients:
                    email.toRecipients?.map((recipient) => ({
                        name: recipient.emailAddress?.name || "Unknown",
                        email: recipient.emailAddress?.address?.toLowerCase() || "",
                    })) || [],
                subject: email.subject || "No Subject",
                bodyPreview: email.bodyPreview || "",
                sentDate: new Date(email.sentDateTime || 0),
            })
        );
    } catch (error) {
        console.error("Error searching emails:", error);
        return [];
    }
};
