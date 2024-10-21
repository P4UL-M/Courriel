import { fetchEmailsMicrosoft } from "./queries.mycrosoft";
import { Email } from "./types";
import { fetchGoogleEmails, GoogleEmail } from "./queries.google";

export const fetchEmails = async (provider: string, accessToken: string, number: number = 10) => {
    if (provider === "microsoft-entra-id") {
        const data = await fetchEmailsMicrosoft(accessToken, number);

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
