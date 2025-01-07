import { NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/openai";
import { getCollection } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const response = await getChatCompletion(messages);
    
    // Store the conversation in MongoDB
    const collection = await getCollection("businessChats");
    await collection.insertOne({
      messages: [...messages, { role: 'assistant', content: response }],
      timestamp: new Date(),
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat completion:", error);
    return NextResponse.json(
      { error: "Failed to get chat completion" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const collection = await getCollection("businessChats");
    const chats = await collection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
} 