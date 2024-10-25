import { fetchEmailAttachmentsMicrosoft, fetchEmailDetailsMicrosoft, fetchEmailsMicrosoft } from "./queries.microsoft";
import { Email, Attachment } from "./types";
import { decodeBase64, fetchGoogleEmailDetails, fetchGoogleEmails, getEmailBody, GoogleEmail } from "./queries.google";

export enum MailFolder {
    Inbox = "inbox",
    Drafts = "drafts",
    SentItems = "sent",
    DeletedItems = "trash",
    Starred = "starred",
    Archive = "archive",
}

export enum ProviderName {
    Microsoft = "microsoft-entra-id",
    Google = "google",
}

const FolderTranslation = {
    "microsoft-entra-id": {
        [MailFolder.Inbox]: "inbox",
        [MailFolder.Drafts]: "drafts",
        [MailFolder.SentItems]: "sentitems",
        [MailFolder.DeletedItems]: "deleteditems",
        [MailFolder.Starred]: "starred",
        [MailFolder.Archive]: "archive",
    },
    google: {
        [MailFolder.Inbox]: "INBOX",
        [MailFolder.Drafts]: "DRAFT",
        [MailFolder.SentItems]: "SENT",
        [MailFolder.DeletedItems]: "TRASH",
        [MailFolder.Starred]: "STARRED",
        [MailFolder.Archive]: "-in:inbox",
    },
};

export const fetchEmails = async (provider: ProviderName, accessToken: string, number: number = 10, folder: MailFolder | undefined = undefined) => {
    if (provider === "microsoft-entra-id") {
        const mailFolder = folder && FolderTranslation[provider][folder];
        const data = await fetchEmailsMicrosoft(accessToken, number, mailFolder);

        if (!data) {
            return [];
        }

        // translate to Email type
        return data.map((email) => {
            return {
                id: email.id,
                sender: {
                    name: email.sender?.emailAddress?.name,
                    email: email.sender?.emailAddress?.address?.toLocaleLowerCase(),
                },
                recipients: email.toRecipients?.map((recipient) => ({
                    name: recipient.emailAddress?.name,
                    email: recipient.emailAddress?.address?.toLocaleLowerCase(),
                })),
                subject: email.subject,
                body: email.bodyPreview,
                hasAttachments: email.hasAttachments,
                sentDate: new Date(email.sentDateTime || 0),
            } as Email;
        });
    } else if (provider === "google") {
        // fetch emails from Google API
        const mailFolder = folder && FolderTranslation[provider][folder];
        const data = await fetchGoogleEmails(accessToken, number, mailFolder);

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
                    email: senderEmail.toLocaleLowerCase(),
                },
                recipients: email.payload?.headers
                    ?.filter((header) => header.name === "To")
                    .map((header) => ({
                        email: header.value?.split("<")[1]?.replace(">", "").toLocaleLowerCase() || header.value,
                        name: header.value?.split("<")[0]?.trim() || header.value,
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

export const fetchEmailsDetails = async (provider: ProviderName, accessToken: string, emailId: string) => {
    if (provider === "microsoft-entra-id") {
        // fetch email details from Microsoft Graph API
        const data = await fetchEmailDetailsMicrosoft(accessToken, emailId);

        let content = data.body?.content || "";
        const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        content = content.replace(scriptRegex, "");

        // translate to Email type
        return {
            id: data.id,
            sender: {
                name: data.sender?.emailAddress?.name,
                email: data.sender?.emailAddress?.address?.toLocaleLowerCase(),
            },
            recipients: data.toRecipients?.map((recipient) => ({
                name: recipient.emailAddress?.name,
                email: recipient.emailAddress?.address?.toLocaleLowerCase(),
            })),
            subject: data.subject,
            body: content,
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
        const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        emailBody = emailBody.replace(scriptRegex, "");

        return {
            id: data.id,
            sender: {
                name: senderName,
                email: senderEmail.toLocaleLowerCase(),
            },
            recipients: data.payload?.headers
                ?.filter((header) => header.name === "To")
                .map((header) => ({
                    email: header.value?.split("<")[1]?.replace(">", "").toLocaleLowerCase() || header.value,
                    name: header.value?.split("<")[0]?.trim() || header.value,
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

export const fetchEmailAttachments = async (provider: ProviderName, accessToken: string, emailId: string) => {
    if (provider === "microsoft-entra-id") {
        // fetch email attachments from Microsoft Graph API
        return await fetchEmailAttachmentsMicrosoft(accessToken, emailId);
    } else if (provider === "google") {
        // Google API does not support fetching attachments directly
        return [];
    } else {
        console.error("Unknown provider:", provider);
        return [];
    }
};
