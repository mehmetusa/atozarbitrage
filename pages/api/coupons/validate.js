// pages/api/coupons/apply.js
import dbConnect from '../../../utils/mongo';
import Coupon from '../../../models/Coupon';

export default async function handler(req, res) {
  await dbConnect();

  console.log('req:', req);

  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, message: 'Method not allowed' });
  }

  try {
    const { code, cartTotal, userId } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Coupon code is required' });
    if (!userId) return res.status(400).json({ valid: false, message: 'User ID is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ valid: false, message: 'Coupon not found' });

    // Expiry check
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({ valid: false, message: 'Coupon expired' });
    }

    // Prevent same user from reusing
    if (coupon.usedBy.includes(userId)) {
      return res.status(400).json({ valid: false, message: 'You have already used this coupon' });
    }

    // Max usage check
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ valid: false, message: 'Coupon usage limit reached' });
    }

    // Min order value
    if (cartTotal < (coupon.minOrderValue || 0)) {
      return res
        .status(400)
        .json({ valid: false, message: `Minimum order value is $${coupon.minOrderValue}` });
    }

    // Calculate discount
    let discount =
      coupon.discountType === 'percentage' ? (cartTotal * coupon.value) / 100 : coupon.value;
    discount = Math.min(discount, cartTotal);

    // ✅ Mark coupon as used by this user
    coupon.usedCount += 1;
    coupon.usedBy.push(userId);
    if (coupon.usedCount >= coupon.maxUses) coupon.status = 'used';
    await coupon.save();

    res.status(200).json({
      valid: true,
      discount,
      couponId: coupon._id,
      code: coupon.code,
      message: `Coupon applied! You get $${discount.toFixed(2)} off.`,
    });
  } catch (err) {
    console.error('Coupon apply error:', err);
    res.status(500).json({ valid: false, message: 'Failed to apply coupon' });
  }
}
