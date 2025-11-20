// /app/api/login/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const password = searchParams.get("password");
    const distretto = searchParams.get("distretto");

    if (!email || !password || !distretto) {
      return new Response(JSON.stringify({ error: "Dati mancanti" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const DISTRETTI_ID_MAP: Record<string, string> = {
      'Distretto 1': '1n0CP_I7xCGr2RiFgvrmai5Zt-HHFbekhrNHabKUVUco',
      'Distretto 2': '1-id-google-sheet-distretto-2',
      'Distretto 3': '1TUp9oKn0Pdlctbzhm1G_on4fwunqVOaUFtBQXfjgqPA',
      'Distretto 4': '18GzAtWxeMCG6tRXqbmzND6QQmHZkW9RiWObE4-G_pAk',
      'Distretto 5': '1YhBdp5vSY3wIzZq8r64LLmBGMkRird1cd5gathcxiOo',
      'Distretto 6': '14BroMm8vG6lvVplL-cMbSfKtuoLUQM8FIeKK9JzWQ8I',
      'Distretto 7': '1nRQVt8bdwQYGJMsn54i54toq59AMp_PEliuTPebMU4c',
      'Distretto 8': '1xdhnyvJevT1xNPAYeDqhrwcCdDaHn5Q8WP7PPuh73g0',
      'Distretto 9': '1UZyVa5i-r3uxdZ7tos1bOHkm2g-YVXBrgCrmXviEpgw',
      'Distretto 10': '1oFsm3ZlAzFyMF1LkGlewNiUjBjK2Qi1KhdEAJk0sVW8',
      'Distretto 11': '1-jWjnButxLpJEOr8AxKaY8cH57J2IOgU9S5fzV0npJw',
    };

    const sheetId = DISTRETTI_ID_MAP[distretto];
    if (!sheetId) {
      return new Response(JSON.stringify({ error: "Distretto non valido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = `https://script.google.com/macros/s/AKfycbzoC_35jDVuXAX7ZJ1ZWqmZVvBFrK1ygJ_2v8CzRFCtt8hyBwMVi8pspd-OQbXy2obL/exec


?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&sheetId=${sheetId}`;

    const res = await fetch(url);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Errore dal server remoto" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Errore interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
