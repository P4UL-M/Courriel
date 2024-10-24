import { LeftSidebar } from '@/app/components/left-sidebar';
import { fetchEmailsDetails } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { ThreadActions } from '@/app/components/thread-actions';
import { auth } from '../../../../auth';
import { ThreadHeader } from '../../../components/thread-list';
import ShadowWrapper from '../../../../components/ui/shadow-wrapper';

export default async function EmailPage({
  params,
}: {
  params: Promise<{ name: string; id: string }>,
}) {
  const id = (await params).id;
  const session = await auth();
  // const { nextId, prevId } = await fetchPrevAndNextEmails(session?.provider || '', session?.accessToken || '', id);
  const thread = await fetchEmailsDetails(session?.provider || '', session?.accessToken || '', id);

  if (!thread) {
    return notFound();
  }

  return (
    <div className="flex-grow h-full">
      <ThreadHeader folderName={(await params).name} />
      <div className="flex-grow h-full flex">
        <LeftSidebar />
        <div className="flex-grow p-2 sm:p-6 overflow-auto">
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
                    {thread.sender.name} {'<'}{thread.sender.email}{'>'} to{' '}
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
                  <ShadowWrapper content={thread.body as string} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
