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
      'Distretto 1': '1-id-google-sheet-distretto-1',
      'Distretto 2': '1-id-google-sheet-distretto-2',
      'Distretto 3': '1-id-google-sheet-distretto-3',
      'Distretto 4': '1-id-google-sheet-distretto-4',
      'Distretto 5': '1YhBdp5vSY3wIzZq8r64LLmBGMkRird1cd5gathcxiOo',
      'Distretto 6': '1-id-google-sheet-distretto-6',
      'Distretto 7': '1-id-google-sheet-distretto-7',
      'Distretto 8': '1-id-google-sheet-distretto-8',
      'Distretto 9': '1-id-google-sheet-distretto-9',
      'Distretto 10': '1-id-google-sheet-distretto-10',
      'Distretto 11': '1-jWjnButxLpJEOr8AxKaY8cH57J2IOgU9S5fzV0npJw',
    };

    const sheetId = DISTRETTI_ID_MAP[distretto];
    if (!sheetId) {
      return new Response(JSON.stringify({ error: "Distretto non valido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = `https://script.google.com/macros/s/AKfycbyjHPLoOm8CXz1noBA3VWA-zSnuc--TWsjAYjxed363Jw13yT0PikPsRfilb5aaLQ4/exec?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&sheetId=${sheetId}`;

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
