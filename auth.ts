import NextAuth from "next-auth";
import { Provider } from "next-auth/providers";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { ProviderName } from "./lib/db/types";

const providers: Provider[] = [
    MicrosoftEntraID({
        clientId: process.env.MICROSOFT_ENTRA_ID_CLIENT_ID!,
        clientSecret: process.env.MICROSOFT_ENTRA_ID_CLIENT_SECRET!,
        authorization: {
            params: {
                scope: "openid profile email User.Read Mail.ReadWrite Mail.Send",
            },
        },
        profilePhotoSize: 48,
    }),
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
            params: {
                scope: "openid profile email https://www.googleapis.com/auth/gmail.modify",
            },
        },
    }),
];

export const providerMap = providers.map((provider) => {
    if (typeof provider === "function") {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
    } else {
        return { id: provider.id, name: provider.name };
    }
});

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers,
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth;
        },
        jwt: async ({ token, account }) => {
            // Add property to token, so we can check if user is authenticated
            if (account?.access_token) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
            }
            return token;
        },
        session: async ({ session, token }) => {
            // Add property to session, so we can check if user is authenticated
            if (token?.accessToken) {
                session.accessToken = token.accessToken as string;
                session.provider = token.provider as ProviderName;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});
