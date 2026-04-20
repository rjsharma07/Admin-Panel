import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

async function getAdminName() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return 'System';
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.username || 'Admin';
  } catch (error) {
    return 'Admin';
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, amount, method } = body;

    if (!userId || !amount || !method) {
      return NextResponse.json({ error: 'Incomplete data' }, { status: 400 });
    }

    await dbConnect();

    // Log the activity
    const adminName = await getAdminName();
    await Activity.create({
      action: 'Scratch Card Sent',
      details: `Sent $${amount} card to ${userName || userId} via ${method}`,
      adminName
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
