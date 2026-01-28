// pages/api/products/[id].js
import dbConnect from '../../../utils/mongo';
import Product from '../../../models/Product';
import { getToken } from 'next-auth/jwt';

const FLAG_FILTERS = [
  'isBakedToday',
  'isDiscounted',
  'isFreeShipping',
  'isHot',
  'isInStock',
  'isLive',
  'isNew',
  'isOrganic',
  'isShippingOk',
  'isSoldOut',
  'isVegeterian',
];

export default async function handler(req, res) {
  const {
    method,
    query: { id, page = 1, limit = 10, ...rest },
  } = req;

  await dbConnect();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  try {
    switch (method) {
      case 'GET':
        // If ID provided → fetch single product
        if (id) {
          const product = await Product.findById(id).lean();
          if (!product) return res.status(404).json({ message: 'Product not found' });

          product._id = product._id.toString();
          if (product.extraOptions) {
            product.extraOptions = product.extraOptions.map((opt) => ({
              ...opt,
              _id: opt._id.toString(),
            }));
          }

          return res.status(200).json(product);
        }

        // If no ID → fetch list with filters
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const filters = {};

        if (rest.category) filters.category = rest.category;
        FLAG_FILTERS.forEach((flag) => {
          if (rest[flag] === 'true') filters[flag] = true;
        });

        const totalProducts = await Product.countDocuments(filters);
        const products = await Product.find(filters)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean();

        const formattedProducts = products.map((p) => {
          p._id = p._id.toString();
          if (p.extraOptions) {
            p.extraOptions = p.extraOptions.map((opt) => ({
              ...opt,
              _id: opt._id.toString(),
            }));
          }
          return p;
        });

        return res.status(200).json({
          products: formattedProducts,
          page: parseInt(page),
          pages: Math.ceil(totalProducts / parseInt(limit)),
          total: totalProducts,
        });

      case 'PUT':
        if (!token || token.role !== 'admin') return res.status(401).json({ message: 'Not authenticated!' });
        if (!id) return res.status(400).json({ message: 'Product ID is required' });

        const updateFields = [
          'title','desc','prices','category','extraOptions','imgs','ingredients',
          'isHot','isNew','isLive','isOrganic','isVegeterian','isDiscounted','isShippingOk',
          'isSoldOut','isFreeShipping','isInStock','isBakedToday'
        ];

        const updates = {};
        for (let field of updateFields) {
          if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

        if (updatedProduct.extraOptions) {
          updatedProduct.extraOptions = updatedProduct.extraOptions.map((opt) => ({
            ...opt,
            _id: opt._id.toString(),
          }));
        }

        return res.status(200).json(updatedProduct);

      case 'DELETE':
        if (!token || token.role !== 'admin') return res.status(401).json({ message: 'Not authenticated!' });
        if (!id) return res.status(400).json({ message: 'Product ID is required' });

        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Product not found' });

        return res.status(200).json({ message: 'Product deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error(`${method} /products error:`, err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}
