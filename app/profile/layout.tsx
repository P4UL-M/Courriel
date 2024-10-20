import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface ProfileLayoutProps {
    children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
};

export default ProfileLayout;