import { ThreadHeader, ThreadList } from '@/app/components/thread-list';
import { Suspense } from 'react';
import { fetchEmails, MailFolder, ProviderName } from '@/lib/db/queries';
import { auth } from '@/auth';
import PopulateStore from '../../components/populate-store';

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
    const session = await auth();
    const threads = await fetchEmails(session?.provider as ProviderName || '', session?.accessToken || '', 10, folderName as MailFolder);

    return (
        <>
            <ThreadList folderName={folderName} threads={threads} searchQuery={q} />
            <PopulateStore data={{
                folderId: folderName,
                threads: threads.map((thread) => thread.id),
            }} />
        </>
    );
}