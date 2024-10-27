// Table: Users
export interface User {
    id: number; // serial -> number
    name?: string; // varchar(50) -> string | null, optional
    email: string; // varchar(255), not null
    jobTitle?: string | null; // varchar(100) -> string | null, optional
    company?: string | null; // varchar(100) -> string | null, optional
    location?: string | null; // varchar(100) -> string | null, optional
    twitter?: string | null; // varchar(100) -> string | null, optional
    linkedin?: string | null; // varchar(100) -> string | null, optional
    github?: string | null; // varchar(100) -> string | null, optional
    avatarUrl?: string | null; // varchar(255) -> string | null, optional
}

// Table: Threads
export interface Thread {
    id: number; // serial -> number
    subject?: string | null; // varchar(255) -> string | null, optional
    lastActivityDate: Date; // timestamp -> Date
}

// Table: Emails
export interface Email {
    id: string;
    sender: Pick<User, "name" | "email">; // integer -> number
    recipients: Pick<User, "name" | "email">[]; // integer -> number
    subject?: string | null; // varchar(255) -> string | null, optional
    body?: string | null; // text -> string | null, optional
    sentDate: Date; // timestamp -> Date
    hasAttachments: boolean; // boolean -> boolean
}

// Table: Attachments
export interface Attachment {
    id: string;
    emailId: string;
    name: string;
    size: number;
    url?: string;
    data?: string;
}

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
