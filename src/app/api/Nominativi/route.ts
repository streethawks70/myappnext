import { NextResponse } from "next/server";
import { google } from "googleapis";

const sheetMap: Record<string, string> = {
  distretto1: "1n0CP_I7xCGr2RiFgvrmai5Zt-HHFbekhrNHabKUVUco",
  distretto2: "ID_GOOGLE_SHEET_DISTRETTO_2",
  distretto3: "1TUp9oKn0Pdlctbzhm1G_on4fwunqVOaUFtBQXfjgqPA",
  distretto4: "18GzAtWxeMCG6tRXqbmzND6QQmHZkW9RiWObE4-G_pAk",
  distretto5: "1YhBdp5vSY3wIzZq8r64LLmBGMkRird1cd5gathcxiOo",
  distretto6:"14BroMm8vG6lvVplL-cMbSfKtuoLUQM8FIeKK9JzWQ8I",
  distretto7:"1nRQVt8bdwQYGJMsn54i54toq59AMp_PEliuTPebMU4c",
  distretto8:"1xdhnyvJevT1xNPAYeDqhrwcCdDaHn5Q8WP7PPuh73g0",
  distretto9:"1UZyVa5i-r3uxdZ7tos1bOHkm2g-YVXBrgCrmXviEpgw",
  distretto10:"1oFsm3ZlAzFyMF1LkGlewNiUjBjK2Qi1KhdEAJk0sVW8",
  distretto11: "1-jWjnButxLpJEOr8AxKaY8cH57J2IOgU9S5fzV0npJw",
};

function getServiceAccount() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY mancante");
  const key = JSON.parse(rawKey);
  key.private_key = key.private_key.replace(/\\n/g, "\n");
  return key;
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getServiceAccount(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const distretto = searchParams.get("distretto");
    if (!distretto) return NextResponse.json({ error: "Distretto mancante" }, { status: 400 });

    const sheetId = sheetMap[distretto];
    if (!sheetId) return NextResponse.json({ error: "Distretto non valido" }, { status: 400 });

    const sheets = await getSheetsClient();
    // Legge il foglio principale (Foglio1) dal range A:C
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Foglio1!A:C",
    });

    const values = res.data.values || [];
    // Prima riga = intestazioni
    const nominativi = values.slice(1).map(row => ({
      nome: row[1],
      matricola: row[2],
    })).filter(r => r.nome && r.matricola);

    return NextResponse.json(nominativi);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
