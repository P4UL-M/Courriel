import { ThreadList } from '@/app/components/thread-list';
import { SessionProvider } from 'next-auth/react';

export default function ThreadsPage({
    params,
    searchParams,
}: {
    params: { name: string };
    searchParams: { q?: string; id?: string };
}) {
    return (
        <div className="flex h-screen">
            <SessionProvider>
                <ThreadList folderName={params.name} searchQuery={searchParams.q} />
            </SessionProvider>
        </div>
    );
}