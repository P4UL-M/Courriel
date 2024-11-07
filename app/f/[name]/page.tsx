import { ThreadList } from '@/app/components/thread-list';
import { SessionProvider } from 'next-auth/react';

export default async function ThreadsPage({
    params,
    searchParams,
}: {
    params: { name: string };
    searchParams: { q?: string; id?: string };
}) {
    const { name } = await params;
    const { q } = await searchParams;

    return (
        <div className="flex h-screen">
            <SessionProvider>
                <ThreadList folderName={name} searchQuery={q} />
            </SessionProvider>
        </div>
    );
}