import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch the 10 most recent activities
    const activities = await Activity.find({})
      .sort({ timestamp: -1 })
      .limit(10);
      
    return NextResponse.json(activities);
  } catch (error: any) {
    console.error('Activities API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
