import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const collection = await getCollection("businessNotes");
    const data = await request.json();

    const result = await collection.insertOne({
      ...data,
      timestamp: new Date(),
      createdAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error creating business note:", error);
    return NextResponse.json(
      { error: "Failed to create business note" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const collection = await getCollection("businessNotes");
    const notes = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching business notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch business notes" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const collection = await getCollection("businessNotes");

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting business note:", error);
    return NextResponse.json(
      { error: "Failed to delete business note" },
      { status: 500 }
    );
  }
} 