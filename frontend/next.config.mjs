/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  env: {
    APIGATEWAY: process.env.APIGATEWAY, // pulls from .env file
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config) => {
    return config;
  },
  // headers: () => {
  //   return [
  //     {
  //       source: "/post",
  //       headers: [
  //         {
  //           key: "Access-Control-Allow-Origin",
  //           value: "*",
  //         },
  //         {
  //           key: "Access-Control-Allow-Methods",
  //           value: "GET, POST, PUT, DELETE, OPTIONS",
  //         },
  //         {
  //           key: "Access-Control-Allow-Headers",
  //           value: "Content-Type, Authorization",
  //         },
  //       ],
  //     },
  //   ];
  // },
};
