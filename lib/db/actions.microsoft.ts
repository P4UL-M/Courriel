import { signOut } from "next-auth/react";

export const moveEmailToTrashMicrosoft = async (accessToken: string, emailId: string) => {
    try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${emailId}/move`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                destinationId: "deleteditems",
            }),
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

export const moveEmailToArchiveMicrosoft = async (accessToken: string, emailId: string) => {
    try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${emailId}/move`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                destinationId: "archive",
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

export const sendEmailMicrosoft = async (accessToken: string, subject: string, body: string, recipientEmail: string) => {
    try {
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/sendMail`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: {
                    subject: subject,
                    body: {
                        contentType: "Text",
                        content: body,
                    },
                    toRecipients: [
                        {
                            emailAddress: {
                                address: recipientEmail,
                            },
                        },
                    ],
                },
            }),
        });

        if (!response.ok) {
            if (response.status === 401) signOut();
            throw new Error("Failed to send email");
        }
        return {};
    } catch (error) {
        console.error("Error sending email:", error);
        return null;
    }
};
