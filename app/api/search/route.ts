import { NextRequest, NextResponse } from "next/server";
import { fetchSharesansarData } from "@/app/actions/fetch-sharesansar-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").toLowerCase();
  if (!query) return NextResponse.json({ error: "No query" }, { status: 400 });
  const stocks = await fetchSharesansarData();
  const found = stocks.find(
    (s) =>
      s.symbol.toLowerCase() === query ||
      s.company.toLowerCase().includes(query)
  );
  if (found) return NextResponse.json({ symbol: found.symbol });
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
