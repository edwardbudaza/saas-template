import { handlers } from "~/server/auth";

export const { GET, POST } = handlers;

// import NextAuth from "next-auth";
// import { authConfig } from "~/server/auth/config";

// console.log("🔧 Auth route handler initialized");

// const handler = NextAuth(authConfig);

// // Wrap handlers with logging
// const GET = async (req: Request, context: any) => {
// console.log("🌐 GET request to auth endpoint:", {
// url: req.url,
// method: req.method,
// headers: Object.fromEntries(req.headers.entries()),
// });

// try {
// const result = await handler(req, context);
// console.log("✅ GET request completed successfully");
// return result;
// } catch (error) {
// console.error("❌ GET request failed:", error);
// throw error;
// }
// };

// const POST = async (req: Request, context: any) => {
// console.log("🌐 POST request to auth endpoint:", {
// url: req.url,
// method: req.method,
// headers: Object.fromEntries(req.headers.entries()),
// });

// try {
// const result = await handler(req, context);
// console.log("✅ POST request completed successfully");
// return result;
// } catch (error) {
// console.error("❌ POST request failed:", error);
// throw error;
// }
// };

// export { GET, POST };
