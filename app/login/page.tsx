// app/auth/login/page.tsx
import { providerMap, signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata = {
    title: "Login - Courriel",
};

type PropsType = {
    searchParams: {
        callbackUrl: string | undefined;
    },
};

export default async function LoginPage(
    { searchParams }: PropsType
) {

    const { callbackUrl } = await searchParams;

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-white to-blue-100  overflow-hidden dark:from-purple-800 dark:via-gray-900 dark:to-blue-800">

            {/* App Title */}
            <header className="absolute top-0 left-0 w-full text-center py-4 bg-white bg-opacity-90 backdrop-blur-lg shadow-md dark:bg-gray-800 dark:bg-opacity-60">
                <h1 className="text-4xl font-bold">Courriel</h1>
            </header>

            <div className="relative z-10 bg-white p-10 rounded-xl shadow-2xl w-full max-w-md dark:bg-gray-800">
                <h1 className="text-4xl font-bold mb-8 text-center  text-gray-700 dark:text-gray-200">Login</h1>
                <div className="space-y-4">
                    {Object.values(providerMap).map((provider) => (
                        <form
                            action={async () => {
                                "use server"
                                try {
                                    await signIn(provider.id, {
                                        redirectTo: callbackUrl ?? "",
                                    })
                                } catch (error) {
                                    // Signin can fail for a number of reasons, such as the user
                                    // not existing, or the user not having the correct role.
                                    // In some cases, you may want to redirect to a custom error
                                    if (error instanceof AuthError) {
                                        return redirect(`/?error=${error.type}`)
                                    }

                                    // Otherwise if a redirects happens Next.js can handle it
                                    // so you can just re-thrown the error and let Next.js handle it.
                                    // Docs:
                                    // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
                                    throw error
                                }
                            }}
                            key={provider.id}
                            className="space-y-2"
                        >
                            <button type="submit" className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition duration-150 ease-in-out dark:bg-gray-700">
                                <span>Sign in with {provider.name}</span>
                            </button>
                        </form>
                    ))}
                </div>
            </div>
        </div>
    );
}