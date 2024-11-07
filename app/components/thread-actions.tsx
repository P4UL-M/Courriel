'use client';

import { Check, Clock, Archive } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { moveThreadToDone, moveThreadToTrash } from '@/lib/db/actions';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ThreadActionsProps {
    threadId: string;
    provider: string;
    accessToken: string;
    callback?: (action: string) => void;
}

export function ThreadActions({ threadId, provider, accessToken, callback }: ThreadActionsProps) {
    const initialState = {
        error: null,
        success: false,
    };

    const [doneState, doneAction, donePending] = useActionState(
        moveThreadToDone,
        initialState
    );
    const [trashState, trashAction, trashPending] = useActionState(
        moveThreadToTrash,
        initialState
    );

    useEffect(() => {
        if (trashState.success && callback) {
            callback('trash');
        }
    }, [trashState.success, callback]);

    useEffect(() => {
        if (doneState.success && callback) {
            callback('archive');
        }
    }, [doneState.success, callback]);

    const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

    return (
        <TooltipProvider>
            <div className="flex items-center space-x-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <form action={doneAction}>
                            <input type="hidden" name="threadId" value={threadId} />
                            <input type="hidden" name="provider" value={provider} />
                            <input type="hidden" name="accessToken" value={accessToken} />
                            <button
                                type="submit"
                                disabled={donePending || isProduction}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-900"
                            >
                                <Check size={14} className="text-gray-600 dark:text-gray-200" />
                            </button>
                        </form>
                    </TooltipTrigger>
                    {isProduction && (
                        <TooltipContent>
                            <p>Marking as done is disabled in production</p>
                        </TooltipContent>
                    )}
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            disabled
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors cursor-not-allowed dark:hover:bg-gray-900"
                        >
                            <Clock size={14} className="text-gray-400 dark:text-gray-200" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>This feature is not yet implemented</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <form action={trashAction}>
                            <input type="hidden" name="threadId" value={threadId} />
                            <input type="hidden" name="provider" value={provider} />
                            <input type="hidden" name="accessToken" value={accessToken} />
                            <button
                                type="submit"
                                disabled={trashPending || isProduction}
                                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-900"
                            >
                                <Archive size={14} className="text-gray-600 dark:text-gray-200" />
                            </button>
                        </form>
                    </TooltipTrigger>
                    {isProduction && (
                        <TooltipContent>
                            <p>Moving to trash is disabled in production</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}
