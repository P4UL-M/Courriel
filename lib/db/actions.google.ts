import { signOut } from "next-auth/react";

export const moveEmailToTrashGoogle = async (accessToken: string, emailId: string) => {
    try {
        const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${emailId}/trash`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) signOut();
            throw new Error("Failed to move email to trash");
        }
        return await response.json();
    } catch (error) {
        console.error("Error moving email to trash:", error);
        return null;
    }
};

export const moveEmailToArchiveGoogle = async (accessToken: string, emailId: string) => {
    try {
        const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                removeLabelIds: ["INBOX"],
            }),
        });

        if (!response.ok) {
            if (response.status === 401) signOut();
            throw new Error("Failed to move email to archive");
        }
        return await response.json();
    } catch (error) {
        console.error("Error moving email to archive:", error);
        return null;
    }
};
