import { Suspense } from "react";
import AibClient from "./AibClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <AibClient />
    </Suspense>
  );
}