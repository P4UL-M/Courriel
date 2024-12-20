/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import { ProviderName } from "../lib/db/types";

// Extend the built-in session interface
declare module "next-auth" {
    interface Session {
        accessToken?: string; // Add the accessToken to the session
        provider?: ProviderName; // Add the provider to the session
    }

    interface User {
        accessToken?: string; // You can add more fields if needed
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string; // Include accessToken in JWT as well
    }
}
