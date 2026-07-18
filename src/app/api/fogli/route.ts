import {
  NextRequest,
  NextResponse,
} from "next/server";

import { sheets } from "@/app/lib/google";

const SHEETS_MAP: Record<
  string,
  string | undefined
> = {
  distretto1:
    process.env.SHEET_ID_1,

  distretto2:
    process.env.SHEET_ID_2,

  distretto3:
    process.env.SHEET_ID_3,

  distretto4:
    process.env.SHEET_ID_4,

  distretto5:
    process.env.SHEET_ID_5,

  distretto6:
    process.env.SHEET_ID_6,

  distretto8:
    process.env.SHEET_ID_8,

  distretto9:
    process.env.SHEET_ID_9,

  distretto10:
    process.env.SHEET_ID_10,

  distretto11:
    process.env.SHEET_ID_11,
};


export async function GET(
  req: NextRequest
) {
  try {
    const { searchParams } = new URL(
      req.url
    );

    const distretto = (
      searchParams.get("distretto") ||
      "distretto1"
    ).trim();

    console.log(
      "DISTRETTO:",
      distretto
    );

    const spreadsheetId =
      SHEETS_MAP[distretto];

    console.log(
      "SPREADSHEET ID:",
      spreadsheetId
    );

    if (!spreadsheetId) {
      return NextResponse.json(
        {
          error:
            "Spreadsheet ID non trovato",
        },
        {
          status: 400,
        }
      );
    }


    const response =
      await sheets.spreadsheets.values.get({
        spreadsheetId,

        // Il foglio dentro Google si chiama Foglio1
        range: "Foglio1!A:CX",
      });


    console.log(
      "DATI:",
      JSON.stringify(
        response.data.values,
        null,
        2
      )
    );


    return NextResponse.json(
      response.data.values || []
    );


  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "Errore caricamento",
      },
      {
        status: 500,
      }
    );
  }
}



export async function POST(
  req: NextRequest
) {

  try {

    const body = await req.json();

    const {
      distretto,
      values,
    } = body;


    const spreadsheetId =
      SHEETS_MAP[distretto];


    if (!spreadsheetId) {

      return NextResponse.json(
        {
          error:
            "Spreadsheet ID non trovato",
        },
        {
          status: 400,
        }
      );
    }


    await sheets.spreadsheets.values.update({

      spreadsheetId,

      // CORRETTO: non deve essere distretto5!
      range: "Foglio1!A1",

      valueInputOption:
        "USER_ENTERED",

      requestBody: {
        values,
      },

    });


    return NextResponse.json({
      success: true,
    });


  } catch (error: any) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "Errore salvataggio",
      },
      {
        status: 500,
      }
    );
  }
}