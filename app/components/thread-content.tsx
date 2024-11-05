'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { fetchEmailsDetails } from "@/lib/db/queries";
import ShadowWrapper from "@/components/ui/shadow-wrapper";
import ThreadAttachments from "./thread-attachments";
import { useEffect, useState } from "react";
import { Email, ProviderName } from "@/lib/db/types";
import { ThreadActions } from "./thread-actions";
import { FileAttachment } from "@microsoft/microsoft-graph-types";
import { redirect } from "next/navigation";


type ThreadContentProps = {
    threadId: string;
};

export const ThreadContentSkeleton = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 mx-6">
                <div className="w-1/2 h-6 bg-gray-300 rounded mt-4 sm:mt-0 dark:bg-gray-700"></div>
                <div className="flex items-center space-x-1 flex-shrink-0 mt-2 sm:mt-0">
                    <div className="w-12 h-6 bg-gray-300 rounded  dark:bg-gray-700"></div>
                    <div className="w-10 h-6 bg-gray-300 rounded dark:bg-gray-700"></div>
                </div>
            </div>

            <div className="bg-gray-50 py-4 px-6 rounded-lg dark:bg-gray-950">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                    <div className="w-1/3 h-6 bg-gray-300 rounded dark:bg-gray-700"></div>
                    <div className="w-1/4 h-4 bg-gray-200 rounded mt-2 sm:mt-0 dark:bg-gray-800"></div>
                </div>
                <div className="py-5 space-y-2">
                    <div className="h-4 bg-gray-200 rounded dark:bg-gray-800"></div>
                    <div className="h-4 bg-gray-200 rounded  dark:bg-gray-800"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3  dark:bg-gray-800"></div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="w-1/5 h-4 bg-gray-200 rounded  dark:bg-gray-800"></div>
                </div>
            </div>
        </div>
    )
}

const ThreadContent = ({ threadId }: ThreadContentProps) => {

    const { data: session } = useSession();
    const [thread, setThread] = useState<Email | null>(null);
    const [body, setBody] = useState<string | null>('');
    const [cidAttachments, setCidAttachments] = useState<FileAttachment[]>([]);

    useEffect(() => {
        if (!session) {
            return;
        } else {
            fetchEmailsDetails(session?.provider as ProviderName || '', session?.accessToken || '', threadId).then(data => {
                setThread(data)
                setBody(data.body || null)
            });
        }
    }, [session, threadId]);

    useEffect(() => {
        if (!thread) {
            return;
        }

        const cidRegex = /cid:([^'">]+)/g;
        let match: RegExpExecArray | null;

        let body = thread.body;

        while ((match = cidRegex.exec(body!)) !== null) {
            const cid = match[1];
            const attachment = cidAttachments.find((attachment) => attachment.contentId === cid);
            if (attachment) {
                const dataUrl = `data:${attachment.contentType};base64,${attachment.contentBytes}`;
                body = body?.replace(`cid:${cid}`, dataUrl);
            }
        }
        setBody(body!);
    }, [cidAttachments, setBody, thread]);

    if (!thread) {
        return <ThreadContentSkeleton />;
    }

    if (!session) {
        return null;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 mx-6">
                <h1 className="text-2xl font-semibold pr-4 flex-grow max-w-2xl mt-4 sm:mt-0">
                    {thread.subject}
                </h1>
                <div className="flex items-center space-x-1 flex-shrink-0 mt-2 sm:mt-0">
                    <button className="text-gray-700 text-sm font-medium mr-2 dark:text-gray-400">
                        Share
                    </button>
                    <ThreadActions threadId={thread.id} provider={session.provider!} accessToken={session.accessToken!} callback={(action) => redirect('/f/' + action)} />
                </div>
            </div>
            <div className="space-y-6">
                <div key={thread.id} className="bg-gray-50 py-4 px-6 rounded-lg dark:bg-gray-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                        <div className="font-semibold">
                            {thread.sender.name === session?.user?.email ?
                                'Me'
                                : thread.sender.name || thread.sender.email} to{' '}
                            {thread.recipients?.[0].email === session?.user?.email
                                ? 'Me'
                                : thread.recipients?.[0].name || thread.recipients?.[0].email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(thread.sentDate!).toLocaleString()}
                        </div>
                    </div>
                    <div className="py-5 dark:bg-gray-50 dark:text-gray-950 rounded-lg">
                        {/* {thread.body} */}
                        <ShadowWrapper content={body!} />

                        <div className="flex items-center justify-between dark:bg-gray-50 dark:text-gray-950 py-5">
                            <ThreadAttachments emailId={thread.id} setCidAttachments={setCidAttachments} />
                        </div>
                    </div>
                </div>
                {/* make a empty space for scroll view */}
                <div className="h-20"></div>
            </div>
        </div >
    );
}

const ThreadContentWrapper = ({ threadId }: ThreadContentProps) => {
    return (
        <SessionProvider>
            <ThreadContent threadId={threadId} />
        </SessionProvider>
    );
}

export default ThreadContentWrapper as typeof ThreadContent;