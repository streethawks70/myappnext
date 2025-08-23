import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");
  const distretto = searchParams.get("distretto");

  if (!email || !password || !distretto) {
    return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
  }

  const baseUrl = "https://script.google.com/macros/s/AKfycbyMi4mpwvo_EDn-1ITDPTHyQPOJLw2S_Wwk8SWSPFK-YdRBiG6clHegY1sOqotmUGYU/exec";
  const url = `${baseUrl}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&distretto=${encodeURIComponent(distretto)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Errore:", err);
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
