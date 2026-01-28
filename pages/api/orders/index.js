// pages/api/orders/index.js
import dbConnect from '../../../utils/mongo';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import Coupon from '../../../models/Coupon';
import mongoose from 'mongoose';
import sendInvoice from '../../../utils/send-invoice';

const FREE_SHIPPING_THRESHOLD = 250;
const DEFAULT_SHIPPING_FEE = 25;
const TAX_RATE = 0.06;

const safeNumber = (value) => (isNaN(Number(value)) ? 0 : Number(value));

const generateDisplayId = async () => {
  let id,
    exists = true;
  while (exists) {
    id = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Order.findOne({ displayId: id });
  }
  return id;
};

const normalizeItems = async (items) =>
  Promise.all(
    items.map(async (item) => {
      if (!item.productId) return item;
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return {
        productId: product._id,
        title: product.title,
        price: safeNumber(item.price || product.prices?.[0] || 0),
        quantity: safeNumber(item.quantity || 1),
        size: item.size || 'Standard',
        image: product.imgs?.[0] || '',
        notes: item.notes || '',
        whom: item.whom || '',
        extras: (item.extras || []).map((e) => ({
          text: e.text,
          price: safeNumber(e.price),
        })),
      };
    }),
  );

const calculateSubtotal = (items) =>
  items.reduce(
    (sum, i) =>
      sum + i.quantity * i.price + (i.extras?.reduce((exSum, e) => exSum + e.price, 0) || 0),
    0,
  );

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  try {
    switch (method) {
      // ---------------- POST /api/orders ----------------
      case 'POST': {
        const {
          userId,
          customer,
          items = [],
          notes = '',
          whom = '',
          metadata = {},
          couponCode,
          paymentMethod = 'cod',
        } = req.body;

        if (!customer?.name || !customer?.email)
          return res.status(400).json({ message: 'Customer name and email are required' });

        const addr = customer.address || {};
        if (!addr.street || !addr.city || !addr.state || !addr.zip || !addr.country)
          return res.status(400).json({ message: 'Complete customer address is required' });

        if (!items.length)
          return res.status(400).json({ message: 'Order must contain at least one item' });

        const normalizedItems = await normalizeItems(items);
        const subtotal = calculateSubtotal(normalizedItems);
        const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;

        // --- Handle coupon ---
        let discount = 0;
        let couponObj = null;

        if (couponCode) {
          couponObj = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
          if (!couponObj) return res.status(404).json({ message: 'Coupon not found' });

          const userIdStr = String(userId);
          const usedByStrArray = (couponObj.usedBy || []).map((id) => String(id));

          if (usedByStrArray.includes(userIdStr)) {
            return res.status(400).json({ message: 'User already used this coupon' });
          }

          // Calculate discount
          discount =
            couponObj.discountType === 'percentage'
              ? (subtotal * couponObj.value) / 100
              : couponObj.value;
          discount = Math.min(discount, subtotal);
        }

        const taxableAmount = subtotal - discount;
        const tax = safeNumber(taxableAmount * TAX_RATE);
        const total = taxableAmount + tax + shippingFee;

        // --- Map payment method ---
        const methodCode = paymentMethod === 'stripe' ? 1 : 0;
        const paymentStatus = paymentMethod === 'stripe' ? 'Unpaid' : 'Pending';

        // --- Create order ---
        const order = await Order.create({
          displayId: await generateDisplayId(),
          userId,
          customer,
          items: normalizedItems,
          subtotal,
          discount,
          tax,
          shippingFee,
          total,
          method: methodCode,
          paymentStatus,
          deliveryDate: metadata?.deliveryDate ? new Date(metadata.deliveryDate) : new Date(),
          deliverySlot: metadata?.deliverySlot || '08:00–10:00',
          notes,
          whom,
          couponId: couponObj?._id || null,
          usedCouponCode: couponObj?.code || null,
          status: 0,
        });

        // --- Mark coupon as used AFTER successful order creation ---
        if (couponObj) {
          couponObj.usedBy = couponObj.usedBy || [];
          couponObj.usedBy.push(String(userId)); // always store as string
          couponObj.usedCount = (couponObj.usedCount || 0) + 1;
          await couponObj.save();
        }

        // --- Send invoices ---
        try {
          await sendInvoice(order, order.customer.email);
          await sendInvoice(order, 'inoordon@gmail.com');
        } catch (err) {
          console.error('Failed to send invoice:', err);
        }

        return res.status(201).json(order);
      }

      // ---------------- GET ORDERS ----------------
      case 'GET': {
        const { displayId, email, admin, page = 1, limit = 10, status } = req.query;
        let filter = {};

        if (!admin) {
          if (displayId) filter.displayId = displayId;
          if (email) filter['customer.email'] = email;
        } else if (status !== undefined) {
          filter.status = parseInt(status);
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limitNum);

        const orders = await Order.find(filter)
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum);

        return res.status(200).json({ orders, totalOrders, totalPages, page: pageNum });
      }

      // ---------------- UPDATE ORDER ----------------
      case 'PUT': {
        const { orderId, updates } = req.body;
        if (!orderId) return res.status(400).json({ message: 'orderId is required' });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

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
          'shippingFee',
          'method',
          'paymentStatus',
          'items',
        ];

        allowedUpdates.forEach((key) => {
          if (updates[key] !== undefined) order[key] = updates[key];
        });

        await order.save();
        return res.status(200).json(order);
      }

      // ---------------- DELETE ORDER ----------------
      case 'DELETE': {
        const { orderId } = req.query;
        if (!orderId) return res.status(400).json({ message: 'orderId is required' });

        const deleted = await Order.findByIdAndDelete(orderId);
        if (!deleted) return res.status(404).json({ message: 'Order not found' });

        return res.status(200).json({ message: 'Order deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Method ${method} not allowed` });
    }
  } catch (err) {
    console.error(`${method} /orders error:`, err);
    return res.status(500).json({ message: err.message });
  }
}
