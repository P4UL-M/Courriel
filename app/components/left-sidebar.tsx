'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEmailStore } from '../store/emailStore';

export function LeftSidebar() {
    const { name, id } = useParams();
    const router = useRouter();

    // get id of next and previous thread
    const idDecoded = decodeURIComponent(id as string);
    const nextId = useEmailStore((state) => state.getNextThread(name as string, idDecoded as string));
    const prevId = useEmailStore((state) => state.getPreviousThread(name as string, idDecoded as string));

    return (
        <div className="bg-gray-100 flex flex-col items-center py-6 space-y-4 pl-2 sm:pl-4 pr-2 sm:pr-24 dark:bg-gray-800">
            <Link href={`/f/${name}`} passHref>
                <Button
                    size="lg"
                    variant="outline"
                    className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
                >
                    <ArrowLeft className="size-4 sm:size-5" />
                </Button>
            </Link>
            <Button
                size="lg"
                variant="outline"
                className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
                onClick={() => router.push(`/f/${name}/${prevId}`)}
                disabled={!prevId}
            >
                <ChevronUp className="size-4 sm:size-5" />
            </Button>
            <Button
                size="lg"
                variant="outline"
                className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
                onClick={() => router.push(`/f/${name}/${nextId}`)}
                disabled={!nextId}
            >
                <ChevronDown className="size-4 sm:size-5" />
            </Button>
        </div>
    );
}
