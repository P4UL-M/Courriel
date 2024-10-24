'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { PenSquare, Search } from 'lucide-react';
import { NavMenu } from './menu';
import { formatEmailString } from '@/lib/utils';
import { Email } from '@/lib/db/types';
import { ThreadActions } from '@/app/components/thread-actions';
import UserIconWrapper, { UserIconSkeleton } from './user-icon';

interface ThreadListProps {
  folderName: string;
  threads: Email[];
  searchQuery?: string;
}

export function ThreadHeader({
  folderName,
  count,
}: {
  folderName: string;
  count?: number | undefined;
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 h-[70px]">
      <div className="flex items-center">
        <NavMenu />
        <h1 className="text-xl font-semibold flex items-center capitalize">
          {folderName}
          <span className="ml-2 text-sm text-gray-400">{count}</span>
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <Link
          href={`/f/${folderName}/new`}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <PenSquare size={18} />
        </Link>
        <Link
          href="/search"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Search size={18} />
        </Link>
        <div
          className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'
        >
          <Suspense fallback={<UserIconSkeleton />}>
            <UserIconWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export function ThreadList({ folderName, threads }: ThreadListProps) {
  const [hoveredThread, setHoveredThread] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia('(hover: none)').matches);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const handleMouseEnter = (threadId: string) => {
    if (!isMobile) {
      setHoveredThread(threadId);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredThread(null);
    }
  };

  return (
    <div className="flex-grow border-r border-gray-200 overflow-hidden">
      <ThreadHeader folderName={folderName} count={threads.length} />
      <div className="overflow-auto h-[calc(100vh-64px)]">
        {threads.map((thread) => {
          return (
            <Link
              key={thread.id}
              href={`/f/${folderName.toLowerCase()}/${thread.id}`}
              className="block hover:bg-gray-50 cursor-pointer border-b border-gray-100"
            >
              <div
                className="flex items-center"
                onMouseEnter={() => handleMouseEnter(thread.id)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex-grow flex items-center overflow-hidden p-4">
                  <div className="w-[200px] flex-shrink-0 mr-4 truncate">
                    <span className="font-medium truncate">
                      {formatEmailString(thread.sender)}
                    </span>
                  </div>
                  <div className="flex-grow flex items-center overflow-hidden">
                    <span className="font-medium truncate min-w-[175px] max-w-[400px] mr-2">
                      {thread.subject}
                    </span>
                    <span className="text-gray-600 truncate">
                      {thread.body}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end flex-shrink-0 w-40 p-4">
                  {!isMobile && hoveredThread === thread.id ? (
                    <ThreadActions threadId={thread.id} />
                  ) : (
                    <span className="text-sm text-gray-500">
                      {new Date(thread.sentDate!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
