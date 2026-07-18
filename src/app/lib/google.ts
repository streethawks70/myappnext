import { google } from "googleapis";

const serviceAccount = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"
);

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email:
      serviceAccount.client_email,

    private_key:
      serviceAccount.private_key,
  },

  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

export const sheets = google.sheets({
  version: "v4",
  auth,
});