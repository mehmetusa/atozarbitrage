import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import styles from '../../styles/admin/ProductsTab.module.css';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import Pagination from '../../components/Pagination';

const FLAG_FILTERS = [
  'isBakedToday',
  'isDiscounted',
  'isFreeShipping',
  'isHot',
  'isInStock',
  'isLive',
  'isNew',
  'isOrganic',
  'isShippingOk',
  'isSoldOut',
  'isVegeterian',
];

const CATEGORIES = [
  { id: 'bakery', name: 'Bakery' },
  { id: 'cakes', name: 'Cakes' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'salads', name: 'Salads' },
  { id: 'savory', name: 'Savory' },
  { id: 'cookies', name: 'Cookies' },
  { id: 'drinks', name: 'Drinks' },
];

const ProductsTab = ({ initialData }) => {
  const [products, setProducts] = useState(initialData?.products || []);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [page, setPage] = useState(initialData?.page || 1);
  const [totalPages, setTotalPages] = useState(initialData?.pages || 1);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    flags: FLAG_FILTERS.reduce((acc, flag) => ({ ...acc, [flag]: false }), {}),
  });

  const fetchProducts = async (pageNumber = 1) => {
    try {
      setLoading(true);
      let query = `?page=${pageNumber}&limit=10`;
      if (filters.category) query += `&category=${filters.category}`;
      FLAG_FILTERS.forEach((flag) => {
        if (filters.flags[flag]) query += `&${flag}=true`;
      });
      const res = await axios.get(`/api/products${query}`);
      setProducts(res.data.products || []);
      setTotalPages(res.data.pages || 1);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page, filters]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  const handleUpdateProduct = async (id, data) => {
    try {
      const res = await axios.put(`/api/products/${id}`, data);
      setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update product');
    }
  };

  const toggleExpand = (id) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  const handleCategoryChange = (e) => {
    setFilters((prev) => ({ ...prev, category: e.target.value }));
    setPage(1);
  };

  const handleFlagChange = (flag) => {
    setFilters((prev) => ({
      ...prev,
      flags: { ...prev.flags, [flag]: !prev.flags[flag] },
    }));
    setPage(1);
  };

  return (
    <div className={styles.container}>
      {/* Filters Section */}
      <div className={styles.filters}>
        <select value={filters.category} onChange={handleCategoryChange} className={styles.select}>
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {FLAG_FILTERS.map((flag) => (
          <label key={flag} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={filters.flags[flag]}
              onChange={() => handleFlagChange(flag)}
            />
            {flag.replace(/([A-Z])/g, ' $1')}
          </label>
        ))}

        <button className={styles.addProductButtonBottom} onClick={() => setIsAddOpen(true)}>
          Add New Product
        </button>
      </div>

      {isAddOpen && <AddProductModal setClose={setIsAddOpen} onAdd={() => fetchProducts(page)} />}

      {loading ? (
        <p className={styles.noProducts}>Loading products...</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>SKU</th>
                <th>Title</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length ? (
                products.map((product) => (
                  <React.Fragment key={product._id}>
                    <tr>
                      <td>
                        {product.imgs?.[0] ? (
                          <div className={styles.imageWrapper}>
                            <Image
                              src={product.imgs[0]}
                              width={50}
                              height={50}
                              alt={product.title}
                              className={styles.productImage}
                            />
                          </div>
                        ) : (
                          <div className={styles.emptyImage} />
                        )}
                      </td>
                      <td>{product.sku}</td>
                      <td>{product.title}</td>
                      <td>${product.prices?.[0]}</td>
                      <td>
                        <button onClick={() => toggleExpand(product._id)} className={styles.button}>
                          {expandedProductId === product._id ? 'Hide' : 'View'}
                        </button>
                        <button
                          onClick={() => setEditingProduct(product)}
                          className={styles.button}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className={styles.button}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {expandedProductId === product._id && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={5}>
                          <div className={styles.expandedContent}>
                            <p>
                              <strong>Title:</strong> {product.title}
                            </p>
                            <p>
                              <strong>SKU:</strong> {product.sku}
                            </p>
                            <p>
                              <strong>Price:</strong> ${product.prices?.join(' / ')}
                            </p>
                            {product.desc && (
                              <p>
                                <strong>Details:</strong> {product.desc}
                              </p>
                            )}
                            {product.categories && (
                              <p>
                                <strong>Categories:</strong> {product.categories.join(', ')}
                              </p>
                            )}
                            {product.sizes && (
                              <p>
                                <strong>Sizes:</strong> {product.sizes.join(', ')}
                              </p>
                            )}
                            {product.stock !== undefined && (
                              <p>
                                <strong>Stock:</strong> {product.stock}
                              </p>
                            )}
                            <div className={styles.expandedImages}>
                              {product.imgs?.map((img, i) => (
                                <Image
                                  key={i}
                                  src={img}
                                  width={80}
                                  height={80}
                                  alt={`${product.title} image ${i + 1}`}
                                  className={styles.productImage}
                                />
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.noProducts}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}

      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
        />
      )}
    </div>
  );
};

export default ProductsTab;
