import { NextResponse } from 'next/server';
import { getUser } from '@/lib/server-auth';
import { razorpay, getCreditPackage } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Create Razorpay order for credit purchase
export async function POST(request: Request) {
  try {
    const authUser = await getUser();

    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { credits } = await request.json();

    // Validate credit package
    const package_info = getCreditPackage(credits);
    if (!package_info) {
      return NextResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { id: true, name: true, email: true },
    });

    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: package_info.priceINR * 100, // Convert to paise
      currency: 'INR',
      receipt: `credit_${authUser.id}_${Date.now()}`,
      notes: {
        userId: authUser.id,
        credits: credits.toString(),
        purpose: 'credit_purchase',
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      credits: package_info.credits,
      user: {
        name: user.name,
        email: authUser.email,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Verify Razorpay payment and credit user account
export async function PUT(request: Request) {
  try {
    const authUser = await getUser();

    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { id: true, credits: true },
    });

    if (!authUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch order details from Razorpay
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const creditsValue = order.notes?.credits;
    const credits = parseInt(typeof creditsValue === 'string' ? creditsValue : String(creditsValue || '0'));

    // Create transaction and update user credits in a transaction
    const result = await prisma.$transaction([
      // Create credit transaction
      prisma.creditTransaction.create({
        data: {
          userId: authUser.id,
          amount: credits,
          reason: `Purchased ${credits} credits via Razorpay`,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      }),
      // Update user credits
      prisma.user.update({
        where: { id: authUser.id },
        data: {
          credits: {
            increment: credits,
          },
        },
        select: {
          credits: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${credits} credits to your account`,
      credits: result[1].credits,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
