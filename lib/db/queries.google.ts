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
