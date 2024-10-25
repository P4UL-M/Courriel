'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { fetchEmailsDetails, ProviderName } from "@/lib/db/queries";
import ShadowWrapper from "@/components/ui/shadow-wrapper";
import ThreadAttachments from "./thread-attachments";
import { useEffect, useState } from "react";
import { Email } from "@/lib/db/types";
import { ThreadActions } from "./thread-actions";
import { FileAttachment } from "@microsoft/microsoft-graph-types";


type ThreadContentProps = {
    threadId: string;
};

export const ThreadContentSkeleton = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 mx-6">
                <div className="w-1/2 h-6 bg-gray-300 rounded mt-4 sm:mt-0"></div>
                <div className="flex items-center space-x-1 flex-shrink-0 mt-2 sm:mt-0">
                    <div className="w-12 h-6 bg-gray-300 rounded"></div>
                    <div className="w-10 h-6 bg-gray-300 rounded"></div>
                </div>
            </div>

            <div className="bg-gray-50 py-4 px-6 rounded-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                    <div className="w-1/3 h-6 bg-gray-300 rounded"></div>
                    <div className="w-1/4 h-4 bg-gray-200 rounded mt-2 sm:mt-0"></div>
                </div>
                <div className="py-5 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="w-1/5 h-4 bg-gray-200 rounded"></div>
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

        const cidRegex = /cid:([a-zA-Z0-9@.]+)/g;
        let match: RegExpExecArray | null;

        let body = thread.body;

        while ((match = cidRegex.exec(body!)) !== null) {
            console.log(match);
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
        return (
            <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-6 mx-6">
                    <div className="w-1/2 h-6 bg-gray-300 rounded mt-4 sm:mt-0"></div>
                    <div className="flex items-center space-x-1 flex-shrink-0 mt-2 sm:mt-0">
                        <div className="w-12 h-6 bg-gray-300 rounded"></div>
                        <div className="w-10 h-6 bg-gray-300 rounded"></div>
                    </div>
                </div>

                <div className="bg-gray-50 py-4 px-6 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                        <div className="w-1/3 h-6 bg-gray-300 rounded"></div>
                        <div className="w-1/4 h-4 bg-gray-200 rounded mt-2 sm:mt-0"></div>
                    </div>
                    <div className="py-5 space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-1/5 h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 mx-6">
                <h1 className="text-2xl font-semibold pr-4 flex-grow max-w-2xl mt-4 sm:mt-0">
                    {thread.subject}
                </h1>
                <div className="flex items-center space-x-1 flex-shrink-0 mt-2 sm:mt-0">
                    <button className="text-gray-700 text-sm font-medium mr-2">
                        Share
                    </button>
                    <ThreadActions threadId={thread.id} />
                </div>
            </div>
            <div className="space-y-6">
                <div key={thread.id} className="bg-gray-50 py-4 px-6 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                        <div className="font-semibold">
                            {thread.sender.name === session?.user?.email ?
                                'Me'
                                : thread.sender.name || thread.sender.email} to{' '}
                            {thread.recipients[0].email === session?.user?.email
                                ? 'Me'
                                : thread.recipients[0].name || thread.recipients[0].email}
                        </div>
                        <div className="text-sm text-gray-500">
                            {new Date(thread.sentDate!).toLocaleString()}
                        </div>
                    </div>
                    <div className="py-5">
                        {/* {thread.body} */}
                        <ShadowWrapper content={body!} />
                    </div>
                    <div className="flex items-center justify-between">
                        <ThreadAttachments emailId={thread.id} setCidAttachments={setCidAttachments} />
                    </div>
                </div>
            </div>
        </div>
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