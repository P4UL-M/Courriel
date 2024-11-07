'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { PenSquare, RefreshCw, Search } from 'lucide-react';
import { NavMenu } from './menu';
import { formatEmailString } from '@/lib/utils';
import { ThreadActions } from '@/app/components/thread-actions';
import UserIconWrapper from './user-icon';
import { useEmailManager } from '../hooks/useEmailManager';
import { useSession } from 'next-auth/react';
import { useEmailStore } from '../store/emailStore';
import { ProviderName } from "@/lib/db/types";

interface ThreadListProps {
  folderName: string;
  searchQuery?: string;
}

export function ThreadHeader({
  folderName,
  count,
  refreshCallback,
}: {
  folderName: string;
  count?: number | undefined;
  refreshCallback?: () => Promise<void>;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    if (isRefreshing || !refreshCallback) return;

    setIsRefreshing(true);
    refreshCallback().finally(() => setIsRefreshing(false));
  }, [isRefreshing, refreshCallback]);


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
        {/* Refresh Button with Animation */}
        {refreshCallback && (
          <button
            onClick={handleRefresh}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mx-1"
          >
            <RefreshCw
              size={18}
              className={`transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
        )}
        <div
          className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'
        >
          <UserIconWrapper />
        </div>
      </div>
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="flex items-center border-b border-gray-100 animate-pulse">
      <div className="flex-grow flex items-center overflow-hidden p-4">
        <div className="w-[200px] flex-shrink-0 mr-4 h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
        <div className="flex-grow flex items-center overflow-hidden">
          <div className="h-6 bg-gray-200 rounded min-w-[175px] max-w-[400px] mr-2 dark:bg-gray-700"></div>
          <div className="flex-grow h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
      </div>
      <div className="flex items-center justify-end flex-shrink-0 w-40 p-4">
        <div className="h-6 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
      </div>
    </div>
  );
}

export function ThreadList({ folderName }: ThreadListProps) {
  const [hoveredThread, setHoveredThread] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null); // Sentinel for intersection

  const { data: session } = useSession();
  const { emails: threads, fetchNextEmails, loading, checkNewEmails, topLoading } = useEmailManager(session?.provider as ProviderName, session?.accessToken || '', folderName);
  const setThreadsByFolder = useEmailStore(state => state.setThreadsByFolder);

  // Intersection Observer callback to fetch next emails
  const onIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      console.log('Intersection Observer');
      if (entries[0].isIntersecting) {
        console.log('Fetching next emails');
        fetchNextEmails(); // Call fetch function when sentinel is visible
      }
    },
    [fetchNextEmails]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersection, { threshold: 0.1 });
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [onIntersection]);

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

  useEffect(() => {
    setThreadsByFolder(folderName, threads.map((thread) => thread.id));
  }, [folderName, threads, setThreadsByFolder]);

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

  if (!session) {
    return null;
  }

  return (
    <div className="flex-grow border-r border-gray-200 overflow-hidden">
      <ThreadHeader folderName={folderName} count={threads.length} refreshCallback={checkNewEmails} />
      <div className="overflow-auto h-[calc(100vh-64px)]">
        {/* Skeleton Loader */}
        {topLoading && Array.from({ length: 1 }).map((_, index) => (
          <ThreadSkeleton key={index} />
        ))}

        {threads.map((thread) => {
          return (
            <Link
              key={thread.id}
              href={`/f/${folderName.toLowerCase()}/${thread.id}`}
              className="block hover:bg-gray-50 cursor-pointer border-b border-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                    <span className="text-gray-600 truncate dark:text-gray-400">
                      {thread.body}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end flex-shrink-0 w-40 p-4" onClick={(e) => e.stopPropagation()}>
                  {!isMobile && hoveredThread === thread.id ? (
                    <ThreadActions threadId={thread.id} provider={session.provider!} accessToken={session.accessToken!} callback={() => checkNewEmails()} />
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(thread.sentDate!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {/* Sentinel div at the bottom */}
        <div ref={sentinelRef} className="h-5" />

        {/* Skeleton Loader */}
        {loading && Array.from({ length: 3 }).map((_, index) => (
          <ThreadSkeleton key={index} />
        ))}
      </div>
    </div >
  );
}
