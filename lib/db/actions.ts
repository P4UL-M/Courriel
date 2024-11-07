"use server";
// ignore linting errors
/* eslint-disable */
import { moveEmailToTrashMicrosoft } from "./actions.microsoft";
import { moveEmailToTrashGoogle } from "./actions.google";
import { moveEmailToArchiveMicrosoft } from "./actions.microsoft";
import { moveEmailToArchiveGoogle } from "./actions.google";
import { sendEmailMicrosoft } from "./actions.microsoft";
import { sendEmailGoogle } from "./actions.google";
import { ProviderName } from "./types";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const sendEmailSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Body is required"),
    recipientEmail: z.string().email("Invalid email address"),
});

export async function sendEmailAction(_: any, formData: FormData) {
    try {
        let validatedData = sendEmailSchema.parse({
            subject: formData.get("subject"),
            body: formData.get("body"),
            recipientEmail: formData.get("recipientEmail"),
        });

        let { subject, body, recipientEmail } = validatedData;
        let provider = formData.get("provider") as ProviderName;
        let accessToken = formData.get("accessToken") as string;

        if (!provider || !accessToken) {
            throw new Error("Missing provider or access token");
        }

        if (provider === "microsoft-entra-id") {
            await sendEmailMicrosoft(accessToken, subject, body, recipientEmail);
            return { success: true, error: null };
        } else if (provider === "google") {
            const newThread = await sendEmailGoogle(accessToken, subject, body, recipientEmail);
            // redirect to sent page if successful
            revalidatePath("/", "layout");
            redirect(`/f/sent/${newThread.id}`);
        } else {
            throw new Error("Unknown provider");
        }
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message, success: false };
        }
        return {
            error: "Failed to send email. Please try again.",
            success: false,
        };
    }
}

export async function moveThreadToTrash(_: any, formData: FormData) {
    const provider = formData.get("provider") as ProviderName;
    const accessToken = formData.get("accessToken") as string;
    const emailId = formData.get("threadId") as string;

    if (!provider || !accessToken || !emailId) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        if (provider === "microsoft-entra-id") {
            await moveEmailToTrashMicrosoft(accessToken, emailId);
        } else if (provider === "google") {
            await moveEmailToTrashGoogle(accessToken, emailId);
        } else {
            throw new Error("Unknown provider");
        }
        return { success: true, error: null };
    } catch (error: any) {
        console.error("Error moving thread to trash:", error);
        return { success: false, error: error.message };
    }
}

export async function moveThreadToDone(_: any, formData: FormData) {
    const provider = formData.get("provider") as ProviderName;
    const accessToken = formData.get("accessToken") as string;
    const emailId = formData.get("threadId") as string;

    if (!provider || !accessToken || !emailId) {
        return { success: false, error: "Missing required fields" };
    }

    try {
        if (provider === "microsoft-entra-id") {
            await moveEmailToArchiveMicrosoft(accessToken, emailId);
        } else if (provider === "google") {
            await moveEmailToArchiveGoogle(accessToken, emailId);
        } else {
            throw new Error("Unknown provider");
        }
        return { success: true, error: null };
    } catch (error: any) {
        console.error("Error moving thread to archive:", error);
        return { success: false, error: error.message };
    }
}
