const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true, // ✅ Only if you're using styled-components
  },
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"], // ✅ Required for OAuth images
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
