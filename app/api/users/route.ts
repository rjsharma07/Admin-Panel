import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Activity from '@/models/Activity';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

/**
 * Helper to get admin name from token
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

/**
 * GET: Fetch users with pagination, search, and sorting
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters with defaults
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    await dbConnect();

    // Build query object
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination values
    const skip = (page - 1) * limit;

    // Execute queries
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .limit(limit)
        .skip(skip),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users,
      totalUsers,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new user
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phoneNumber, role, status } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Name and Email are required' },
        { status: 400 }
      );
    }

    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if email already exists manually
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email Already Exists' },
        { status: 400 }
      );
    }

    // Phone Number Validation & Unique Check
    if (phoneNumber) {
      if (!/^\d+$/.test(phoneNumber)) {
        return NextResponse.json(
          { error: 'Invalid Phone Number', message: 'Phone number must contain only digits' },
          { status: 400 }
        );
      }

      const existingPhone = await User.findOne({ phoneNumber });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone Number Already Exists' },
          { status: 400 }
        );
      }
    }
    
    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      role: role || 'User',
      status: status || 'Active',
    });

    // Log Activity
    const adminName = await getAdminName();
    await Activity.create({
      action: 'User Created',
      details: `Added new user: ${email} (${name})`,
      adminName
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update an existing user
 * Accepts User ID via query parameter
 */
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'User ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Phone Number Validation & Unique Check for Update
    if (updateData.phoneNumber) {
      if (!/^\d+$/.test(updateData.phoneNumber)) {
        return NextResponse.json(
          { error: 'Invalid Phone Number', message: 'Phone number must contain only digits' },
          { status: 400 }
        );
      }

      const existingPhone = await User.findOne({ 
        phoneNumber: updateData.phoneNumber, 
        _id: { $ne: id } 
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone Number Already Exists' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      );
    }

    // Log Activity
    const adminName = await getAdminName();
    await Activity.create({
      action: 'User Updated',
      details: `Updated details for: ${updatedUser.email}`,
      adminName
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove a user from the database
 * Accepts User ID via query parameter
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'User ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      );
    }

    // Log Activity
    const adminName = await getAdminName();
    await Activity.create({
      action: 'User Deleted',
      details: `Removed user: ${deletedUser.email}`,
      adminName
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
