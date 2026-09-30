import type { NextConfig } from "next";

const supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname;

const nextConfig: NextConfig = {
  images: {
    // Фото товаров из Supabase Storage отдаются сжатыми и под размер экрана
    remotePatterns: [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }],
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    // Имена файлов уникальны (время + uuid), содержимое по URL не меняется — кэшируем надолго
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
};

export default nextConfig;
