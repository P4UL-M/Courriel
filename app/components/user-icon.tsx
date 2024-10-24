import * as React from "react";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

const UserIcon = () => {
    const { data: session } = useSession();
    const [open, setOpen] = React.useState(false);

    if (!session) {
        return null;
    }

    const user = session.user;

    return (
        <div className="m-auto">
            <button onClick={() => setOpen(true)}>
                {user?.image ? (
                    <Image
                        src={user.image}
                        alt={user.name || user.email || "User Image"}
                        className="rounded-full w-8 h-8 items-center"
                        width={32}
                        height={32}
                    />
                ) : (
                    <span className="rounded-full w-8 h-8 bg-gray-300 flex items-center justify-center">
                        {user?.name?.charAt(0) || user?.email?.charAt(0)}
                    </span>
                )}
            </button>

            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md p-6 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2">
                        <Dialog.Close className="absolute top-4 right-4">
                            <Cross2Icon className="w-6 h-6" />
                        </Dialog.Close>
                        <div className="flex flex-col items-center">
                            {user?.image && (
                                <Image
                                    src={user.image}
                                    alt={user.name || user.email || "User Image"}
                                    className="rounded-full w-24 h-24 mb-4"
                                    width={96}
                                    height={96}
                                />
                            )}
                            <p className="text-xl font-semibold text-center">{user?.name}</p>
                            <p className="text-gray-500 text-center">{user?.email}</p>
                            <button
                                onClick={() => signOut()}
                                className="mt-6 bg-red-500 text-white py-2 px-4 rounded-lg shadow hover:bg-red-600 transition"
                            >
                                Sign Out
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
};

export const UserIconSkeleton = () => {
    return (
        <span className="rounded-full w-8 h-8 bg-gray-300 animate-pulse" />
    );
}

const UserIconWrapper = () => {
    return (
        <SessionProvider>
            <UserIcon />
        </SessionProvider>
    );
};

export default UserIconWrapper;