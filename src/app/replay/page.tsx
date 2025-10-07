'use client';
import { useSearchParams } from "next/navigation";
import ReplayLeaflet from "@/components/ReplayLeaflet";

export default function ReplayPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const password = searchParams.get("password") || "";
  const distretto = searchParams.get("distretto") || "";

  if (!email || !password || !distretto) {
    return <div>Parametri mancanti</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Replay – {distretto.toUpperCase()}</h1>
      <ReplayLeaflet email={email} password={password} distretto={distretto} />
    </div>
  );
}
