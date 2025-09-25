// app/api/list/route.ts
import { NextResponse } from "next/server";
import { google} from "googleapis"

// mappa distretti → ID cartelle Google Drive
const folderMap: Record<string, string> = {
  distr1: "1-BKLFgFRaWNd67XCP25jxB2ICuOTZ2P_",
  distr2: "",
  distr3: "1nDLemNiIUeuc9cLflFK77nv4SdE7n7uB",
  distr4: "ID_CARTELLA_BACKUP_DISTR3",
  distr5: "1EIZ-VuqpeSSZYrGSBvUdQJGopLQJOk8f",
  distr6: "1uRClM5yzkP1CRMTD1WjXqMEVEiPeJZ1t",
  distr7: "ID_CARTELLA_BACKUP_DISTR3",
  distr8: "1tZDdahHhRqt5JlJtU6Yt4nR_TlnbT4pO",
  distr9: "1J6yivV81ngUXIbzKI_F9qV6pL1kg0JXO",
  distr10: "1N6yrI6zY6j8IHW75jePuZD3Zd9WaH7wQ",
  distr11: "1jsr4bqRQtqxG6SoMnlqbr5VjyeuG_G5-",
  
};

// legge e sistema la chiave privata
function getServiceAccount() {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!rawKey) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY mancante");

  const key = JSON.parse(rawKey);
  key.private_key = key.private_key.replace(/\\n/g, "\n"); // fix newline
  return key;
}

async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getServiceAccount(),
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

// API GET
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const distretto = searchParams.get("distretto");
    const data = searchParams.get("data"); // YYYY-MM-DD

    if (!distretto || !data) {
      return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
    }

    const folderId = folderMap[distretto];
    if (!folderId) {
      return NextResponse.json({ error: "Distretto non valido" }, { status: 400 });
    }

    const drive = await getDriveClient();

    const res = await drive.files.list({
      q: `'${folderId}' in parents and name contains '${data}'`,
      fields: "files(id, name, webViewLink, webContentLink)",
      orderBy: "name asc",
    });

    const files = res.data.files ?? [];
    return NextResponse.json(files);
  } catch (err: any) {
    console.error("Errore API /api/list:", err);
    return NextResponse.json(
      { error: "Errore server", details: err.message },
      { status: 500 }
    );
  }
}
