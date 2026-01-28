import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Products.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBreadSlice,
  faBirthdayCake,
  faIceCream,
  faBowlFood,
  faUtensils,
  faCookie,
  faCoffee,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons';
import LiveSearch from '../components/LiveSearch';
import axios from 'axios';
import dbConnect from '../utils/mongo';
import Product from '../models/Product';
import Category from '../models/Category';

const categoryIcons = {
  All: faShoppingCart,
  Bakery: faBreadSlice,
  Cakes: faBirthdayCake,
  Desserts: faIceCream,
  Salads: faBowlFood,
  Savory: faUtensils,
  Cookies: faCookie,
  Drinks: faCoffee,
};

const backgrounds = [
  '#fff0f5',
  '#ffe4e1',
  '#ffdde4',
  '#ffd8d8',
  '#ffe0e6',
  '#ffccd5',
  '#f8e0f7',
  '#fce4ec',
];

const Products = ({ products, categories, activeCategory, total, page, pages }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const router = useRouter();

  const toggleDropdown = () => setShowDropdown((prev) => !prev);
  const handleCategorySelect = () => setShowDropdown(false);

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    router.push({
      pathname: '/products',
      query: { ...router.query, sort: value, page: 1 },
    });
  };

  const handlePageChange = (p) => {
    router.push({
      pathname: '/products',
      query: { ...router.query, page: p },
    });
  };

  const sortedProducts = useMemo(() => {
    const filteredProducts = products.filter((p) => p.isLive);
    return filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [products]);

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={styles.separator}>›</span>
        <span>Products</span>
        {activeCategory !== 'All' && (
          <>
            <span className={styles.separator}>›</span>
            <span>{activeCategory}</span>
          </>
        )}
      </nav>

      {/* Sticky Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.live}>
          <LiveSearch />
        </div>

        <div className={styles.sortWrapper}>
          <select value={sortBy} onChange={handleSortChange}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Categories</h3>
          <ul className={styles.categoryList}>
            <li>
              <Link
                href="/products?category=All"
                className={activeCategory === 'All' ? styles.activeCat : ''}
              >
                <FontAwesomeIcon icon={categoryIcons['All']} className={styles.catIcon} /> All
                Products
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/products?category=${cat.name}`}
                  className={activeCategory === cat.name ? styles.activeCat : ''}
                >
                  <FontAwesomeIcon
                    icon={categoryIcons[cat.name] || faShoppingCart}
                    className={styles.catIcon}
                  />
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Mobile Dropdown */}
        <div className={styles.mobileDropdown}>
          <button className={styles.dropdownButton} onClick={toggleDropdown}>
            <FontAwesomeIcon
              icon={categoryIcons[activeCategory] || faShoppingCart}
              className={styles.catIcon}
            />
            {activeCategory} ▼
          </button>
          <ul
            className={`${styles.categoryListDropdown} ${showDropdown ? styles.showDropdown : ''}`}
          >
            <li>
              <Link
                href="/products?category=All"
                className={activeCategory === 'All' ? styles.activeCat : ''}
                onClick={handleCategorySelect}
              >
                <FontAwesomeIcon icon={categoryIcons['All']} className={styles.catIcon} /> All
                Products
              </Link>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/products?category=${cat.name}`}
                  className={activeCategory === cat.name ? styles.activeCat : ''}
                  onClick={handleCategorySelect}
                >
                  <FontAwesomeIcon
                    icon={categoryIcons[cat.name] || faShoppingCart}
                    className={styles.catIcon}
                  />{' '}
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Product Grid */}
        <section className={styles.productGrid}>
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product, idx) => (
              <Link key={product._id} href={`/product/${product._id}`} className={styles.cardLink}>
                <div
                  className={styles.card}
                  style={{ backgroundColor: backgrounds[idx % backgrounds.length] }}
                >
                  <div className={styles.imageWrapper}>
                    <Image
                      src={product.imgs?.[0] || '/img/placeholder.png'}
                      alt={product.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.productTitle}>{product.title}</h3>
                    <p className={styles.sku}>SKU: {product.sku || 'N/A'}</p>
                    <p className={styles.price}>
                      {product.prices?.length ? `$${product.prices[0]}` : 'No price'}
                    </p>
                    <button className={styles.button}>View Details</button>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className={styles.noProducts}>No products found.</p>
          )}
        </section>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i + 1}
              className={page === i + 1 ? 'active' : ''}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// SEO
Products.seo = (activeCategory) => ({
  title: `Products${activeCategory !== 'All' ? ` - ${activeCategory}` : ''}`,
  description: `Browse our ${activeCategory !== 'All' ? activeCategory.toLowerCase() : 'delicious'} selection at Noordon Bakery. Freshly baked goods, cakes, desserts, and more.`,
});

// Fetch products

// ---------- Helpers ----------
const buildFilter = (query) => {
  const { category, search, isOrganic, isVegeterian, isShippingOk, isLive, ingredient } = query;
  const filter = {};

  if (category && category.toLowerCase() !== 'all') filter.category = category.toLowerCase();
  if (search) filter.title = { $regex: search, $options: 'i' };
  if (isOrganic !== undefined) filter.isOrganic = isOrganic === 'true';
  if (isVegeterian !== undefined) filter.isVegeterian = isVegeterian === 'true';
  if (isShippingOk !== undefined) filter.isShippingOk = isShippingOk === 'true';
  if (isLive !== undefined) filter.isLive = isLive === 'true';
  if (ingredient) filter.ingredients = { $regex: ingredient, $options: 'i' };

  return filter;
};

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

// ---------- SSR ----------
export const getServerSideProps = async ({ query }) => {
  const page = parseInt(query.page || 1, 10);
  const limit = parseInt(query.limit || 12, 10);
  const sort = query.sort || 'newest';
  const category = query.category || 'All';

  try {
    await dbConnect();

    const filter = buildFilter(query);
    const sortOption = buildSort(sort);
    const skip = (page - 1) * limit;

    const [products, total, categories] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
      Category.find({}).lean(),
    ]);

    // Serialize dates to pass to React
    const serializeDates = (obj) =>
      JSON.parse(
        JSON.stringify(obj, (key, value) => (value instanceof Date ? value.toISOString() : value)),
      );

    return {
      props: {
        products: serializeDates(products),
        categories: serializeDates(categories),
        activeCategory: category,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    console.error('SSR /products fetch error:', err);
    return {
      props: {
        products: [],
        categories: [],
        activeCategory: category,
        total: 0,
        page: 1,
        pages: 1,
      },
    };
  }
};

export default Products;
