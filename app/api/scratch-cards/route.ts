import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import ScratchCard from '@/models/ScratchCard';
import User from '@/models/User';
import Activity from '@/models/Activity';
import { sendNotification } from '@/lib/notifier';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

/**
 * Helper to generate a unique 8-character alphanumeric code
 */
function generateCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Helper to get admin name from session
 */
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
    const { userId, amount } = await request.json();

    if (!userId || !amount) {
      return NextResponse.json(
        { error: 'User ID and Amount are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch user details for notification
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate unique code and ensure it doesn't collide
    let code = generateCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await ScratchCard.findOne({ code });
      if (!existing) {
        isUnique = true;
      } else {
        code = generateCode();
        attempts++;
      }
    }

    const scratchCard = await ScratchCard.create({
      userId,
      amount,
      code,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    });

    // Trigger Multi-Channel Notifications
    const channels = [];
    
    // 1. Always send via Email
    await sendNotification(user, 'EMAIL', { amount, code });
    channels.push('Email');

    // 2. Send via SMS if phone number exists
    if (user.phoneNumber) {
      await sendNotification(user, 'SMS', { amount, code });
      channels.push('SMS');
    }

    // Log the activity with channel details
    const adminName = await getAdminName();
    await Activity.create({
      action: 'Scratch Card Created',
      details: `Generated $${amount} card for ${user.email} (${channels.join(' & ')})`,
      adminName
    });

    return NextResponse.json({
      success: true,
      scratchCard
    });

  } catch (error: any) {
    console.error('Scratch Card API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
