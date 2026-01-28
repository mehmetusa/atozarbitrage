import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/admin/Orders.module.css';
import Pagination from '../../components/Pagination';

const STATUS_LABELS = ['New', 'Preparing', 'On the way', 'Delivered'];

const OrdersTab = () => {
  const [orderList, setOrderList] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (pageNum = 1) => {
    try {
      const statusQuery = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const allQuery = showAll ? '&all=true' : '';
      const res = await axios.get(
        `/api/orders?admin=true&page=${pageNum}&limit=10${statusQuery}${allQuery}`,
      );
      setOrderList(res.data.orders || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page, statusFilter, showAll]);

  const handleNextStatus = async (orderId) => {
    const order = orderList.find((o) => o._id === orderId);
    if (!order) return;
    try {
      const res = await axios.put(`/api/orders/${orderId}`, { status: order.status + 1 });
      setOrderList((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handlePageChange = (newPage) => setPage(newPage);

  const getPaymentMethod = (method) => (method === 0 ? 'Cash on Delivery' : 'Card/Stripe');

  return (
    <>
      {/* ===== Header ===== */}
      <div className={styles.header}>
        <h2>Orders</h2>
        <div className={styles.filters}>
          <button className={styles.button} onClick={() => setShowAll((prev) => !prev)}>
            {showAll ? 'Show Open Orders' : 'Show All Orders (Latest First)'}
          </button>

          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUS_LABELS.map((label, index) => (
              <option key={index} value={index}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== Orders Table ===== */}
      {orderList.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Notes</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr>
                      <td>{order.displayId}</td>
                      <td>{order.notes || '-'}</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        {getPaymentMethod(order.method)} ({order.paymentStatus})
                      </td>
                      <td>{STATUS_LABELS[order.status]}</td>
                      <td>
                        {new Date(order.deliveryDate).toLocaleDateString()} <br />
                        {order.deliverySlot} <br />
                        {order.deliveryStatus}
                      </td>
                      <td>
                        <button
                          className={styles.button}
                          onClick={() => handleNextStatus(order._id)}
                          disabled={order.status >= STATUS_LABELS.length - 1}
                        >
                          Next Status
                        </button>
                        <button
                          className={styles.button}
                          onClick={() => toggleOrderDetails(order._id)}
                        >
                          {expandedOrders[order._id] ? 'Hide Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>

                    {/* ===== Expanded Details ===== */}
                    {expandedOrders[order._id] && (
                      <tr className={styles.detailsRow}>
                        <td colSpan={7}>
                          <div className={styles.details}>
                            {/* Flex Row: Customer Info + Summary */}
                            <div className={styles.detailsRowFlex}>
                              {/* ===== Customer Info ===== */}
                              <div className={styles.customerInfo}>
                                <h4>Customer Info</h4>
                                <p>
                                  <b>Name:</b> {order.customer?.name}
                                </p>
                                <p>
                                  <b>Email:</b> {order.customer?.email}
                                </p>
                                <p>
                                  <b>Phone:</b> {order.customer?.phone}
                                </p>
                                <p>
                                  <b>Address:</b> {order.customer?.address?.street},{' '}
                                  {order.customer?.address?.city}, {order.customer?.address?.state}{' '}
                                  {order.customer?.address?.zip}, {order.customer?.address?.country}
                                </p>
                              </div>

                              {/* ===== Summary ===== */}
                              <div className={styles.summary}>
                                <h4>Summary</h4>
                                <p>
                                  <b>Order Placed:</b>{' '}
                                  {order.createdAt
                                    ? new Date(order.createdAt).toLocaleString()
                                    : 'N/A'}
                                </p>
                                <p>
                                  <b>Subtotal:</b> ${order.subtotal.toFixed(2)}
                                </p>
                                <p>
                                  <b>Discount:</b> ${order.discount.toFixed(2)}
                                </p>
                                <p>
                                  <b>Tax:</b> ${order.tax.toFixed(2)}
                                </p>
                                <p>
                                  <b>Shipping:</b> ${order.shippingFee.toFixed(2)}
                                </p>
                                <p>
                                  <b>Total:</b> ${order.total.toFixed(2)}
                                </p>
                                {order.usedCouponCode && (
                                  <p>
                                    <b>Coupon Applied:</b> {order.usedCouponCode}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* ===== Items ===== */}
                            <h4>Items</h4>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th>Image</th>
                                  <th>Title</th>
                                  <th>Size</th>
                                  <th>Quantity</th>
                                  <th>Price</th>
                                  <th>Notes</th>
                                  <th>Whom</th>
                                  <th>Extras</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items?.map((item, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <img
                                        src={item.image}
                                        alt={item.title}
                                        width={50}
                                        height={50}
                                        style={{ borderRadius: 4 }}
                                      />
                                    </td>
                                    <td>{item.title}</td>
                                    <td>{item.size || '-'}</td>
                                    <td>{item.quantity}</td>
                                    <td>${item.price}</td>
                                    <td>{item.notes || '-'}</td>
                                    <td>{item.whom || '-'}</td>
                                    <td>
                                      {item.extras?.length > 0 ? (
                                        <ul
                                          style={{ paddingLeft: 16, margin: 0, textAlign: 'left' }}
                                        >
                                          {item.extras.map((ex, i) => (
                                            <li key={i}>
                                              {ex.text} {ex.price ? `(+$${ex.price})` : ''}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}
    </>
  );
};

export default OrdersTab;
