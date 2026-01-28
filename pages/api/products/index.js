// pages/api/products/index.js
import dbConnect from '../../../utils/mongo';
import Product from '../../../models/Product';
import Category from '../../../models/Category';
import { getToken } from 'next-auth/jwt';

// ---------- Helper: Build filter object ----------
const buildFilter = (query) => {
  const { category, search, isOrganic, isVegeterian, isShippingOk, isLive, ingredient } = query;
  const filter = {};

  // Category filter
  if (category && category.toLowerCase() !== 'all products' && category.toLowerCase() !== 'all') {
    filter.category = category.toLowerCase();
  }

  // Search keywords
  let modifiedSearch = search;
  if (search) {
    const lowerSearch = search.toLowerCase();
    if (lowerSearch.includes('organic')) filter.isOrganic = true;
    if (lowerSearch.includes('vegetarian') || lowerSearch.includes('vegeterian'))
      filter.isVegeterian = true;

    modifiedSearch = lowerSearch.replace(/organic|vegetarian|vegeterian/g, '').trim();
    if (modifiedSearch) filter.title = { $regex: modifiedSearch, $options: 'i' };
  }

  // Other filters
  if (isOrganic !== undefined) filter.isOrganic = isOrganic === 'true';
  if (isVegeterian !== undefined) filter.isVegeterian = isVegeterian === 'true';
  if (isShippingOk !== undefined) filter.isShippingOk = isShippingOk === 'true';
  if (isLive !== undefined) filter.isLive = isLive === 'true';
  if (ingredient) filter.ingredients = { $regex: ingredient, $options: 'i' };

  return filter;
};

// ---------- Helper: Build sort option ----------
const buildSort = (sort) => {
  switch (sort) {
    case 'price_asc':
      return { 'prices.0': 1 };
    case 'price_desc':
      return { 'prices.0': -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'title_asc':
      return { title: 1 };
    case 'title_desc':
      return { title: -1 };
    default:
      return { createdAt: -1 };
  }
};

// ---------- Helper: Serialize Dates ----------
const serializeDates = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (value instanceof Date) return value.toISOString();
      return value;
    }),
  );
};

// ---------- API Handler ----------
export default async function handler(req, res) {
  const { method, query, body } = req;

  await dbConnect();

  try {
    switch (method) {
      // ---------------- GET ----------------
      case 'GET': {
        const page = parseInt(query.page || 1, 10);
        const limit = parseInt(query.limit || 12, 10);
        const sortOption = buildSort(query.sort);
        const filter = buildFilter(query);
        const skip = (page - 1) * limit;

        const products = await Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean();
        const categories = await Category.find({}).lean();
        const total = await Product.countDocuments(filter);

        return res.status(200).json({
          products: serializeDates(products),
          total,
          page,
          pages: Math.ceil(total / limit),
          categories: serializeDates(categories),
        });
      }

      // ---------------- POST ----------------
      case 'POST': {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token || token.role !== 'admin') {
          return res.status(401).json({ message: 'Not authenticated!' });
        }

        const product = await Product.create(body);
        return res.status(201).json(serializeDates(product.toObject({ virtuals: true })));
      }

      // ---------------- METHOD NOT ALLOWED ----------------
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.error(`${method} /products/index error:`, err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}
