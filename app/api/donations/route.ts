import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

// === GET Donations ===
export async function GET() {
  try {
    const client = await getClient();
    const db = client.db(dbName);
    const donations = await db.collection("donations").find({}).toArray();

    return NextResponse.json({ success: true, donations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// === POST Donation ===
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const client = await getClient();
    const db = client.db(dbName);
    const result = await db.collection("donations").insertOne({
      donor: body.donor || "Anonymous",
      type: body.type,
      quantity: body.quantity,
      expiry: body.expiry,
      address: body.address,
      createdAt: new Date(),
      status: "Available",
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
