import { signOut } from "next-auth/react";

export type GoogleEmail = gapi.client.gmail.Message;
export type GoogleEmailResponse = Pick<gapi.client.gmail.Message, "id" | "threadId">;

export async function fetchGoogleEmails(accessToken: string, number: number = 10): Promise<GoogleEmail[]> {
    try {
        // Google API endpoint for fetching Gmail messages
        const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        // Fetch the first 5 emails (you can adjust the number)
        return await Promise.all(
            data.messages.slice(0, number).map(async (message: GoogleEmailResponse) => {
                const messageResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                    },
                });

                const messageData: gapi.client.gmail.Message = await messageResponse.json();

                return messageData;
            })
        );
    } catch (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
}

export async function fetchGoogleEmailDetails(accessToken: string, emailId: string): Promise<GoogleEmail> {
    try {
        const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // check if the response is successful
        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized, token is expired
                console.log("Unauthorized, token is expired");
                signOut();
            }
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching email details:", error);
        return {} as GoogleEmail;
    }
}

// Function to decode base64-encoded email content
export const decodeBase64 = (encodedString: string): string => {
    // Gmail uses URL-safe base64 encoding, so we need to replace certain characters
    const decodedString = Buffer.from(encodedString.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    return decodedString;
};

// Recursive function to extract the email body (text/plain or text/html)
export const getEmailBody = (parts: gapi.client.gmail.MessagePart[]): string => {
    let htmlBody = "";
    let textBody = "";

    for (const part of parts) {
        // If the part is HTML, prioritize it
        if (part.mimeType === "text/html" && part.body?.data) {
            htmlBody = decodeBase64(part.body.data);
        }
        // If the part is plain text, store it as a fallback
        if (part.mimeType === "text/plain" && part.body?.data) {
            textBody = decodeBase64(part.body.data);
        }

        // Recursively check sub-parts if present
        if (part.parts) {
            const result = getEmailBody(part.parts);
            if (result) {
                // Prioritize HTML if found in nested parts
                if (part.mimeType === "text/html") return result;
                // Otherwise, return plain text if no HTML was found
                return result;
            }
        }
    }

    // Return HTML if found, otherwise fallback to plain text
    return htmlBody || textBody;
};
