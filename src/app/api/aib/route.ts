import { NextResponse } from "next/server";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyBOVpcYNrACpZG-khLP5x_vQ4o3DQgdvkyuHg3TdxGlPE8uuukMHnstlsl1wsSc1Oh8g/exec";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const matricola = searchParams.get("matricola");

    if (!matricola) {
      return NextResponse.json(
        { success: false, message: "Matricola mancante" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${APPS_SCRIPT_URL}?matricola=${encodeURIComponent(matricola)}`
    );

    const data = await res.json();

    return NextResponse.json(data);

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { success: false, message: "Errore server" },
      { status: 500 }
    );
  }
}