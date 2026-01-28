// components/CreateOrderButton.jsx
import { useRouter } from 'next/router';
import styles from '../styles/CreateOrderButton.module.css';

export default function CreateOrderButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/products'); // redirect to products page
  };

  return (
    <div className={styles.wrapper}>
      <button onClick={handleClick} className={styles.addToCart}>
        Order Now!
      </button>
    </div>
  );
}
