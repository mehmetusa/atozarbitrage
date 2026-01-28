import Image from 'next/image';
import styles from '../styles/Catering.module.css';
import CreateOrderButton from '../components/CreateOrderButton';

const Catering = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Catering Services</h1>

      <Image
        src="/img/catering.webp"
        alt="Catering setup"
        width={900}
        height={400}
        className={styles.heroImage}
      />

      <p className={styles.text}>
        Impress your guests with authentic Turkish cuisine, freshly made and beautifully presented.
        We cater for:
      </p>
      <ul className={styles.list}>
        <li>Weddings & Receptions</li>
        <li>Birthday Parties</li>
        <li>Corporate Events</li>
        <li>Private Dinners</li>
      </ul>

      <p className={styles.text}>
        ALL menu is halal. Our customizable menus include options for vegetarians, vegans, and
        special dietary needs.
      </p>
      <CreateOrderButton />
      <div className={styles.contactCard}>
        <h3>📞 Book a Catering Service</h3>
        <p>
          Email: <a href="mailto:order@noordon.com">order@noordon.com</a>
        </p>
        <p>
          Phone: <a href="tel:(571) 279-0444">(571) 279-0444</a>
        </p>
      </div>
    </div>
  );
};

// ✅ Attach SEO data so Layout in _app.js can use it
Catering.seo = () => ({
  title: 'Catering Services',
  description:
    'Catering services for all occasions. Weddings, parties, corporate events. Delicious Turkish and Mediterranean cuisine.',
});

export default Catering;
