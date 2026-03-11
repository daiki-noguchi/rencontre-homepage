/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['mori-no-oto.vercel.app', 'xsgames.co', 'placehold.jp', 'via.placeholder.com', 'picsum.photos', 'images.unsplash.com', 'plus.unsplash.com', 'source.unsplash.com', 'loremflickr.com', 'random.imagecdn.app', 'dummyimage.com', 'dummy.supabase.com', 'rnfvzaelmwbbvfbsppir.supabase.co'],
  },
};

export default nextConfig;
