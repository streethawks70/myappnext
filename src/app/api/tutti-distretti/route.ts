import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email || !password) {
    return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
  }

  try {
    const scriptUrl =
      "https://script.google.com/macros/s/AKfycbzgKPkBsMfWtiWmtNet7QksazPIhCpjTMTEuT2I_jyQQzI9uzFvk_oy_ZG5Knw6sbQPQg/exec";

    const res = await fetch(
      `${scriptUrl}?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    );

    const text = await res.text();
    if (!text || (!text.startsWith("{") && !text.startsWith("["))) {
      console.error("Risposta non valida dal backend Apps Script:", text);
      return NextResponse.json({ error: "Risposta non valida" }, { status: 502 });
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Errore durante il fetch:", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
