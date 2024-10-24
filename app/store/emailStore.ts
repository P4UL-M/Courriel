// stores/emailStore.ts
import { create } from "zustand";

interface EmailStoreState {
    threadsByFolder: Record<string, string[]>; // Storing thread IDs by folder ID
    setThreadsByFolder: (folderId: string, threadIds: string[]) => void;
    addThreadsToFolder: (folderId: string, threadIds: string[]) => void;
    getThreadsByFolder: (folderId: string) => string[] | undefined;
    getNextThread: (folderId: string, threadId: string) => string | undefined;
    getPreviousThread: (folderId: string, threadId: string) => string | undefined;
}

export const useEmailStore = create<EmailStoreState>((set, get) => ({
    threadsByFolder: {},

    // Adds thread IDs to the specified folder
    addThreadsToFolder: (folderId, threadIds) =>
        set((state) => ({
            threadsByFolder: {
                ...state.threadsByFolder,
                [folderId]: [...(state.threadsByFolder[folderId] || []), ...threadIds],
            },
        })),

    // Sets thread IDs for the specified folder
    setThreadsByFolder: (folderId, threadIds) =>
        set((state) => ({
            threadsByFolder: {
                ...state.threadsByFolder,
                [folderId]: threadIds,
            },
        })),

    // Retrieves thread IDs for a given folder
    getThreadsByFolder: (folderId) => {
        return get().threadsByFolder[folderId] || undefined;
    },

    // Retrieves the next thread ID in the folder
    getNextThread: (folderId, threadId) => {
        const threads = get().threadsByFolder[folderId] || [];
        const currentIndex = threads.indexOf(threadId);
        return threads[currentIndex + 1] || undefined;
    },

    // Retrieves the previous thread ID in the folder
    getPreviousThread: (folderId, threadId) => {
        const threads = get().threadsByFolder[folderId] || [];
        const currentIndex = threads.indexOf(threadId);
        return threads[currentIndex - 1] || undefined;
    },
}));
