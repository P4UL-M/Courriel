import { auth } from "@/auth";

export async function generateMetadata({ params }: { params: { name: string; id: string } }) {
    const session = await auth();

    return {
        title: params.name[0].toLocaleUpperCase() + params.name.slice(1) + ' - ' + session?.user?.name + ' - Courriel',
    };
}

export default function fLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}