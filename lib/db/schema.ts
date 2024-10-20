// Table: Users
export interface User {
    id: number; // serial -> number
    firstName?: string | null; // varchar(50) -> string | null, optional
    lastName?: string | null; // varchar(50) -> string | null, optional
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
    id: number; // serial -> number
    threadId: number; // integer -> number
    senderId: number; // integer -> number
    recipientId: number; // integer -> number
    subject?: string | null; // varchar(255) -> string | null, optional
    body?: string | null; // text -> string | null, optional
    sentDate: Date; // timestamp -> Date
}

// Table: Folders
export interface Folder {
    id: number; // serial -> number
    name: string; // varchar(50), not null
}

// Table: UserFolders
export interface UserFolder {
    id: number; // serial -> number
    userId: number; // integer -> number
    folderId: number; // integer -> number
}

// Table: ThreadFolders
export interface ThreadFolder {
    id: number; // serial -> number
    threadId: number; // integer -> number
    folderId: number; // integer -> number
}

// Relationships: User
export interface UserRelations {
    sentEmails: Email[]; // Many-to-many relationship to emails as sender
    receivedEmails: Email[]; // Many-to-many relationship to emails as recipient
    userFolders: UserFolder[]; // Many-to-one relationship to userFolders
}

// Relationships: Thread
export interface ThreadRelations {
    emails: Email[]; // Many-to-one relationship to emails
    threadFolders: ThreadFolder[]; // Many-to-one relationship to threadFolders
}

// Relationships: Email
export interface EmailRelations {
    thread: Thread; // One-to-one relationship to thread
    sender: User; // One-to-one relationship to sender (user)
    recipient: User; // One-to-one relationship to recipient (user)
}

// Relationships: Folder
export interface FolderRelations {
    userFolders: UserFolder[]; // Many-to-one relationship to userFolders
    threadFolders: ThreadFolder[]; // Many-to-one relationship to threadFolders
}

// Relationships: UserFolder
export interface UserFolderRelations {
    user: User; // One-to-one relationship to user
    folder: Folder; // One-to-one relationship to folder
}

// Relationships: ThreadFolder
export interface ThreadFolderRelations {
    thread: Thread; // One-to-one relationship to thread
    folder: Folder; // One-to-one relationship to folder
}
