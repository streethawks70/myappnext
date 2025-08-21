import { NextResponse } from 'next/server';

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycby186Z_HnAZYij-Xs87-xJ0Cf3WRPJ2G1n9YPEdqAilF5tiH_XU3vov7FCx36R8cBEK/exec';

export async function GET() {
  const res = await fetch(SCRIPT_URL);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
