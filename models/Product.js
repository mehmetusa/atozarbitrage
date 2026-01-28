import mongoose from 'mongoose';
import slugify from 'slugify';

// Counter for SKU sequence
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 99 },
});

const Counter = mongoose.models.ProductCounter || mongoose.model('ProductCounter', counterSchema);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    prices: { type: [Number], required: true },
    imgs: { type: [String], required: true },
    category: { type: String, required: true },
    ingredients: { type: [String], default: [] },
    extraOptions: { type: [{ text: String, price: Number }], default: [] },

    // Flags
    isNew: { type: Boolean, default: false },
    isHot: { type: Boolean, default: false },
    isOrganic: { type: Boolean, default: false },
    isVegeterian: { type: Boolean, default: false },
    isShippingOk: { type: Boolean, default: false },
    isLive: { type: Boolean, default: true },
    isSoldOut: { type: Boolean, default: false },
    isFreeShipping: { type: Boolean, default: false },
    isInStock: { type: Boolean, default: true },
    isBakedToday: { type: Boolean, default: false },
    isDiscounted: { type: Number, default: 0, min: 0, max: 100 },

    // SKU: sequential 4-digit string
    sku: {
      type: String,
      unique: true,
      match: [/^\d{4}$/, 'SKU must be a 4-digit number'],
    },

    // shortId: random unique string
    shortId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // ✅ SEO fields
    slug: { type: String, unique: true, index: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for discounted prices
ProductSchema.virtual('finalPrices').get(function () {
  if (!this.isDiscounted || this.isDiscounted <= 0 || this.isSoldOut) return this.prices;
  const discount = this.isDiscounted / 100;
  return this.prices.map((p) => Number((p - p * discount).toFixed(2)));
});

// Pre-save hook
ProductSchema.pre('save', async function (next) {
  try {
    // Generate SKU
    if (!this.sku) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'productId' },
        { $inc: { seq: 1 }, $setOnInsert: { _id: 'productId' } },
        { new: true, upsert: true },
      );
      this.sku = counter.seq.toString().padStart(4, '0');
    }

    // Generate shortId
    if (!this.shortId) {
      let id;
      let exists = true;
      while (exists) {
        id = Math.floor(Math.random() * 90000000 + 10000000).toString();
        exists = await this.constructor.findOne({ shortId: id });
      }
      this.shortId = id;
    }

    // Generate slug
    if (!this.slug && this.title) {
      this.slug = slugify(`${this.title} ${this.sku || ''}`, { lower: true, strict: true });
    }

    // Compute min and max price
    let minPrice = this.prices.length ? Math.min(...this.prices) : 0;
    if (this.isDiscounted && this.isDiscounted > 0) {
      minPrice = Number((minPrice * (1 - this.isDiscounted / 100)).toFixed(2));
    }

    // Labels
    const labels = [];
    if (this.isOrganic) labels.push('Organic');
    if (this.isVegeterian) labels.push('Vegetarian');

    // Auto-fill metaTitle
    if (!this.metaTitle) {
      this.metaTitle = `${this.title} | ${this.category} | Noordon Bakery`;
    }

    // Auto-fill metaDescription
    if (!this.metaDescription) {
      let descSnippet = this.desc.length > 120 ? this.desc.slice(0, 117) + '...' : this.desc;
      const labelText = labels.length ? ` (${labels.join(', ')})` : '';
      this.metaDescription = `${descSnippet}${labelText} – Starting at $${minPrice}. Order now from Noordon Bakery!`;
    }

    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
