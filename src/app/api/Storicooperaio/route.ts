import { NextResponse } from "next/server";
import { google } from "googleapis";
import * as XLSX from "xlsx";

// Mappa distretto → cartella Drive
const folderMap: Record<string, string> = {
  distretto1: "1-BKLFgFRaWNd67XCP25jxB2ICuOTZ2P_",
  distretto2: "ID_CARTELLA_2",
  distretto3: "1nDLemNiIUeuc9cLflFK77nv4SdE7n7uB",
  distretto4: "1HcU66INaehOOE2qEK3T4LTgzM2zlUaPz",
  distretto5: "1EIZ-VuqpeSSZYrGSBvUdQJGopLQJOk8f",
  distretto6: "1uRClM5yzkP1CRMTD1WjXqMEVEiPeJZ1t",
  distretto7: "1B05SjIlPVgMt2eMBTaVgCoF9KRwT87xH",
  distretto8: "1tZDdahHhRqt5JlJtU6Yt4nR_TlnbT4pO",
  distretto9: "1J6yivV81ngUXIbzKI_F9qV6pL1kg0JXO",
  distretto10: "1N6yrI6zY6j8IHW75jePuZD3Zd9WaH7wQ",
  distretto11: "1jsr4bqRQtqxG6SoMnlqbr5VjyeuG_G5-",
  // ... aggiungi tutti gli altri distretti
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

// Converti numero Excel in data leggibile
function formatExcelDate(excelDate: any) {
  if (!excelDate) return "";
  const date = XLSX.SSF.parse_date_code(excelDate);
  if (!date) return "";
  const d = String(date.d).padStart(2, "0");
  const m = String(date.m).padStart(2, "0");
  const y = date.y;
  return `${d}/${m}/${y}`;
}

// Converti frazione di giorno in hh:mm
function excelTimeToHoursMinutes(excelTime: number) {
  if (!excelTime && excelTime !== 0) return "";
  const totalMinutes = Math.round(excelTime * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const distretto = searchParams.get("distretto");
    const matricola = searchParams.get("matricola");
    const mese = searchParams.get("mese"); // YYYY-MM

    if (!distretto || !matricola || !mese)
      return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });

    const folderId = folderMap[distretto];
    if (!folderId) return NextResponse.json({ error: "Distretto non valido" }, { status: 400 });

    const drive = await getDriveClient();

    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name)",
    });

    const regex = new RegExp(`^Foglio1 - ${mese}-\\d{2}\\.xls(x)?$`);
    const files = (res.data.files ?? []).filter(f => f.name && regex.test(f.name));

    const risultati: any[] = [];

    for (const file of files) {
      if (!file.id || !file.name) continue;

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
        const rowMatricola = r[2]?.toString().trim();
        if (rowMatricola === matricola) {
          const rowFiltered = {
            data: formatExcelDate(r[0]), // colonna A
            nominativo: r[1] ?? "",      // colonna B
            matricola: r[2] ?? "",       // colonna C 
            presenza: excelTimeToHoursMinutes(r[4]), // colonna E
            uscita: excelTimeToHoursMinutes(r[15]),  // colonna P
            permessiRetribuiti: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 31 })]?.w ?? "",
            legge104: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 32 })]?.w ?? "",
            art9: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 34 })]?.w ?? "",
            art51: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 35 })]?.w ?? "",
            ferie: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 36 })]?.w ?? "",
            malattia: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 37 })]?.w ?? "",
            infortunio: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 38 })]?.w ?? "",
            donazioneSangue: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 39 })]?.w ?? "",
            permessoSindacale: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 40 })]?.w ?? "",
            cassaIntegrazione: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 41 })]?.w ?? "",
            festivita: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 42 })]?.w ?? "",
            oreMensili: sheet[XLSX.utils.encode_cell({ r: rowIndex + 3, c: 63 })]?.w ?? "",
            file: file.name,
          };
          risultati.push(rowFiltered);
        }
      }
    }

    if (risultati.length === 0)
      return NextResponse.json({ message: "Nessun dato trovato" });

    return NextResponse.json(risultati);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
