"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReplayLeaflet from "@/components/ReplayLeaflet";

function ReplayContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const password = searchParams.get("password") || "";
  const distretto = searchParams.get("distretto") || "";

  if (!email || !password || !distretto) {
    return <div>Parametri mancanti</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Replay – {distretto.toUpperCase()}
      </h1>
      <ReplayLeaflet email={email} password={password} distretto={distretto} />
    </div>
  );
}

export default function ReplayPage() {
  return (
    <Suspense fallback={<div>Caricamento replay...</div>}>
      <ReplayContent />
    </Suspense>
  );
}

