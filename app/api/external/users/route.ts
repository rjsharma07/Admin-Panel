import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Validates the API Key from headers
 */
const isValidAuth = (request: Request) => {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === process.env.MOBILE_APP_KEY;
};

export async function POST(request: Request) {
  if (!isValidAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, allowUpdate, ...updateData } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
      await dbConnect();
    } catch (error) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Unified Conflict Check: Check for existing user by Email OR Phone
    const conflictQuery: any = {
      $or: [{ email }]
    };
    if (updateData.phoneNumber) {
      conflictQuery.$or.push({ phoneNumber: updateData.phoneNumber });
    }

    const matchedUser = await User.findOne(conflictQuery);

    if (matchedUser) {
      // Logic for existing match
      if (allowUpdate === true) {
        // If matched by email exactly, we can update
        if (matchedUser.email === email) {
          const updatedUser = await User.findOneAndUpdate(
            { email },
            { ...updateData },
            { new: true, runValidators: true }
          );
          return NextResponse.json({
            status: 'updated',
            user: updatedUser
          });
        } else {
          // Matched by PHONE but email differs - this is a conflict even with allowUpdate
          return NextResponse.json({ 
            error: 'Conflict', 
            message: 'A user with this phone number already exists under a different email.' 
          }, { status: 400 });
        }
      } else {
        // allowUpdate is false - reject any match
        return NextResponse.json({ 
          error: 'Conflict', 
          message: 'A user with this email or phone number already exists.' 
        }, { status: 400 });
      }
    } else {
      // Create new user
      const newUser = await User.create({
        email,
        ...updateData
      });
      return NextResponse.json({
        status: 'created',
        user: newUser
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error('External API POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isValidAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check query string first
    const { searchParams } = new URL(request.url);
    let email = searchParams.get('email');

    // fallback to body if not in query string
    if (!email) {
      try {
        const body = await request.json();
        email = body.email;
      } catch (e) {
        // Body might be empty or not JSON
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
      await dbConnect();
    } catch (error) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('External API DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
