"use server";
// ignore linting errors
/* eslint-disable */
import { moveEmailToTrashMicrosoft } from "./actions.microsoft";
import { moveEmailToTrashGoogle } from "./actions.google";
import { moveEmailToArchiveMicrosoft } from "./actions.microsoft";
import { moveEmailToArchiveGoogle } from "./actions.google";
import { ProviderName } from "./types";

export async function sendEmailAction(_: any, formData: FormData) {
    console.log("sendEmailAction");
    return { success: true, error: null };
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
            console.log("moveEmailToTrashGoogle");
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
