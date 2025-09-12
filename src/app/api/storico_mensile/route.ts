import { NextResponse } from "next/server";
import { google } from "googleapis";
import * as XLSX from "xlsx";

// Mappa distretto → cartella Drive
const folderMap: Record<string, string> = {
  distretto1: "1-BKLFgFRaWNd67XCP25jxB2ICuOTZ2P_",
  distretto2: "ID_CARTELLA_2",
  distretto3: "1nDLemNiIUeuc9cLflFK77nv4SdE7n7uB",
  distretto4: "ID_CARTELLA_4",
  distretto5: "1EIZ-VuqpeSSZYrGSBvUdQJGopLQJOk8f",
  distretto6: "ID_CARTELLA_6",
  distretto7: "ID_CARTELLA_7",
  distretto8: "1tZDdahHhRqt5JlJtU6Yt4nR_TlnbT4pO",
  distretto9: "ID_CARTELLA_9",
  distretto10: "ID_CARTELLA_10",
  distretto11: "1jsr4bqRQtqxG6SoMnlqbr5VjyeuG_G5-",
  // ... aggiungi gli altri
};

function getServiceAccount() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY mancante");
  const key = JSON.parse(rawKey);
  key.private_key = key.private_key.replace(/\\n/g, "\n");
  return key;
}

async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getServiceAccount(),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

// Converti frazione di giorno in hh:mm, lascia stringhe non numeriche intatte
function excelFractionToHHMM(val: any) {
  if (val === null || val === undefined || val === "") return "";
  if (typeof val === "number") {
    const totalMinutes = Math.round(val * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
  return val.toString(); // lascia stringhe tipo "Nessun calcolo"
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const distretto = searchParams.get("distretto");
    const mese = searchParams.get("mese"); // YYYY-MM

    if (!distretto || !mese)
      return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });

    const folderId = folderMap[distretto];
    if (!folderId) return NextResponse.json({ error: "Distretto non valido" }, { status: 400 });

    const drive = await getDriveClient();

    // Recupera i file del mese
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name)",
    });

    const regex = new RegExp(`^Foglio1 - ${mese}-\\d{2}\\.xls(x)?$`);
    const files = (res.data.files ?? []).filter(f => f.name && regex.test(f.name));
    files.sort((a, b) => (a.name! > b.name! ? 1 : -1)); // ordina per giorno

    const risultati: Record<string, any> = {};

    for (const file of files) {
      if (!file.id || !file.name) continue;

      const giorno = parseInt(file.name.split("-").pop()!.replace(".xlsx", "").replace(".xls", ""), 10);

      const fileRes = await drive.files.get(
        { fileId: file.id, alt: "media" },
        { responseType: "arraybuffer" }
      );

      const buffer = Buffer.from(fileRes.data as ArrayBuffer);
      const workbook = XLSX.read(buffer, { type: "buffer" });

      const sheetName = file.name.replace(/\.xls[x]?$/, "");
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 3 });

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const r = rows[rowIndex];
        const nominativo = r[1]?.toString().trim();
        const matricola = r[2]?.toString().trim();
        if (!nominativo || !matricola) continue;

        if (!risultati[matricola]) {
          risultati[matricola] = {
            nominativo,
            matricola,
            giorni: Array(31).fill(""),
            ferie: 0,
            malattia: 0,
            permessiRetribuiti: 0,
            art9: 0,
            art51: 0,
            legge104: 0,
            infortunio: 0,
            ore_mensili:0,
          };
        }

        // Ore giornaliere → colonna Y (indice 24)
        risultati[matricola].giorni[giorno - 1] = excelFractionToHHMM(r[24]);

        // Permessi vari (copiati come appaiono)
        const permCells = {
          permessiRetribuiti: 31,
          legge104: 32,
          art9: 34,
          art51: 35,
          ferie: 36,
          malattia: 37,
          infortunio: 38,
          ore_mensili:63,
        };
        for (const [key, col] of Object.entries(permCells)) {
          const cell = sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: col })];
          const value = cell ? XLSX.utils.format_cell(cell) : 0;
          risultati[matricola][key] = value;
        }
      }
    }

    const tabella = Object.values(risultati).map(r => ({
      nominativo: r.nominativo,
      matricola: r.matricola,
      ...Object.fromEntries(r.giorni.map((val: any, i: number) => [i + 1, val])),
      ferie: r.ferie,
      malattia: r.malattia,
      permessiRetribuiti: r.permessiRetribuiti,
      art9: r.art9,
      art51: r.art51,
      legge104: r.legge104,
      infortunio: r.infortunio,
      ore_mensili:r.ore_mensili,
    }));

    if (tabella.length === 0)
      return NextResponse.json({ message: "Nessun dato trovato" });

    return NextResponse.json(tabella);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
