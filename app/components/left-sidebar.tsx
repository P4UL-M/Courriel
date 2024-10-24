'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type leftSidebarProps = {
    upCallback?: string,
    downCallback?: string,
};

export function LeftSidebar({
    upCallback,
    downCallback,
}: leftSidebarProps) {
    const { name } = useParams();
    const router = useRouter();

    return (
        <div className="bg-gray-100 flex flex-col items-center py-6 space-y-4 pl-2 sm:pl-4 pr-2 sm:pr-24">
            <Link href={`/f/${name}`} passHref>
                <Button
                    size="lg"
                    variant="outline"
                    className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="size-4 sm:size-5" />
                </Button>
            </Link>
            <Button
                size="lg"
                variant="outline"
                className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                onClick={() => router.push(`/f/${name}/${upCallback}`)}
                disabled={!upCallback}
            >
                <ChevronUp className="size-4 sm:size-5" />
            </Button>
            <Button
                size="lg"
                variant="outline"
                className="p-2 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                onClick={() => router.push(`/f/${name}/${downCallback}`)}
                disabled={!downCallback}
            >
                <ChevronDown className="size-4 sm:size-5" />
            </Button>
        </div>
    );
}
