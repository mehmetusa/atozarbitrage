import styles from '../styles/WholesaleInjuries.module.css';

export default function WholesaleInjuries() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Wholesale Bakery Orders</h1>
      <p className={styles.details}>
        Welcome to Noordon Bakery’s wholesale program! We supply our freshly baked Turkish pastries
        and halal-certified products directly to cafes, grocery stores, and restaurants.
      </p>

      <div className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>Why Choose Our Wholesale Program?</h2>
        <ul className={styles.list}>
          <li>Freshly baked daily with high-quality ingredients</li>
          <li>Halal and Kosher certified, with Organic & Vegetarian options</li>
          <li>Flexible order sizes to suit small or large shops</li>
          <li>Reliable delivery service within your region</li>
        </ul>
      </div>

      <div className={styles.contactSection}>
        <h2 className={styles.sectionTitle}>Get Started</h2>
        <p>
          If you are a shop owner and want to buy our bakery items in wholesale, please contact us:
        </p>
        <p>
          Email:{' '}
          <a className={styles.link} href="mailto:wholesale@noordon.com">
            wholesale@noordon.com
          </a>
        </p>
        <p>
          Phone:{' '}
          <a className={styles.link} href="tel:+1(571) 279-0444">
            (571) 279-0444
          </a>
        </p>
      </div>

      <div className={styles.notesSection}>
        <h2 className={styles.sectionTitle}>Important Notes</h2>
        <ul className={styles.list}>
          <li>Minimum order quantity applies for wholesale deliveries.</li>
          <li>Orders must be placed at least 48 hours in advance.</li>
          <li>We accommodate dietary certifications: Halal, Kosher, Organic, Vegetarian.</li>
        </ul>
      </div>
    </div>
  );
}

// ✅ SEO metadata for Layout (handled globally in _app.js)
WholesaleInjuries.seo = () => ({
  title: 'Wholesale Bakery Orders',
  description:
    'Partner with Noordon Bakery for wholesale Turkish pastries and halal-certified products. Freshly baked daily for cafes, grocery stores, and restaurants.',
});
