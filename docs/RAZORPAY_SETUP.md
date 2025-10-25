# Razorpay Setup Guide for LocalGrid

This guide will help you set up Razorpay payment gateway for the LocalGrid credit system.

## Why Razorpay?

- **India-Specific**: Designed for Indian businesses and supports INR
- **Multiple Payment Methods**: UPI, Cards, NetBanking, Wallets (Paytm, PhonePe, etc.)
- **No Setup Cost**: Free to start, only pay per transaction (~2%)
- **Instant Setup**: Test mode available immediately without KYC

## Step-by-Step Setup

### 1. Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Sign up with:
   - Email address
   - Phone number
   - Create password
3. Verify email and phone number

### 2. Get Test API Keys (for Development)

1. **Login** to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. **Switch to Test Mode**:
   - Top left corner has a toggle: "Test Mode" / "Live Mode"
   - Make sure **Test Mode** is selected (blue indicator)
3. **Navigate to Settings**:
   - Click on **Settings** (gear icon) in the left sidebar
   - Select **API Keys** under "Website and app settings"
4. **Generate Test Keys**:
   - Click **Generate Test Key** button
   - You'll see two keys:
     - **Key ID**: `rzp_test_XXXXXXXXXXXXXX` (starts with `rzp_test_`)
     - **Key Secret**: Click "Show" to reveal (never share publicly)

### 3. Update Environment Variables

Copy the keys to your `.env` file:

```env
# Razorpay Test Keys (for development)
RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="your_secret_key_here"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_XXXXXXXXXXXXXX"
```

**Important**: 
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are used server-side
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is used client-side (safe to expose)
- Never commit actual keys to Git

### 4. Test Payment Flow

**Test Mode Features**:
- ✅ No real money is charged
- ✅ All payment methods work
- ✅ Instant approval
- ✅ No KYC required

**Test Cards** (provided by Razorpay):
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI**:
- UPI ID: `success@razorpay`
- UPI ID (failure): `failure@razorpay`

### 5. Test the Credit Purchase Flow

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Login to LocalGrid** as a Project Creator or Skill Provider

3. **Navigate to Credits page**: `/credits`

4. **Select a credit package**:
   - 100₹ → 100 credits
   - 450₹ → 500 credits (10% discount)
   - 800₹ → 1000 credits (20% discount)
   - 3500₹ → 5000 credits (30% discount)

5. **Complete test payment**:
   - Razorpay checkout modal opens
   - Select payment method (Card/UPI/NetBanking)
   - Use test credentials
   - Payment succeeds
   - Credits added to your balance
   - Transaction appears in history

### 6. Go Live (Production Setup)

**Before going live, you need to**:

1. **Complete KYC**:
   - Navigate to **Account & Settings** → **Activation**
   - Submit business/individual documents
   - Wait for approval (1-2 days)

2. **Generate Live Keys**:
   - Switch to **Live Mode** in dashboard
   - Go to **Settings** → **API Keys**
   - Generate **Live Keys**

3. **Update Production Environment**:
   ```env
   # Razorpay Live Keys (for production)
   RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXXXX"
   RAZORPAY_KEY_SECRET="your_live_secret_key"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXXXX"
   ```

4. **Add to Vercel Environment Variables**:
   - Go to Vercel Dashboard → Your Project
   - Settings → Environment Variables
   - Add all Razorpay variables

### 7. Webhook Setup (Optional - for Production)

Webhooks notify your server about payment events.

1. **Navigate to Webhooks**:
   - Dashboard → Settings → Webhooks
   - Click **Create Webhook**

2. **Configure Webhook**:
   - Webhook URL: `https://your-domain.com/api/webhooks/razorpay`
   - Select Events:
     - `payment.authorized`
     - `payment.captured`
     - `payment.failed`
   - Click **Create**

3. **Copy Webhook Secret**:
   - After creation, you'll see a webhook secret
   - Add to `.env`:
     ```env
     RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
     ```

4. **Create Webhook Handler** (Future Enhancement):
   ```typescript
   // app/api/webhooks/razorpay/route.ts
   import { NextResponse } from 'next/server';
   import crypto from 'crypto';

   export async function POST(request: Request) {
     const body = await request.text();
     const signature = request.headers.get('x-razorpay-signature');
     
     // Verify signature
     const expectedSignature = crypto
       .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
       .update(body)
       .digest('hex');
     
     if (signature !== expectedSignature) {
       return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
     }
     
     const event = JSON.parse(body);
     
     // Handle payment events
     switch (event.event) {
       case 'payment.captured':
         // Payment successful
         break;
       case 'payment.failed':
         // Payment failed
         break;
     }
     
     return NextResponse.json({ status: 'ok' });
   }
   ```

## Security Best Practices

### 1. Never Expose Secret Keys
```typescript
// ❌ WRONG - Never send secret key to client
const secretKey = process.env.RAZORPAY_KEY_SECRET;

// ✅ CORRECT - Only use in server-side code
// Server components, API routes, server actions
```

### 2. Always Verify Signatures
```typescript
// Our implementation already does this:
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (generatedSignature !== razorpay_signature) {
  throw new Error('Payment verification failed');
}
```

### 3. Environment Variables
```bash
# .env (local development)
RAZORPAY_KEY_ID="rzp_test_xxx"
RAZORPAY_KEY_SECRET="secret_xxx"

# Vercel (production)
# Add all variables in Vercel Dashboard → Settings → Environment Variables
```

## Troubleshooting

### Issue: "Razorpay Key ID is required"
**Solution**: Make sure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `.env` and restart dev server

### Issue: "Payment verification failed"
**Solution**: Check that `RAZORPAY_KEY_SECRET` matches the dashboard value

### Issue: Razorpay checkout not opening
**Solution**: 
1. Check browser console for errors
2. Ensure Razorpay script is loaded: `<Script src="https://checkout.razorpay.com/v1/checkout.js" />`
3. Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is correct

### Issue: Payment succeeds but credits not added
**Solution**:
1. Check server logs for errors
2. Verify database connection
3. Check `/api/credits/purchase` route is working
4. Ensure Prisma transactions are successful

## Testing Checklist

- [ ] Test Mode enabled in Razorpay Dashboard
- [ ] API keys added to `.env` file
- [ ] Development server restarted after adding keys
- [ ] Can access `/credits` page
- [ ] Credit packages display correctly
- [ ] Razorpay checkout modal opens
- [ ] Test payment succeeds with test card
- [ ] Credits added to user balance
- [ ] Transaction appears in history
- [ ] Can use credits for booking payment

## Production Checklist

- [ ] KYC completed and approved
- [ ] Live Mode enabled in Razorpay Dashboard
- [ ] Live API keys generated
- [ ] Environment variables updated on Vercel
- [ ] Webhooks configured (optional)
- [ ] Test live payment in production
- [ ] Monitor transactions in Razorpay Dashboard

## Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **API Reference**: https://razorpay.com/docs/api/
- **Support**: https://razorpay.com/support/
- **Test Cards**: https://razorpay.com/docs/payment-gateway/test-card-details/

## Credit Conversion Rate

Current implementation:
- **₹1 = 1 credit**
- This can be adjusted in `/lib/razorpay.ts` if needed

Example:
```typescript
// Current packages in lib/razorpay.ts
export const CREDIT_PACKAGES = [
  { credits: 100, priceINR: 100 },    // No discount
  { credits: 500, priceINR: 450 },    // 10% discount
  { credits: 1000, priceINR: 800 },   // 20% discount
  { credits: 5000, priceINR: 3500 },  // 30% discount
];
```

---

**Ready to start accepting payments in India!** 🇮🇳💳
