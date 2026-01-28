import { useState, useEffect } from 'react';
import { getSession, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProductsTab from '../../components/admin/ProductsTab';
import CouponsTab from '../../components/admin/CouponsTab';
import OrdersTab from '../../components/admin/OrdersTab';
import UsersTab from '../../components/admin/UsersTab';

import layoutStyles from '../../styles/admin/AdminLayout.module.css';

import axios from 'axios';

const AdminPage = ({ products: initialProducts, orders: initialOrders, users: initialUsers }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('orders');

  // --- Auth check ---
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.replace('/login');
    }
  }, [status, session, router]);

  if (status === 'loading') return <LoadingSpinner message="Baking something fresh for you..." />;
  if (!session || session.user.role !== 'admin') return null;

  return (
    <div className={layoutStyles.adminContainer}>
      <h2>Admin Panel</h2>
      {/* Sidebar */}
      <div className={layoutStyles.sidePanel}>
        {['orders', 'products', 'users', 'coupons'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={activeSection === section ? layoutStyles.activeTab : ''}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}

        <button onClick={() => signOut()} className={layoutStyles.logoutButtonSide}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className={layoutStyles.mainContent}>
        {activeSection === 'orders' && <OrdersTab initialData={initialOrders} />}
        {activeSection === 'products' && <ProductsTab initialData={initialProducts} />}
        {activeSection === 'users' && <UsersTab initialData={initialUsers} />}
        {activeSection === 'coupons' && <CouponsTab initialData={[]} />}
      </div>
    </div>
  );
};

// --- Server-side props ---
export const getServerSideProps = async (ctx) => {
  const session = await getSession({ req: ctx.req });

  if (!session || session.user.role !== 'admin') {
    return { redirect: { destination: '/login', permanent: false } };
  }

  let products = [],
    orders = [],
    users = [],
    coupons = [];

  try {
    const res = await axios.get('/api/products');
    products = res.data || [];
  } catch (err) {
    console.error(err);
  }

  try {
    const res = await axios.get('/api/orders?admin=true&limit=100');
    orders = res.data.orders || [];
  } catch (err) {
    console.error(err);
  }

  try {
    const res = await axios.get('/api/users');
    users = res.data || [];
  } catch (err) {
    console.error(err);
  }

  try {
    const res = await axios.get('/api/coupons');
    coupons = res.data || [];
  } catch (err) {
    console.error(err);
  }

  return { props: { products, orders, users, coupons } };
};

export default AdminPage;
