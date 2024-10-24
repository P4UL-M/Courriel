"use client";

import { useEffect } from "react";
import { useEmailStore } from "../store/emailStore";

export default function PopulateStore({ data }: { data: { folderId: string, threads: string[] } }) {
    const { folderId, threads } = data;

    const setThreadsByFolder = useEmailStore(state => state.setThreadsByFolder);

    useEffect(() => {
        setThreadsByFolder(folderId, threads);
    });
    return <></>;
}