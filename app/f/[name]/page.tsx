import { ThreadHeader, ThreadList } from '@/app/components/thread-list';
import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';

export default function ThreadsPage({
    params,
    searchParams,
}: {
    params: { name: string };
    searchParams: { q?: string; id?: string };
}) {
    const name = params.name;

    return (
        <div className="flex h-screen">
            <Suspense fallback={<ThreadsSkeleton folderName={name} />}>
                <Threads folderName={name} searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

function ThreadsSkeleton({ folderName }: { folderName: string }) {
    return (
        <div className="flex-grow border-r border-gray-200 overflow-hidden">
            <ThreadHeader folderName={folderName} />
        </div>
    );
}

async function Threads({
    folderName,
    searchParams,
}: {
    folderName: string;
    searchParams: { q?: string; id?: string };
}) {
    const q = searchParams.q || '';

    return (
        <SessionProvider>
            <ThreadList folderName={folderName} searchQuery={q} />
        </SessionProvider>
    );
}