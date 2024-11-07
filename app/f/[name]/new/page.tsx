'use client';

import { Paperclip, Trash2 } from 'lucide-react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LeftSidebar } from '@/app/components/left-sidebar';
import { sendEmailAction } from '@/lib/db/actions';
import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useFormState } from 'react-dom';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

function EmailBody({ defaultValue = '' }: { defaultValue?: string }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'Enter' || e.key === 'NumpadEnter')
    ) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div>
      <textarea
        name="body"
        placeholder="Tip: Hit Shift ⏎ to send"
        className="w-full h-[calc(100vh-300px)] resize-none border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
        required
        onKeyDown={handleKeyDown}
        defaultValue={defaultValue}
      />
    </div>
  );
}

function ComposePage() {
  const { data: session } = useSession();
  const { name } = useParams();
  const [state, formAction] = useFormState(sendEmailAction, {
    error: '',
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success('Email sent', {
        icon: '✉️',
      });
      redirect(`/f/inbox`);
    }
  }, [state.success]);

  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  return (
    <div className="flex-grow h-full flex">
      <LeftSidebar />
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-semibold mb-6">New Message</h1>
        {state.error && (
          <div className="mb-4">
            <Alert variant="destructive" className="relative">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div className="relative">
            <input type="hidden" name="provider" value={session?.provider || ''} />
            <input type="hidden" name="accessToken" value={session?.accessToken || ''} />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              To
            </span>
            <input
              type="email"
              name="recipientEmail"
              className="w-full pl-12 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              Subject
            </span>
            <input
              type="text"
              name="subject"
              className="w-full pl-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <EmailBody />
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <TooltipProvider>
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="submit"
                      disabled={isProduction}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </TooltipTrigger>
                  {isProduction && (
                    <TooltipContent>
                      <p>Sending emails is disabled in production</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={isProduction}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send later
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature is not yet implemented</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={isProduction}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remind me
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This feature is not yet implemented</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex mt-4 sm:mt-0 ml-auto space-x-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      disabled
                      type="button"
                      className="cursor-not-allowed text-gray-400 hover:text-gray-600"
                    >
                      <Paperclip size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attachments are not yet implemented</p>
                  </TooltipContent>
                </Tooltip>
                <Link
                  href={`/f/${name}`}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Trash2 size={20} />
                </Link>
              </div>
            </TooltipProvider>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ComposePageWrapper() {
  return (
    <SessionProvider>
      <ComposePage />
    </SessionProvider>
  );
}