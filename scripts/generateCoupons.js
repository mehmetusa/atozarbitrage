// scripts/generateCoupons.js
import dbConnect from '../utils/mongo';
import Coupon from '../models/Coupon';

function randomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

async function generateCoupons(count = 10, discountType = 'percentage', value = 10) {
  await dbConnect();

  const coupons = [];

  for (let i = 0; i < count; i++) {
    const code = randomCode();
    const coupon = await Coupon.create({
      code,
      discountType,
      value,
      maxUses: 1,
      status: 'ready',
    });
    coupons.push(coupon);
  }

  console.log(`Generated ${coupons.length} coupons:`);
  coupons.forEach((c) => console.log(`${c.code} - ${c.discountType} ${c.value}%`));
  process.exit(0);
}

// Example: generate 20 coupons with 15% off
generateCoupons(20, 'percentage', 15);
