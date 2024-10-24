/** @type {import('next').NextConfig} */
const nextConfig = {
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
