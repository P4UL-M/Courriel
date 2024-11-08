import { FileAttachment } from "@microsoft/microsoft-graph-types";
import { signOut } from "next-auth/react";
import { Email } from "./types";
import { EmailPreview, SearchParams } from "./types";
import { decomposeFilter } from "../utils";

export type GoogleEmail = gapi.client.gmail.Message;
export type GoogleEmailResponse = Pick<gapi.client.gmail.Message, "id" | "threadId">;
// Updated Google email fetcher with consistent response for Email type
export async function fetchGoogleEmails(
    accessToken: string,
    number: number = 10,
    folder: string | undefined = undefined,
    nextIndex: string | undefined = undefined
): Promise<{ nextLink?: string; data: Email[] }> {
    try {
        const params = new URLSearchParams({
            maxResults: number.toString(),
            ...(nextIndex && { pageToken: nextIndex }),
        });

        if (folder) {
            if (folder.includes(":")) params.set("q", folder);
            else params.set("labelIds", folder);
        }

        const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            if (response.status === 401) signOut();
            return { data: [] };
        }

        const data = await response.json();
        if (!data.messages) return { data: [] }; // Return empty array if no messages

        return {
            nextLink: data.nextPageToken,
            data: await Promise.all(
                data.messages.map(async (message: { id: string }) => {
                    const messageResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
                        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
                    });

                    const messageData: gapi.client.gmail.Message = await messageResponse.json();
                    const sender = messageData.payload?.headers?.find((header) => header.name === "From")?.value || "Unknown";
                    const senderName = sender.split("<")[0].trim();
                    const senderEmail = sender.match(/<([^>]*)>/)?.[1] || sender;

                    return {
                        id: messageData.id,
                        sender: { name: senderName, email: senderEmail.toLowerCase() },
                        recipients: messageData.payload?.headers
                            ?.filter((header) => header.name === "To")
                            .map((header) => ({
                                email: header.value?.split("<")[1]?.replace(">", "").toLowerCase() || header.value,
                                name: header.value?.split("<")[0]?.trim() || header.value,
                            })),
                        subject: messageData.payload?.headers?.find((header) => header.name === "Subject")?.value || "No Subject",
                        body: messageData.snippet,
                        hasAttachments: messageData.payload?.mimeType === "multipart/mixed",
                        sentDate: new Date(parseInt(messageData.internalDate || "0")),
                    } as Email;
                })
            ),
        };
    } catch (error) {
        console.error("Error fetching emails:", error);
        return { data: [] };
    }
}

export async function fetchGoogleEmailDetails(accessToken: string, emailId: string): Promise<GoogleEmail> {
    try {
        const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // check if the response is successful
        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized, token is expired
                console.log("Unauthorized, token is expired");
                signOut();
            }
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching email details:", error);
        return {} as GoogleEmail;
    }
}

// Function to decode base64-encoded email content
export const decodeBase64 = (encodedString: string): string => {
    // Gmail uses URL-safe base64 encoding, so we need to replace certain characters
    const decodedString = Buffer.from(encodedString.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    return decodedString;
};

// Recursive function to extract the email body (text/plain or text/html)
export const getEmailBody = (parts: gapi.client.gmail.MessagePart[]): string => {
    let htmlBody = "";
    let textBody = "";

    for (const part of parts) {
        // If the part is HTML, prioritize it
        if (part.mimeType === "text/html" && part.body?.data) {
            htmlBody = decodeBase64(part.body.data);
        }
        // If the part is plain text, store it as a fallback
        if (part.mimeType === "text/plain" && part.body?.data) {
            textBody = decodeBase64(part.body.data);
        }

        // Recursively check sub-parts if present
        if (part.parts) {
            const result = getEmailBody(part.parts);
            if (result) {
                // Prioritize HTML if found in nested parts
                if (part.mimeType === "text/html") return result;
                // Otherwise, return plain text if no HTML was found
                return result;
            }
        }
    }

    // Return HTML if found, otherwise fallback to plain text
    return htmlBody || textBody;
};

function toUrlSafeBase64(base64: string): string {
    return base64.replace(/\-/g, "+").replace(/\_/g, "/").replace(/=+$/, "");
}

const getAttachments = (parts: gapi.client.gmail.MessagePart[]) => {
    let attachments: microsoftgraph.FileAttachment[] = [];

    for (const part of parts) {
        // Check if the part is an attachment
        if (part.filename && part.body?.attachmentId) {
            attachments.push({
                id: part.body.attachmentId,
                name: part.filename,
                contentType: part.mimeType,
                contentId: part.headers?.find((header) => header.name === "Content-ID")?.value || null,
                contentLocation: part.headers?.find((header) => header.name === "Content-Location")?.value || null,
                isInline: part.headers?.find((header) => header.name === "Content-Disposition")?.value === "inline",
            });
        }

        // If the part has its own parts, recursively check them
        if (part.parts) {
            attachments = attachments.concat(getAttachments(part.parts));
        }
    }

    return attachments;
};

// Function to extract email attachments
export const fetchEmailAttachmentsGmail = async (accessToken: string, emailId: string) => {
    try {
        // Step 1: Fetch the email to get attachment IDs
        const emailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const emailData = await emailResponse.json();

        // Extract attachment metadata from email payload
        const attachments = getAttachments(emailData.payload.parts || []);

        // Step 2: Fetch each attachment by its ID
        const attachmentPromises = attachments.map(async (attachment: microsoftgraph.FileAttachment) => {
            const attachmentResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/attachments/${attachment.id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const attachmentData = await attachmentResponse.json();

            return {
                id: attachment.id,
                name: attachment.name,
                contentId: attachment.contentId,
                contentType: attachment.contentType,
                contentBytes: toUrlSafeBase64(attachmentData.data),
                size: attachmentData.size,
                contentLocation: attachment.contentLocation,
                isInline: attachment.isInline,
                lastModifiedDateTime: new Date().toISOString(),
            } as FileAttachment;
        });
        return await Promise.all(attachmentPromises);
    } catch (error) {
        console.error("Error fetching email attachments:", error);
        return [];
    }
};

export async function searchEmailsGoogle(accessToken: string, filter: SearchParams): Promise<EmailPreview[]> {
    try {
        const params = new URLSearchParams({
            q: decomposeFilter(filter).replace("AND", " "),
        });

        const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            if (response.status === 401) signOut();
            return [];
        }

        const data = await response.json();
        if (!data.messages) return [];

        return await Promise.all(
            data.messages.map(async (message: { id: string }) => {
                const messageResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
                    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
                });

                const messageData: gapi.client.gmail.Message = await messageResponse.json();
                const sender = messageData.payload?.headers?.find((header) => header.name === "From")?.value || "Unknown";
                const senderName = sender.split("<")[0].trim();
                const senderEmail = sender.match(/<([^>]*)>/)?.[1] || sender;

                return {
                    id: messageData.id!,
                    sender: { name: senderName, email: senderEmail.toLowerCase() },
                    recipients:
                        messageData.payload?.headers
                            ?.filter((header) => header.name === "To")
                            .map((header) => ({
                                email: header.value?.split("<")[1]?.replace(">", "").toLowerCase() || header.value,
                                name: header.value?.split("<")[0]?.trim() || header.value,
                            })) || [],
                    subject: messageData.payload?.headers?.find((header) => header.name === "Subject")?.value || "No Subject",
                    bodyPreview: messageData.snippet || "",
                    sentDate: new Date(parseInt(messageData.internalDate || "0")),
                } as EmailPreview;
            })
        );
    } catch (error) {
        console.error("Error searching emails:", error);
        return [];
    }
}
