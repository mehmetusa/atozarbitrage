import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addProduct } from '../../redux/cartSlice';
import styles from '../../styles/ProductDetail.module.css';
import Toast from '../../components/Toast';
import SEO from '../../components/SEO';
import RelatedProducts from '../../components/RelatedProducts';
import dbConnect from '../../utils/mongo';
import Product from '../../models/Product';
import { useRouter } from 'next/router';

const ProductDetail = ({ product, relatedProducts }) => {
  const router = useRouter();
  const { edit, size } = router.query;

  if (!product) return <div>Product not found.</div>;

  const dispatch = useDispatch();

  // ---- Local State ----
  const [mainImg, setMainImg] = useState(product.imgs?.[0] || '/img/placeholder.png'); // selected image
  const [sizeIndex, setSizeIndex] = useState(0); // selected size (0 = standard, 1 = organic, etc.)
  const [quantity, setQuantity] = useState(1); // product quantity
  const [extras, setExtras] = useState([]); // selected extra options
  const [notes, setNotes] = useState(''); // ✅ custom notes entered by user
  const [whom, setWhom] = useState(''); // ✅ custom whom entered by user
  const [price, setPrice] = useState(product.prices?.[0] || 0); // calculated total price
  const [toastShow, setToastShow] = useState(false); // toast notification

  const hasMultipleSizes = product.isOrganic && product.prices?.length > 1;
  const DetailsBullets = product.desc?.split(',').map((d) => d.trim()) || [];

  // ---- Price calculation (reactive) ----
  useEffect(() => {
    let basePrice = hasMultipleSizes ? product.prices[sizeIndex] : product.prices?.[0] || 0;
    extras.forEach((opt) => (basePrice += opt.price));
    if (product.isDiscounted && product.isDiscounted > 0) {
      basePrice *= 1 - product.isDiscounted / 100;
    }
    basePrice *= quantity;
    setPrice(basePrice);
  }, [sizeIndex, extras, quantity, product.prices, product.isDiscounted, hasMultipleSizes]);

  useEffect(() => {
    if (router.query.edit === 'true') {
      if (router.query.size) setSizeIndex(Number(router.query.size));
      if (router.query.notes) setNotes(router.query.notes);
      if (router.query.whom) setWhom(router.query.whom);
      if (router.query.quantity) setQuantity(Number(router.query.quantity));
      if (router.query.extras) {
        try {
          setExtras(JSON.parse(router.query.extras));
        } catch (e) {
          console.error('Extras parse error', e);
          setExtras([]);
        }
      }
    }
  }, [router.query]);

  // ---- Handle extras ----
  const handleExtraChange = (e, opt) => {
    setExtras((prev) =>
      e.target.checked ? [...prev, opt] : prev.filter((o) => o.text !== opt.text),
    );
  };

  // ---- Add to cart ----
  const handleAddToCart = () => {
    dispatch(
      addProduct({
        _id: product._id,
        title: product.title,
        img: mainImg,
        imgs: product.imgs || [],
        size: hasMultipleSizes ? sizeIndex : 0,
        quantity,
        price,
        extras,
        notes,
        whom,
        prices: product.prices || [],
        update: router.query.edit === 'true',
        index: router.query.index ? Number(router.query.index) : null, // 🔥 pass index
      }),
    );

    setToastShow(true);

    // Clear fields only if not editing
    if (!router.query.edit) {
      setNotes('');
      setWhom('');
    } else {
      // redirect to cart after editing
      router.push('/cart');
    }
  };

  return (
    <div className={styles.container}>
      {/* ✅ SEO tags */}
      <SEO
        title={product.metaTitle || product.title}
        description={product.metaDescription || product.desc}
        image={product.imgs?.[0] || '/img/placeholder.png'}
        type="product"
        sku={product.sku}
        price={price}
        inStock={product.isInStock}
      />

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <span className={styles.separator}>›</span>
        <Link href="/products" className={styles.breadcrumbLink}>
          Products
        </Link>
        <span className={styles.separator}>›</span>
        <span className={styles.current}>{product.title}</span>
      </nav>

      {product.isLive ? (
        <div className={styles.detailWrapper}>
          {/* Left side: Images */}
          <div className={styles.imageWrapper}>
            <div className={styles.mainImageWrapper}>
              <Image
                src={mainImg}
                alt={product.title}
                width={400}
                height={400}
                className={styles.productImage}
                objectFit="contain"
              />
            </div>
            <div className={styles.thumbnails}>
              {product.imgs?.map((img, idx) => (
                <div
                  key={idx}
                  className={`${styles.thumbnail} ${
                    mainImg === img ? styles.thumbnailSelected : ''
                  }`}
                  onClick={() => setMainImg(img)}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} layout="fill" objectFit="contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Right side: Details */}
          <div className={styles.details}>
            {/* Top labels */}
            <div className={styles.topRightLabels}>
              <div className={styles.socialIcons}>
                <Link
                  href={`https://instagram.com/noordonbakery?product=${product._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image src="/img/instagram.png" alt="Instagram" width={32} height={32} />
                </Link>
              </div>
              <div className={styles.productLabels}>
                {product.isVegeterian && (
                  <Image src="/img/isVegeterian.jpeg" alt="Vegetarian" width={60} height={60} />
                )}
                {product.isOrganic && (
                  <Image src="/img/isOrganic.webp" alt="Organic" width={60} height={60} />
                )}
                {product.isBakedToday && (
                  <Image src="/img/fresh.webp" alt="Daily" width={60} height={60} />
                )}
              </div>
            </div>

            <div className={styles.titleSkuWrapper}>
              <h1 className={styles.title}>{product.title}</h1>
              {product.sku && (
                <div className={styles.sku}>
                  <h3>SKU: {product.sku}</h3>
                </div>
              )}
            </div>

            {/* Price, Discount, Size & Quantity */}
            <div className={styles.priceBlock}>
              <h1 htmlFor="price">Price</h1>
              <div>
                {product.isDiscounted > 0 && (
                  <span className={styles.discountFlag}>{product.isDiscounted}% OFF</span>
                )}
                <div>
                  {product.isDiscounted > 0 ? (
                    <div className={styles.priceWrapper}>
                      <span className={styles.oldPrice}>
                        $
                        {hasMultipleSizes
                          ? product.prices[sizeIndex]?.toFixed(2)
                          : product.prices[0]?.toFixed(2)}
                      </span>
                      <span className={styles.price}>${price.toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className={styles.price}>${price.toFixed(2)}</span>
                  )}
                </div>

                {hasMultipleSizes && (
                  <div className={styles.sizes}>
                    <div
                      className={`${styles.size} ${sizeIndex === 0 ? styles.activeSize : ''}`}
                      onClick={() => setSizeIndex(0)}
                    >
                      Standard
                    </div>
                    <div
                      className={`${styles.size} ${sizeIndex === 1 ? styles.activeSize : ''}`}
                      onClick={() => setSizeIndex(1)}
                    >
                      Organic
                    </div>
                  </div>
                )}

                <div className={styles.amount}>
                  <button
                    className={styles.amountButton}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className={styles.amountNumber}>{quantity}</span>
                  <button className={styles.amountButton} onClick={() => setQuantity((q) => q + 1)}>
                    +
                  </button>
                </div>
              </div>
            </div>
            {/* Extra options */}
            {product?.extraOptions?.length > 0 && (
              <div className={styles.extrasWrapper}>
                <h3>Extras (optional):</h3>
                <div className={styles.extras}>
                  {product.extraOptions.map((opt) => (
                    <label key={opt.text} className={styles.option}>
                      <input
                        type="checkbox"
                        checked={extras.some((e) => e.text === opt.text)} // ✅ reflect selected
                        onChange={(e) => handleExtraChange(e, opt)}
                      />
                      {opt.text}
                      {opt.price > 0 && ` (+$${opt.price.toFixed(2)})`}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ Notes */}
            <div className={styles.notesWrapper}>
              <h3 htmlFor="notes">Notes (optional):</h3>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special instructions here..."
                className={styles.notes}
              />
            </div>

            {/* ✅ Whom */}
            <div className={styles.whomWrapper}>
              <h3 htmlFor="whom">Ordered for (optional):</h3>
              <input
                id="whom"
                value={whom}
                onChange={(e) => setWhom(e.target.value)}
                placeholder="Ordered for..."
                className={styles.whom}
              />
            </div>

            <div className={styles.descContainer}>
              <h3>Details</h3>
              {DetailsBullets.length > 0 && (
                <>
                  <ul className={styles.desc}>
                    {DetailsBullets.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                  <span className={styles.shippingFlag}>
                    {product.isShippingOk
                      ? 'Shipping & Local delivery available'
                      : 'Local delivery available'}
                  </span>
                </>
              )}
            </div>

            {product.ingredients?.length > 0 && (
              <div className={styles.ingredientsContainer}>
                <h3>Ingredients</h3>
                <ul className={styles.ingredientsList}>
                  {product.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className={styles.addToCart}
              onClick={handleAddToCart}
              disabled={product.isSoldOut}
              style={{
                cursor: product.isSoldOut ? 'not-allowed' : 'pointer',
                backgroundColor: product.isSoldOut ? '#f0c0c0' : '',
              }}
            >
              {router.query.edit === 'true'
                ? 'Edit Product'
                : product.isSoldOut
                  ? 'Sold Out'
                  : 'Add to Cart'}
            </button>

            <div className={styles.bottomButtons}>
              <Link href="/products">
                <button className={styles.secondaryButton}>All Products</button>
              </Link>
              <Link href="/cart">
                <button className={styles.secondaryButton}>Go to Cart</button>
              </Link>
            </div>

            <Toast message="Product added to cart!" show={toastShow} setShow={setToastShow} />
          </div>
        </div>
      ) : (
        <div>Product is not available.</div>
      )}

      {/* ✅ Related Products */}
      {relatedProducts?.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
};

export const getServerSideProps = async ({ params }) => {
  const { id } = params;

  try {
    // Connect to MongoDB
    await dbConnect();

    // Fetch the main product
    const productDoc = await Product.findById(id).lean();
    const product = productDoc
      ? JSON.parse(JSON.stringify(productDoc)) // serialize Dates
      : null;

    if (!product) {
      return { props: { product: null, relatedProducts: [] } };
    }

    // Fetch all products for related items
    const allProductsDocs = await Product.find({}).lean();
    const allProducts = JSON.parse(JSON.stringify(allProductsDocs));

    const relatedProducts = allProducts.filter(
      (p) => p._id !== id && p.category === product.category,
    );

    return {
      props: {
        product,
        relatedProducts,
      },
    };
  } catch (err) {
    console.error('SSR product fetch error:', err);
    return {
      props: {
        product: null,
        relatedProducts: [],
      },
    };
  }
};

export default ProductDetail;
