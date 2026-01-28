import dbConnect from '../../../utils/mongo';
import Order from '../../../models/Order';

export default async function handler(req, res) {
  const {
    method,
    query: { id },
  } = req;

  await dbConnect();

  try {
    if (!id) return res.status(400).json({ error: 'Order ID is required' });

    switch (method) {
      case 'GET':
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        return res.status(200).json(order);

      case 'PUT':
        // Only allow specific updates for security
        const allowedUpdates = [
          'status',
          'deliveryStatus',
          'deliveryDate',
          'deliverySlot',
          'notes',
          'whom',
          'total',
          'discount',
          'tax',
          'method',
          'paymentStatus',
        ];

        const updates = {};
        for (let key of allowedUpdates) {
          if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        });

        if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });

        return res.status(200).json(updatedOrder);

      case 'DELETE':
        const deletedOrder = await Order.findByIdAndDelete(id);
        if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
        return res.status(200).json({ message: 'Order deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (err) {
    console.error(`${method} /orders/[id] error:`, err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
