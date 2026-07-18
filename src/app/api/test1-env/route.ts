import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    GOOGLE_SHEET_ID_1:
      process.env.SHEET_ID_1, 
       GOOGLE_SHEET_ID_11:
      process.env.SHEET_ID_11, 
        GOOGLE_SHEET_ID_2:
      process.env.SHEET_ID_2, 
        GOOGLE_SHEET_ID_3:
      process.env.SHEET_ID_3, 
       GOOGLE_SHEET_ID_4:
      process.env.SHEET_ID_4, 
       GOOGLE_SHEET_ID_5:
      process.env.SHEET_ID_5, 
       GOOGLE_SHEET_ID_6:
      process.env.SHEET_ID_6, 
       GOOGLE_SHEET_ID_7:
      process.env.SHEET_ID_7, 
       GOOGLE_SHEET_ID_8:
      process.env.SHEET_ID_8,
       GOOGLE_SHEET_ID_9:
      process.env.SHEET_ID_9, 
       GOOGLE_SHEET_ID_10:
      process.env.SHEET_ID_10,  
      

    ALL_ENV_KEYS: Object.keys(
      process.env
    ).filter((k) =>
      k.includes("GOOGLE")
    ),
  });
}