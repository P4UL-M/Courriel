import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [
        MicrosoftEntraID({
            clientId: process.env.MICROSOFT_ENTRA_ID_CLIENT_ID!,
            clientSecret: process.env.MICROSOFT_ENTRA_ID_CLIENT_SECRET!,
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth;
        },
    },
});
