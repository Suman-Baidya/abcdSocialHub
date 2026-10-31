import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@abcd/db";

function parseEmailList(val?: string, fallback: string = ""): string[] {
  const str = val || fallback;
  return str
    .split(",")
    .map((e) => e.replace(/['"]/g, "").trim().toLowerCase())
    .filter(Boolean);
}

const DEVELOPER_EMAILS = parseEmailList(
  process.env.DEVELOPER_EMAILS || process.env.DEVELOPER_EMAIL,
  "suman.baidya.pro@gmail.com"
);

const SUPER_ADMIN_EMAILS = parseEmailList(
  process.env.SUPER_ADMIN_EMAILS,
  "suman.baidya.pro@gmail.com"
);

import { resolveDashboardType, type DashboardType, type RoleType } from "./roles";
export { resolveDashboardType, type DashboardType, type RoleType };

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("No account found with this email. Please sign up.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid password. Please try again.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase().trim();
      const isDeveloper = DEVELOPER_EMAILS.includes(email);
      const isSuperAdmin = isDeveloper || SUPER_ADMIN_EMAILS.includes(email);

      // Upsert User record in database
      let dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          memberships: {
            include: {
              organization: {
                include: { workspaces: true },
              },
            },
          },
        },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email,
            name: user.name ?? email.split("@")[0],
            image: user.image,
          },
          include: {
            memberships: {
              include: {
                organization: {
                  include: { workspaces: true },
                },
              },
            },
          },
        });
      }

      // Auto-provision initial Organization and Workspace if none exist
      if (!dbUser.memberships || dbUser.memberships.length === 0) {
        const orgSlug = `org-${dbUser.id.slice(-6)}-${Date.now().toString(36)}`;
        const initialRole: RoleType = isDeveloper ? "DEVELOPER" : isSuperAdmin ? "SUPER_ADMIN" : "TENANT_ADMIN";

        await prisma.organization.create({
          data: {
            name: `${dbUser.name || "Default"}'s Business`,
            slug: orgSlug,
            workspaces: {
              create: {
                name: "Primary Brand",
                isApproved: true,
                brandKit: {
                  create: {
                    businessName: dbUser.name || "ABCD Social Hub",
                    phoneNumber: "+91 8944899747",
                    addressBanner: "WhatsApp: +91 8167685731 • Email: sb.abcd321@gmail.com",
                    primaryColor: "#00F0FF",
                  },
                },
              } as any,
            },
            memberships: {
              create: {
                userId: dbUser.id,
                role: initialRole as any,
                allowedPages: [] as string[],
              } as any,
            },
          },
        });
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user?.email) {
        token.email = user.email.toLowerCase().trim();
      }

      // Allow client-side active workspace switching
      if (trigger === "update" && session?.activeWorkspaceId) {
        token.workspaceId = session.activeWorkspaceId;
        token.workspaceName = session.activeWorkspaceName;
        return token;
      }

      if (token.email) {
        const email = token.email as string;
        const isDeveloper = DEVELOPER_EMAILS.includes(email);
        const isSuperAdmin = isDeveloper || SUPER_ADMIN_EMAILS.includes(email);

        const dbUser = await prisma.user.findUnique({
          where: { email },
          include: {
            memberships: {
              include: {
                organization: {
                  include: { workspaces: true },
                },
              },
            },
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.isDeveloper = isDeveloper;
          token.isSuperAdmin = isSuperAdmin;

          const primaryMembership = dbUser.memberships[0];
          let userRole: RoleType = (primaryMembership?.role as RoleType) || "TENANT_ADMIN";
          
          if (isDeveloper) {
            userRole = "DEVELOPER";
          } else if (isSuperAdmin && (userRole === "SUPER_ADMIN" || (userRole as string) === "OWNER" || !primaryMembership)) {
            userRole = "SUPER_ADMIN";
          }

          const allowedPages = (primaryMembership as any)?.allowedPages || [];
          const dashboardType = resolveDashboardType(userRole);

          token.role = userRole;
          token.dashboardType = dashboardType;
          token.allowedPages = allowedPages;
          token.organizationId = primaryMembership?.organizationId;

          const primaryWorkspace = primaryMembership?.organization?.workspaces[0];
          token.workspaceId = token.workspaceId || primaryWorkspace?.id;
          token.workspaceName = token.workspaceName || primaryWorkspace?.name || "Primary Brand";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).dashboardType = token.dashboardType;
        (session.user as any).allowedPages = token.allowedPages;
        (session.user as any).isDeveloper = token.isDeveloper;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
        (session.user as any).workspaceId = token.workspaceId;
        (session.user as any).workspaceName = token.workspaceName;
        (session.user as any).organizationId = token.organizationId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
