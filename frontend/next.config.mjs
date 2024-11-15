/** @type {import('next').NextConfig} */
export default {
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    return config;
  },
  headers: () => {
    return [
      {
        source: "/post",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};
