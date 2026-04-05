export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/contexts/:path*",
    "/opportunities/:path*",
    "/backlog/:path*",
    "/specs/:path*",
    "/settings/:path*",
  ],
};
