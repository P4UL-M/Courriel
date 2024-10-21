"use server";

export async function sendEmailAction(_: any, formData: FormData) {
    console.log("sendEmailAction");
    return { success: true, error: null };
}

export async function moveThreadToDone(_: any, formData: FormData) {
    console.log("moveThreadToDone");
    return { success: true, error: null };
}

export async function moveThreadToTrash(_: any, formData: FormData) {
    console.log("moveThreadToTrash");
    return { success: true, error: null };
}
