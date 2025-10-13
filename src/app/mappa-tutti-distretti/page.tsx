// src/app/mappa-tutti-distretti/page.tsx
import { Suspense } from "react";
import MappaTuttiDistretti from "./MappaTuttiDistretti";

export default function Page() {
  return (
    <Suspense fallback={<div>Caricamento mappa di tutti i distretti...</div>}>
      <MappaTuttiDistretti />
    </Suspense>
  );
}
