// api/orders/by-session/[sessionId].js
import dbConnect from '../../../../utils/mongo';
import Order from '../../../../models/Order';

export default async function handler(req, res) {
  const { sessionId } = req.query; // ✅ match the file name

  await dbConnect();

  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

  try {
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.status(200).json(order);
  } catch (err) {
    console.error('Error fetching order by session:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
