import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    const db = getDb();
    await db.$connect();
    
    // Try a simple query
    const userCount = await db.user.count();
    
    await db.$disconnect();
    
    return NextResponse.json({ 
      message: "Good!", 
      database: "Connected",
      userCount 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      message: "Database connection failed", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}