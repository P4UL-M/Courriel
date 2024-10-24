import { fetchEmailDetailsMicrosoft, fetchEmailsMicrosoft } from "./queries.mycrosoft";
import { Email } from "./types";
import { decodeBase64, fetchGoogleEmailDetails, fetchGoogleEmails, getEmailBody, GoogleEmail } from "./queries.google";

export const fetchEmails = async (provider: string, accessToken: string, number: number = 10) => {
    if (provider === "microsoft-entra-id") {
        const data = await fetchEmailsMicrosoft(accessToken, number);

        if (!data) {
            return [];
        }

        // translate to Email type
        return data.map((email) => {
            return {
                id: email.id,
                sender: {
                    name: email.sender?.emailAddress?.name,
                    email: email.sender?.emailAddress?.address,
                },
                recipients: email.toRecipients?.map((recipient) => ({
                    name: recipient.emailAddress?.name,
                    email: recipient.emailAddress?.address,
                })),
                subject: email.subject,
                body: email.bodyPreview,
                hasAttachments: email.hasAttachments,
                sentDate: new Date(email.sentDateTime || 0),
            } as Email;
        });
    } else if (provider === "google") {
        // fetch emails from Google API
        const data = await fetchGoogleEmails(accessToken, number);

        if (!data) {
            return [];
        }

        // translate to Email type
        return data.map((email: GoogleEmail) => {
            const sender = email.payload?.headers?.find((header) => header.name === "From")?.value || "Unknown";
            // separate name and email
            const senderName = sender.split("<")[0].trim();
            const senderEmail = sender.match(/<([^>]*)>/)?.[1] || sender;
            return {
                id: email.id,
                sender: {
                    name: senderName,
                    email: senderEmail,
                },
                recipients: email.payload?.headers
                    ?.filter((header) => header.name === "To")
                    .map((header) => ({
                        name: header.value,
                        email: header.value,
                    })),
                subject: email.payload?.headers?.find((header) => header.name === "Subject")?.value || "No Subject",
                body: email.snippet,
                hasAttachments: email.payload?.mimeType === "multipart/mixed",
                sentDate: new Date(parseInt(email.internalDate || "0")),
            } as Email;
        });
    } else {
        console.error("Unknown provider:", provider);
        return [];
    }
};

export const fetchEmailsDetails = async (provider: string, accessToken: string, emailId: string) => {
    if (provider === "microsoft-entra-id") {
        // fetch email details from Microsoft Graph API
        const data = await fetchEmailDetailsMicrosoft(accessToken, emailId);

        // translate to Email type
        return {
            id: data.id,
            sender: {
                name: data.sender?.emailAddress?.name,
                email: data.sender?.emailAddress?.address,
            },
            recipients: data.toRecipients?.map((recipient) => ({
                name: recipient.emailAddress?.name,
                email: recipient.emailAddress?.address,
            })),
            subject: data.subject,
            body: data.body?.content as string,
            hasAttachments: data.hasAttachments,
            sentDate: new Date(data.sentDateTime || 0),
        } as Email;
    } else if (provider === "google") {
        // fetch email details from Google API
        const data = await fetchGoogleEmailDetails(accessToken, emailId);

        const sender = data.payload?.headers?.find((header) => header.name === "From")?.value || "Unknown";
        // separate name and email
        const senderName = sender.split("<")[0].trim();
        const senderEmail = sender.match(/<([^>]*)>/)?.[1] || sender;
        let emailBody = data.payload?.body?.data ? decodeBase64(data.payload.body.data) : "";
        if (data.payload?.parts) {
            emailBody = getEmailBody(data.payload.parts);
        }

        return {
            id: data.id,
            sender: {
                name: senderName,
                email: senderEmail,
            },
            recipients: data.payload?.headers
                ?.filter((header) => header.name === "To")
                .map((header) => ({
                    name: header.value,
                    email: header.value,
                })),
            subject: data.payload?.headers?.find((header) => header.name === "Subject")?.value || "No Subject",
            body: emailBody,
            hasAttachments: data.payload?.mimeType === "multipart/mixed",
            sentDate: new Date(parseInt(data.internalDate || "0")),
        } as Email;
    } else {
        console.error("Unknown provider:", provider);
        return {} as Email;
    }
};

export const fetchPrevAndNextEmails = async (provider: string, accessToken: string, emailId: string) => {
    if (provider === "microsoft-entra-id") {
        const data = await fetchEmailsMicrosoft(accessToken);

        if (!data) {
            return {};
        }

        const emailIndex = data.findIndex((email) => email.id === emailId);
        return {
            prevId: data[emailIndex + 1]?.id,
            nextId: data[emailIndex - 1]?.id,
        };
    } else if (provider === "google") {
        const data = await fetchGoogleEmails(accessToken);

        if (!data) {
            return {};
        }

        const emailIndex = data.findIndex((email) => email.id === emailId);
        return {
            prevId: data[emailIndex + 1]?.id,
            nextId: data[emailIndex - 1]?.id,
        };
    } else {
        console.error("Unknown provider:", provider);
        return {};
    }
};
