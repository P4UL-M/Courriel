import { NavMenu } from '../components/menu';
import Link from 'next/link';
import { X } from 'lucide-react';
import { flattenAndFilter, formatEmailString, highlightText, parseFilter } from '@/lib/utils';
import { Search } from '../components/search';
import { Suspense } from 'react';
import { fetchSearchEmails } from '../../lib/db/queries';
import { auth } from '../../auth';
import { ThreadSkeleton } from '../components/thread-list';

async function Threads({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  const session = await auth();

  if (!session) return null;

  const [query] = await parseFilter((await searchParams).q || '');
  const threads = await fetchSearchEmails(session.provider!, session.accessToken!, query);

  const filters = flattenAndFilter(query);
  const q = filters.find((f) => f.q !== undefined)?.q;
  const sender = filters.find((f) => f.sender !== undefined)?.sender;
  const subject = filters.find((f) => f.subject !== undefined)?.subject;

  return (
    <div className="overflow-auto h-[calc(100vh-64px)]">
      {threads.length > 0 ? (
        threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/f/inbox/${thread.id}`} // the folder name is hardcoded here but the right mail will still be shown, just not from the right folder (get the folder name require another query and might not return the root folder name)
            className="block hover:bg-gray-50 cursor-pointer border-b border-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div
              className="flex items-center"
            >
              <div className="flex-grow flex items-center overflow-hidden p-4">
                <div className="w-[200px] flex-shrink-0 mr-4 truncate">
                  <span className="font-medium truncate">
                    {highlightText(formatEmailString(thread.sender), sender || q || '')}
                  </span>
                </div>
                <div className="flex-grow flex items-center overflow-hidden">
                  <span className="font-medium truncate min-w-[175px] max-w-[400px] mr-2">
                    {highlightText(thread.subject, subject || q || '')}
                  </span>
                  <span className="text-gray-600 truncate dark:text-gray-400">
                    {highlightText(thread.bodyPreview, q || '')}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end flex-shrink-0 w-40 p-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(thread.sentDate!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="p-4 text-gray-500">No results found</div>
      )}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {

  return (
    <div className="flex h-screen">
      <div className="flex-grow border-r border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 h-[70px]">
          <div className="flex items-center w-full">
            <NavMenu />
            <Suspense>
              <Search />
            </Suspense>
          </div>
          <div className="flex items-center ml-4">
            <Link href="/" passHref>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </Link>
          </div>
        </div>
        <Suspense fallback={<ThreadSkeleton />}>
          <Threads searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
