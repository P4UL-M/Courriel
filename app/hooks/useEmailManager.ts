import { useState, useCallback, useEffect } from "react";
import { Email } from "@/lib/db/types";
import { fetchEmails, MailFolder, ProviderName } from "@/lib/db/queries";

// Main hook to manage the email list
export const useEmailManager = (provider: ProviderName, accessToken: string, folder: string) => {
    const [emails, setEmails] = useState<Email[]>([]); // State to store all emails
    const [nextIndex, setNextIndex] = useState<string | undefined>(undefined); // Track the current index for pagination
    const [loading, setLoading] = useState(false); // Loading state for fetching emails

    const fetchInitialEmails = useCallback(async () => {
        try {
            // Fetch 10 emails for the initial load
            const { data, nextLink } = await fetchEmails(provider, accessToken, folder as MailFolder, 20);
            setEmails(data);
            if (nextLink) {
                setNextIndex(nextLink); // Update the index
            }
        } catch (error) {
            console.error("Error fetching initial emails:", error);
        }
    }, [provider, accessToken, folder]);

    // Fetch function for initial or next set of emails
    const fetchNextEmails = useCallback(async () => {
        if (!nextIndex || emails.length == 0) return; // Return if no next index or no emails initially
        setLoading(true);
        try {
            // Fetch 10 emails from the current index
            const { data: nextEmails, nextLink } = await fetchEmails(provider, accessToken, folder as MailFolder, 10, nextIndex);
            if (nextEmails.length > 0) {
                setEmails((prevEmails) => [...prevEmails, ...nextEmails]);
                setNextIndex(nextLink); // Update the index
            }
        } catch (error) {
            console.error("Error fetching next emails:", error);
        } finally {
            setLoading(false);
        }
    }, [provider, accessToken, folder, emails, nextIndex, setLoading]);

    // Check for new emails and add them to the top
    const checkNewEmails = useCallback(async () => {
        setLoading(true);
        try {
            const { data: latestEmails } = await fetchEmails(provider, accessToken, folder as MailFolder, 10);
            const newEmails = latestEmails.filter((latest) => !emails.some((existing) => existing.id === latest.id));

            if (newEmails.length > 0) {
                setEmails((prevEmails) => [...newEmails, ...prevEmails]);
            }
        } catch (error) {
            console.error("Error checking for new emails:", error);
        } finally {
            setLoading(false);
        }
    }, [provider, accessToken, emails, folder, setLoading]);

    useEffect(() => {
        fetchInitialEmails();
    }, [fetchInitialEmails]);

    return {
        emails,
        fetchNextEmails,
        checkNewEmails,
        loading,
    };
};
