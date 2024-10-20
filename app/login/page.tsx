// app/auth/login/page.tsx
import { signIn } from '@/auth';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-semibold mb-6 text-center">Login</h1>
                <div className="flex flex-col space-y-4">
                    {/* Google Login Button */}
                    <form
                        action={async () => {
                            "use server"
                            await signIn("google", { redirectTo: "/profile" })
                        }}
                    >
                        <button type="submit">Signin with Google</button>
                    </form>
                    {/* Microsoft Login Button */}
                    <form
                        action={async () => {
                            "use server"
                            await signIn("microsoft-entra-id", { redirectTo: "/profile" })
                        }}
                    >
                        <button type="submit">Signin with Azure Active Directory</button>
                    </form>
                </div>
            </div>
        </div>
    );
}