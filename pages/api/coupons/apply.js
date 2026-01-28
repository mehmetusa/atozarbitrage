// pages/api/coupons/apply.js
import dbConnect from '../../../utils/mongo';
import Coupon from '../../../models/Coupon';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, message: 'Method not allowed' });
  }

  try {
    const { code, cartTotal, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ valid: false, message: 'Coupon code and userId are required' });
    }

    // Find the coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Coupon not found' });
    }

    // Expiry check
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({ valid: false, message: 'Coupon expired' });
    }

    // Min order value check
    if (cartTotal < (coupon.minOrderValue || 0)) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order value is $${coupon.minOrderValue}`,
      });
    }

    // Atomic update to prevent multiple usage by same user and respect maxUses
    const updatedCoupon = await Coupon.findOneAndUpdate(
      {
        _id: coupon._id,
        usedBy: { $ne: String(userId) },
        usedCount: { $lt: coupon.maxUses },
      },
      {
        $push: { usedBy: String(userId) },
        $inc: { usedCount: 1 },
      },
      { new: true },
    );

    if (!updatedCoupon) {
      return res.status(400).json({
        valid: false,
        message: 'Coupon already used by you or max usage reached',
      });
    }

    // Calculate discount
    let discount = 0;
    if (updatedCoupon.discountType === 'percentage') {
      discount = (cartTotal * updatedCoupon.value) / 100;
    } else {
      discount = updatedCoupon.value;
    }
    discount = Math.min(discount, cartTotal);

    return res.status(200).json({
      valid: true,
      discount,
      couponId: updatedCoupon._id,
      code: updatedCoupon.code,
      message: `Coupon applied! You get $${discount.toFixed(2)} off.`,
    });
  } catch (err) {
    console.error('Coupon apply error:', err);
    return res.status(500).json({ valid: false, message: 'Failed to apply coupon' });
  }
}
