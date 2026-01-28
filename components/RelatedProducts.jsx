// components/RelatedProducts.jsx
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/RelatedProducts.module.css';

const RelatedProducts = ({ products }) => {
  const carouselRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const velocity = useRef(0);
  const momentumFrame = useRef(null);

  if (!products || products.length === 0) return null;

  const displayedProducts = products;

  // Manual scroll
  const manualScroll = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Drag / swipe handlers
  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX || e.touches[0].pageX;
    scrollLeftStart.current = carouselRef.current.scrollLeft;
    cancelMomentum();
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const x = e.pageX || e.touches[0].pageX;
    const dx = x - startX.current;
    carouselRef.current.scrollLeft = scrollLeftStart.current - dx;
    velocity.current = -dx;
  };

  const onMouseUp = () => {
    isDragging.current = false;
    startMomentum();
  };

  const startMomentum = () => {
    const decay = 0.95;
    const step = () => {
      if (Math.abs(velocity.current) < 0.5) return cancelMomentum();
      carouselRef.current.scrollLeft += velocity.current;

      if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
        carouselRef.current.scrollLeft = 0;
      } else if (carouselRef.current.scrollLeft <= 0) {
        carouselRef.current.scrollLeft = carouselRef.current.scrollWidth / 2;
      }

      velocity.current *= decay;
      momentumFrame.current = requestAnimationFrame(step);
    };
    momentumFrame.current = requestAnimationFrame(step);
  };

  const cancelMomentum = () => {
    if (momentumFrame.current) cancelAnimationFrame(momentumFrame.current);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.titleHeading}>Related Hot Products</h3>
      <div className={styles.carouselWrapper}>
        <button className={styles.arrow} onClick={() => manualScroll('left')}>
          ‹
        </button>
        <div
          className={styles.carousel}
          ref={carouselRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => isDragging.current && onMouseUp()}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        >
          {displayedProducts.map((product, idx) => (
            <Link key={product._id + idx} href={`/product/${product._id}`}>
              <div className={styles.card}>
                <Image
                  src={product.imgs?.[0] || '/img/placeholder.png'} // fallback
                  alt={product.title}
                  width={150}
                  height={150}
                  objectFit="cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/img/placeholder.png';
                  }} // ensure fallback even if URL fails
                />
                <span className={styles.title}>{product.title}</span>
              </div>
            </Link>
          ))}
        </div>
        <button className={styles.arrow} onClick={() => manualScroll('right')}>
          ›
        </button>
      </div>
    </div>
  );
};

export default RelatedProducts;
