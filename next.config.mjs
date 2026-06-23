/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep the 0G SDK and ethers server-only — they rely on Node.js `fs`
  serverExternalPackages: ['@0glabs/0g-ts-sdk', 'ethers'],
}

export default nextConfig
