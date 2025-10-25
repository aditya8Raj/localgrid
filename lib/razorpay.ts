import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are not configured');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Credit packages (in INR)
export const CREDIT_PACKAGES = [
  { credits: 100, priceINR: 100, label: '100 Credits' },
  { credits: 500, priceINR: 450, label: '500 Credits', discount: '10% off' },
  { credits: 1000, priceINR: 800, label: '1000 Credits', discount: '20% off' },
  { credits: 5000, priceINR: 3500, label: '5000 Credits', discount: '30% off' },
];

export function getCreditPackage(credits: number) {
  return CREDIT_PACKAGES.find((pkg) => pkg.credits === credits);
}
