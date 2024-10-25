import { LeftSidebar } from '@/app/components/left-sidebar';
import { fetchEmailExist, ProviderName } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { ThreadHeader } from '@/app/components/thread-list';
import ThreadContent, { ThreadContentSkeleton } from '../../../components/thread-content';
import { Suspense } from 'react';

export default async function EmailPage({
  params,
}: {
  params: Promise<{ name: string; id: string }>,
}) {
  const id = (await params).id;
  const session = await auth();
  const theadExist = await fetchEmailExist(session?.provider as ProviderName, session?.accessToken || '', id);

  if (!theadExist) {
    return notFound();
  }

  return (
    <div className="flex-grow h-full">
      <ThreadHeader folderName={(await params).name} />
      <div className="flex-grow h-full flex">
        <LeftSidebar />
        <div className="flex-grow p-2 sm:p-6 overflow-auto">
          <Suspense fallback={<ThreadContentSkeleton />}>
            <ThreadContent threadId={id} />
          </Suspense>
        </div>
      </div>
    </div >
  );
}
