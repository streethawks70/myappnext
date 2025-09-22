import { NextRequest, NextResponse } from 'next/server';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwQhiVlzmFzcC01LH-SC3BPX2DtgftKndrpSr4Hq5mCh-X5qXPm5XNL7ZWI_PNbaSNa/exec';

export async function GET(request: NextRequest) {
  try {
    // Prendo i query params da request
    const url = new URL(request.url);
    const params = url.searchParams.toString();
    const response = await fetch(`${GAS_URL}?${params}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Errore GET' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Errore POST' }, { status: 500 });
  }
}
