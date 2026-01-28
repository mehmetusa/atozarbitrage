// pages/api/coupons/[id].js
import dbConnect from '../../../utils/mongo';
import Coupon from '../../../models/Coupon';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { status, active } = req.body;

      const updated = await Coupon.findByIdAndUpdate(
        id,
        { ...(status && { status }), ...(active !== undefined && { active }) },
        { new: true },
      );

      if (!updated) return res.status(404).json({ error: 'Coupon not found' });

      return res.status(200).json(updated);
    } catch (err) {
      console.error('Error updating coupon:', err);
      return res.status(500).json({ error: 'Failed to update coupon' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await Coupon.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Coupon not found' });

      return res.status(200).json({ message: 'Coupon deleted' });
    } catch (err) {
      console.error('Error deleting coupon:', err);
      return res.status(500).json({ error: 'Failed to delete coupon' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
