/** @type {import('next').NextConfig} */
const nextConfig = {
    // Explicitly set the workspace root so Next.js doesn't climb past this project
    outputFileTracingRoot: process.cwd(),
    images: {
        remotePatterns: [{
            hostname: 'lh3.googleusercontent.com',
        }],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/f/inbox',
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
