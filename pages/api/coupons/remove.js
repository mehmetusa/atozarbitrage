import dbConnect from '../../../utils/mongo';
import Coupon from '../../../models/Coupon';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'PUT') {
    return res.status(405).json({ valid: false, message: 'Method not allowed' });
  }

  try {
    const { code, userId } = req.body;
    if (!code || !userId) {
      return res.status(400).json({ valid: false, message: 'Coupon code and userId are required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Coupon not found' });
    }

    // Remove user from usedBy and decrement usedCount
    const updatedCoupon = await Coupon.findOneAndUpdate(
      { _id: coupon._id, usedBy: String(userId) },
      { $pull: { usedBy: String(userId) }, $inc: { usedCount: -1 } },
      { new: true },
    );

    if (!updatedCoupon) {
      return res
        .status(400)
        .json({ valid: false, message: 'Coupon not applied or already removed' });
    }

    return res.status(200).json({ valid: true, message: 'Coupon removed successfully' });
  } catch (err) {
    console.error('Coupon remove error:', err);
    return res.status(500).json({ valid: false, message: 'Failed to remove coupon' });
  }
}
