import Image from 'next/image';
import styles from '../styles/About.module.css';

const About = () => {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>About Us</h1>

      <p className={styles.text}>
        Welcome to <strong>Noordon Bakery</strong>, where we serve the finest Turkish cuisine in
        Northern VA. We believe that great food is not only about taste but also about trust and
        respect for dietary choices. Our dishes are carefully prepared to meet the needs of all our
        guests.
      </p>

      <div className={styles.certifications}>
        <div className={styles.cert}>
          <Image src="/img/halal.jpg" alt="Halal" width={60} height={60} />
          <p>
            <strong>Halal:</strong> All meats are prepared according to Islamic dietary laws,
            ensuring ethical treatment of animals and clean processing standards.
          </p>
        </div>
        <div className={styles.cert}>
          <Image src="/img/kosher.svg" alt="Kosher" width={60} height={60} />
          <p>
            <strong>Kosher:</strong> Our Kosher-certified items follow Jewish dietary guidelines,
            offering pure and permissible ingredients for those observing Kosher practices.
          </p>
        </div>
        <div className={styles.cert}>
          <Image src="/img/organic.jpeg" alt="Organic" width={60} height={60} />
          <p>
            <strong>Organic:</strong> We use organic fruits, vegetables, and grains whenever
            possible, avoiding synthetic pesticides and chemicals for healthier meals.
          </p>
        </div>
        <div className={styles.cert}>
          <Image src="/img/vegetarian.jpg" alt="Vegetarian" width={60} height={60} />
          <p>
            <strong>Vegetarian:</strong> A wide variety of vegetarian dishes are available, prepared
            with fresh vegetables, legumes, and grains, full of flavor and nutrition.
          </p>
        </div>
      </div>

      <p className={styles.text}>
        At Noordon, we respect all dietary requirements and strive to make every dining experience
        safe, enjoyable, and satisfying. Whether you follow Halal, Kosher, Organic, or Vegetarian
        diets—or simply enjoy authentic Turkish cuisine—you will find something delicious on our
        menu.
      </p>
    </main>
  );
};

// ✅ SEO data for Layout (handled globally in _app.js)
About.seo = () => ({
  title: 'About Us',
  description:
    'Noordon Bakery offers authentic Turkish cuisine with Halal, Kosher, Organic, and Vegetarian options. Learn about our commitment to quality and dietary preferences.',
});

export default About;
