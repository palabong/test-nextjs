import { createChallengeToken } from "@/lib/antibot";
import ChallengeClient from "./ChallengeClient";

export default async function ChallengePage(props: { searchParams: Promise<{ returnTo?: string }> }) {
  const searchParams = await props.searchParams;
  const returnTo = searchParams.returnTo || "/";
  const secret = process.env.INGESTION_TOKEN || "super-secret-ingestion-token-for-dev";
  const challenge = await createChallengeToken(secret);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-50">
      <ChallengeClient challengeToken={challenge.token} returnTo={returnTo} />
    </div>
  );
}