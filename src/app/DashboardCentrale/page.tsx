"use client";

import { Edit, FileText } from "lucide-react";
import Link from "next/link";

export default function Dashboardpage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Dashboard
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Seleziona l'area che vuoi gestire.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/fogli"
            className="flex items-center justify-between rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-4 transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Edit className="w-6 h-6" />
              <span className="font-semibold text-lg">Fogli</span>
            </div>
            <span>→</span>
          </Link>

          <Link
            href="/listini"
            className="flex items-center justify-between rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-4 transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <span className="font-semibold text-lg">Listini</span>
            </div>
            <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}