import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import styles from '../styles/Catering.module.css';

export default function Shipping() {
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>Shipping Information</h1>
        <p className={styles.lead}>
          Enjoy authentic Turkish and Mediterranean catering, freshly prepared for your special
          events. We provide high-quality food for:
        </p>

        <p className={styles.info}>
          🍴 All menu items are <strong>100% halal</strong> and Kosher, Vegetarian, Organic options
          are available.
        </p>

        {/* Delivery Information */}
        <div className={styles.deliveryCard}>
          <h2>🚚 Delivery Information</h2>
          <p>
            Local delivery fee: <strong>$25</strong>
          </p>
          <p>
            Orders over <strong>$250</strong> get <span className={styles.free}>FREE delivery</span>
            !
          </p>
        </div>

        {/* Contact Box */}
        <div className={styles.contactBox}>
          <h2>📞 Book Catering Today</h2>
          <p>
            Email: <a href="mailto:order@noordon.com">info@noordon.com</a>
          </p>
          <p>
            Phone: <a href="tel:+1(571) 279-0444">(571) 279-0444</a>
          </p>
        </div>
      </div>
    </>
  );
}
