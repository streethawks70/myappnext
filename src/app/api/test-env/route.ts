import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    GOOGLE_SHEET_ID_1:
      process.env.GOOGLE_SHEET_ID_1, 
       GOOGLE_SHEET_ID_11:
      process.env.GOOGLE_SHEET_ID_11, 
        GOOGLE_SHEET_ID_2:
      process.env.GOOGLE_SHEET_ID_2, 
        GOOGLE_SHEET_ID_3:
      process.env.GOOGLE_SHEET_ID_3, 
       GOOGLE_SHEET_ID_5:
      process.env.GOOGLE_SHEET_ID_5, 
      

    ALL_ENV_KEYS: Object.keys(
      process.env
    ).filter((k) =>
      k.includes("GOOGLE")
    ),
  });
}