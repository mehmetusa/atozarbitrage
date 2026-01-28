// pages/api/coupons/index.js
import dbConnect from '../../../utils/mongo';
import Coupon from '../../../models/Coupon';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const total = await Coupon.countDocuments({});
      const coupons = await Coupon.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit);

      return res.status(200).json({
        coupons,
        page,
        totalPages: Math.ceil(total / limit),
        total,
      });
    } catch (err) {
      console.error('Error fetching coupons:', err);
      return res.status(500).json({ error: 'Failed to fetch coupons' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { code, discountType, value, maxUses, minOrderValue, expiryDate } = req.body;

      const exists = await Coupon.findOne({ code: code.toUpperCase() });
      if (exists) return res.status(400).json({ error: 'Coupon code already exists' });

      const coupon = await Coupon.create({
        code: code.toUpperCase(),
        discountType,
        value,
        maxUses,
        usedCount: 0,
        usedBy: [],
        minOrderValue,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: 'ready',
        active: true,
      });

      return res.status(201).json(coupon);
    } catch (err) {
      console.error('Error creating coupon:', err);
      return res.status(500).json({ error: 'Failed to create coupon' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
