import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Credenziali mancanti" },
      { status: 400 }
    );
  }

  const GAS_URL =
    "https://script.google.com/macros/s/AKfycbxvPGx2_KB8h9E_vdoEKt-x5TuS17lKY7skE01E5l4bGW8T8H-wnNrPaFVPqwguow1a/exec"; // ← incolla QUI il link

  const res = await fetch(
    `${GAS_URL}?email=${email}&password=${password}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Errore Google Script" },
      { status: 500 }
    );
  }

  const data = await res.json();

  return NextResponse.json(data);
}
