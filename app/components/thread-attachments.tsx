'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { fetchEmailAttachments, ProviderName } from '@/lib/db/queries';
import { File } from 'lucide-react'; // Import the file icon from lucide-react
import { FileAttachment } from '@microsoft/microsoft-graph-types';
import Image from 'next/image';


type EmailAttachmentsProps = {
    emailId: string;
    setCidAttachments?: (attachments: FileAttachment[]) => void;
};


const ThreadAttachments = ({ emailId, setCidAttachments }: EmailAttachmentsProps) => {
    const [attachments, setAttachments] = useState<microsoftgraph.FileAttachment[]>([]);
    const { data: session } = useSession(); // Get provider and access token from auth.js
    const accessToken = session?.accessToken;
    const provider = session?.provider;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttachments = async () => {
            if (!accessToken || !provider || !emailId) return;

            setLoading(true);
            try {
                const attachmentsData = await fetchEmailAttachments(provider as ProviderName, accessToken, emailId);
                setAttachments(attachmentsData);
            } catch (error) {
                console.error('Error fetching attachments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttachments();
    }, [emailId, provider, accessToken]);

    useEffect(() => {
        if (attachments.length && setCidAttachments) {
            setCidAttachments(attachments.filter((attachment) => attachment.isInline));
        }
    }, [attachments, setCidAttachments]);

    const isImage = (attachment: microsoftgraph.FileAttachment) => {
        // Check if the MIME type of the attachment starts with 'image/'
        return attachment.contentType?.startsWith('image/');
    };

    const getAttachmentUrl = (attachment: microsoftgraph.FileAttachment) => {
        // Create a data URL from the base64 content
        return `data:${attachment.contentType};base64,${attachment.contentBytes}`;
    };

    if (loading) {
        return <p className="text-gray-500 text-lg font-medium animate-pulse text-center">
            Loading attachments...
        </p>;
    }

    if (!attachments.length) {
        return null;
    }

    return (
        <>
            {attachments.length > 0 ? (
                attachments.map((attachment, index) => (
                    <div key={index} className="mb-4 attachment-item">
                        {isImage(attachment) ? (
                            <Image
                                src={getAttachmentUrl(attachment)}
                                alt={attachment.name || 'Attachment'}
                                width={300}
                                height={300}
                                className="max-w-full h-auto object-cover" // Makes the image responsive
                            />
                        ) : (
                            <a
                                href={getAttachmentUrl(attachment)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center underline text-gray-800 hover:text-blue-600"
                            >
                                <File className="w-5 h-5 mr-2 file-icon" /> {/* Lucide-react File icon */}
                                {attachment.name}
                            </a>
                        )}
                    </div>
                ))
            ) : (
                <p>No attachments found</p>
            )}
        </>
    );
};

const ThreadAttachmentsWrapper = ({ emailId, setCidAttachments }: EmailAttachmentsProps) => {
    return (
        <SessionProvider>
            <ThreadAttachments emailId={emailId} setCidAttachments={setCidAttachments} />
        </SessionProvider>
    );
}

export default ThreadAttachmentsWrapper;