import * as microsoftgraph from "@microsoft/microsoft-graph-types";

// Fetch emails from Microsoft Graph API
export const fetchEmailsMicrosoft = async (accessToken: string, number: number = 10) => {
    try {
        // Microsoft Graph API endpoint for fetching emails
        const response = await fetch(
            "https://graph.microsoft.com/v1.0/me/messages?" +
                new URLSearchParams({
                    $top: number.toString(),
                }),
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const data = await response.json();

        return data.value as microsoftgraph.Message[];
    } catch (error) {
        console.error("Error fetching emails:", error);
        return [];
    }
};
