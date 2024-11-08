import { fetchEmailAttachmentsMicrosoft, fetchEmailDetailsMicrosoft, fetchEmailExistMicrosoft, fetchEmailsMicrosoft, searchEmailsMicrosoft } from "./queries.microsoft";
import { Email, ProviderName, MailFolder, SearchParams, EmailPreview } from "./types";
import { decodeBase64, fetchEmailAttachmentsGmail, fetchGoogleEmailDetails, fetchGoogleEmails, getEmailBody, searchEmailsGoogle } from "./queries.google";
import { flattenAndFilter } from "../utils";

const FolderTranslation = {
    "microsoft-entra-id": {
        [MailFolder.Inbox]: "inbox",
        // [MailFolder.Drafts]: "drafts",
        [MailFolder.SentItems]: "sentitems",
        [MailFolder.DeletedItems]: "deleteditems",
        // [MailFolder.Starred]: "starred",
        [MailFolder.Archive]: "archive",
    },
    google: {
        [MailFolder.Inbox]: "INBOX",
        // [MailFolder.Drafts]: "DRAFT",
        [MailFolder.SentItems]: "SENT",
        [MailFolder.DeletedItems]: "TRASH",
        // [MailFolder.Starred]: "STARRED",
        [MailFolder.Archive]: "-in:inbox",
    },
};

export const fetchEmails = async (
    provider: ProviderName,
    accessToken: string,
    folder: MailFolder | undefined = undefined,
    number: number = 10,
    nextIndex: string | undefined = undefined
): Promise<{
    nextLink?: string;
    data: Email[];
}> => {
    if (provider === "microsoft-entra-id") {
        const mailFolder = folder && FolderTranslation[provider][folder];
        return await fetchEmailsMicrosoft(accessToken, number, mailFolder, nextIndex);
    } else if (provider === "google") {
        const mailFolder = folder && FolderTranslation[provider][folder];
        return await fetchGoogleEmails(accessToken, number, mailFolder, nextIndex);
    } else {
        return { data: [] };
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
            recipients:
                data.toRecipients?.map((recipient) => ({
                    name: recipient.emailAddress?.name,
                    email: recipient.emailAddress?.address?.toLocaleLowerCase(),
                })) || null,
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
        return await fetchEmailAttachmentsGmail(accessToken, emailId);
    } else {
        console.error("Unknown provider:", provider);
        return [];
    }
};

export const fetchEmailExist = async (provider: ProviderName, accessToken: string, emailId: string) => {
    if (provider === "microsoft-entra-id") {
        // fetch email details from Microsoft Graph API
        return await fetchEmailExistMicrosoft(accessToken, emailId);
    } else if (provider === "google") {
        // fetch email details from Google API
        const data = await fetchGoogleEmailDetails(accessToken, emailId);
        return !!data.id;
    } else {
        console.error("Unknown provider:", provider);
        return false;
    }
};

export const fetchSearchEmails = async (provider: ProviderName, accessToken: string, query: SearchParams): Promise<EmailPreview[]> => {
    if (flattenAndFilter(query).length === 0 || Object.keys(query).length === 0) {
        return [];
    }
    console.log("Searching emails with query:", flattenAndFilter(query));
    if (provider === "microsoft-entra-id") {
        const data = await searchEmailsMicrosoft(accessToken, query);
        return data;
    } else if (provider === "google") {
        const data = await searchEmailsGoogle(accessToken, query);
        return data;
    } else {
        return [];
    }
};
