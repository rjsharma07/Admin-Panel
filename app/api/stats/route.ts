import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Activity from '@/models/Activity';
import ScratchCard from '@/models/ScratchCard';

export async function GET() {
  try {
    await dbConnect();
    
    // Perform all database queries in parallel for maximum efficiency
    const [totalUsers, activeUsers, totalScratchCards, recentActivity] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'Active' }),
      ScratchCard.countDocuments(),
      Activity.find({}).sort({ timestamp: -1 }).limit(10) // Fetching a few more for the dashboard feed
    ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalScratchCards,
      recentActivity
    });
  } catch (error: any) {
    console.error('Stats API Final Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
