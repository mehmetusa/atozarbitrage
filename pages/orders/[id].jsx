// pages/orders/[id].jsx
import styles from '../../styles/Order.module.css';
import Image from 'next/image';
import axios from 'axios';

const Order = ({ order }) => {
  if (!order) return <div className={styles.container}>Order not found</div>;

  const customer = order.customer || {};
  const address = customer.address || {};
  const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '';

  // ✅ Coupon discount
  const couponDiscount = order.discount ?? 0;

  // ✅ Recalculate total dynamically
  const subtotal = order.subtotal ?? 0;
  const tax = order.tax ?? 0;
  const shipping = order.shippingFee ?? 0;
  const total = subtotal - couponDiscount + tax + shipping;

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        {/* Order Info */}
        <div className={styles.row}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.trTitle}>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className={styles.tr}>
                  <td data-label="Order ID">
                    <span className={styles.id}>{order.displayId}</span>
                  </td>
                  <td data-label="Customer">
                    <span className={styles.name}>{customer.name}</span>
                    <span className={styles.email}>{customer.email}</span>
                    <span className={styles.phone}>{customer.phone}</span>
                  </td>
                  <td data-label="Address">
                    <span className={styles.address}>
                      {address.street}, {address.city}, {address.state} {address.zip},{' '}
                      {address.country}
                    </span>
                  </td>
                  <td data-label="Total">
                    <span className={styles.total}>${total.toFixed(2)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items */}
        <div className={styles.itemRows}>
          <h3>Order Items</h3>
          {order.items.map((item) => (
            <div key={item.productId} className={styles.item}>
              <Image src={item.image} alt={item.title} width={80} height={80} />
              <div className={styles.itemDetails}>
                <span className={styles.itemTitle}>{item.title}</span>
                <span>Size: {item.size}</span>
                {item.extras?.length > 0 && (
                  <span>Extras: {item.extras.map((ex) => ex.text).join(', ')}</span>
                )}
                {item.notes && <span>Notes: {item.notes}</span>}
                {item.whom && <span>Ordered for: {item.whom}</span>}
                <span>Quantity: {item.quantity}</span>
                <span>Total: ${item.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Info */}
        <div className={styles.delivery}>
          <h3>Delivery</h3>
          <span>
            {deliveryDate} ({order.deliverySlot})
          </span>
          <br />
          <span>Status: {order.deliveryStatus}</span>
        </div>
      </div>

      {/* Cart Summary */}
      <div className={styles.right}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}>CART TOTAL</h2>
          <div className={styles.totalText}>
            <b className={styles.totalTextTitle}>Subtotal:</b> ${subtotal.toFixed(2)}
          </div>
          {couponDiscount > 0 && (
            <div className={styles.totalText}>
              <b className={styles.totalTextTitle}>Coupon:</b> -${couponDiscount.toFixed(2)}
            </div>
          )}
          <div className={styles.totalText}>
            <b className={styles.totalTextTitle}>Tax:</b> ${tax.toFixed(2)}
          </div>
          <div className={styles.totalText}>
            <b className={styles.totalTextTitle}>Shipping:</b> ${shipping.toFixed(2)}
          </div>
          <div className={`${styles.totalText} ${styles.totalLast}`}>
            <b className={styles.totalTextTitle}>Total:</b> ${total.toFixed(2)}
          </div>

          <button disabled className={styles.button}>
            {order.method === 0 ? 'Cash on Delivery (COD)' : 'PAID'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Server-side fetch
export const getServerSideProps = async ({ params }) => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await axios.get(`${API}/api/orders/${params.id}`);
    return { props: { order: res.data } };
  } catch (err) {
    console.error('Failed to fetch order:', err.response?.data || err.message);
    return { notFound: true };
  }
};

export default Order;
