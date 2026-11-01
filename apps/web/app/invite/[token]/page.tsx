import type { Metadata } from "next";
import { InviteOnboardingClient } from "./InviteOnboardingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teammate Invitation — ABCD Social Hub",
  description: "Complete your onboarding and set up your team credentials.",
};

interface InvitePageProps {
  params: {
    token: string;
  };
}

export default function TeammateInvitePage({ params }: InvitePageProps) {
  return <InviteOnboardingClient token={params.token} />;
}
