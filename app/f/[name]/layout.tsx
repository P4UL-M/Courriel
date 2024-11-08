import { auth } from "@/auth";

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
    const session = await auth();
    const { name } = await params;

    return {
        title: name[0].toLocaleUpperCase() + name.slice(1) + ' - ' + session?.user?.name + ' - Courriel',
    };
}

export default function fLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}