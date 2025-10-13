import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    console.log("Credentials input:", `${process.env.BACK_END_URL}/auth/login`);
                    // 1. Login → ambil token
                    const res = await fetch(`${process.env.BACK_END_URL}/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            username: credentials?.username,
                            password: credentials?.password,
                        }),
                    });

                    const data = await res.json();
                    console.log("Login response:", data);

                    const token = data?.page_data?.token;
                    if (!res.ok || !token) return null;

                    // 2. Cek profile dari /auth/me
                    const meRes = await fetch(`${process.env.BACK_END_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const meData = await meRes.json();
                    console.log("Profile response:", meData);

                    if (!meRes.ok) return null;

                    // 3. Return ke NextAuth
                    return {
                        id: Number(meData.id),
                        name: meData.username,
                        email: meData.email || `${meData.username}@example.com`,
                        roles: meData.roles,
                        permissions: meData.permissions,
                        accessToken: token,
                    };
                } catch (error) {
                    console.error("Login error", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.id = Number(user.id);
                token.roles = user.roles;
                token.permissions = user.permissions;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.roles = token.roles;
            session.user.permissions = token.permissions;
            session.accessToken = token.accessToken;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
