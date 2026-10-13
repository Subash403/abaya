import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, receipt, notes } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order amount.' },
        { status: 400 }
      );
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Convert INR to Paise
    const amountInPaise = Math.round(Number(amount) * 100);

    // If real keys are present in env
    if (keyId && keySecret && !keyId.includes('your-key-id')) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: (receipt || `rcpt_${Date.now()}`).slice(0, 40),
        notes: notes || {},
      });

      return NextResponse.json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId,
        isSimulated: false,
      });
    }

    // Graceful Test/Sandbox fallback when keys are pending setup
    const simulatedOrderId = `order_test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return NextResponse.json({
      success: true,
      orderId: simulatedOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: keyId || 'rzp_test_walaabaya_chennai',
      isSimulated: true,
      message: 'Razorpay sandbox initialized. Real keys can be configured in .env.local',
    });
  } catch (err: unknown) {
    console.error('Razorpay Create Order Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Payment service error' },
      { status: 500 }
    );
  }
}
