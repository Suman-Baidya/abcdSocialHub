import { resolveApprovalToken } from "@abcd/db";
import { ApprovalClientView } from "./ApprovalClientView";

export const dynamic = "force-dynamic";

interface ApprovalPageProps {
  params: {
    token: string;
  };
}

export default async function MobileApprovalPage({ params }: ApprovalPageProps) {
  const { token } = params;
  const resolved = await resolveApprovalToken(token);

  if (!resolved || !resolved.contentItem) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#111722]/90 border border-white/[0.08] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h1 className="text-lg font-semibold text-white">Invalid Review Link</h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            This magic approval link is invalid or has already been used. Please request a new review link from your ABCD Social dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (resolved.expired) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#111722]/90 border border-white/[0.08] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">
            ⏳
          </div>
          <h1 className="text-lg font-semibold text-white">Review Link Expired</h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            This review link expired after 72 hours for security. Please request a fresh magic link to review this post.
          </p>
        </div>
      </div>
    );
  }

  const { contentItem } = resolved;
  const brand = contentItem.workspace?.brandKit;
  const primaryVariant = contentItem.variants?.[0];
  const posterUrl = primaryVariant?.mediaUrl;

  return (
    <ApprovalClientView
      token={token}
      contentItem={{
        id: contentItem.id,
        title: contentItem.title,
        rawBrief: contentItem.rawBrief,
        status: contentItem.status,
        scheduledFor: contentItem.scheduledFor?.toISOString() || null,
        posterUrl: posterUrl || null,
        variants: contentItem.variants.map((v) => ({
          platform: v.platform,
          caption: v.caption,
          mediaUrl: v.mediaUrl,
        })),
        brand: {
          businessName: brand?.businessName || contentItem.workspace.name || "ABCD Social",
          phoneNumber: brand?.phoneNumber || "+91 8944899747",
          address: brand?.addressBanner || "Kolkata, West Bengal",
          primaryColor: brand?.primaryColor || "#00F0FF",
        },
      }}
    />
  );
}
