import React from 'react';
import Image from 'next/image';
import styles from '../../styles/admin/Products.module.css';

const ViewProductModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <h2>{product.title}</h2>

        {/* Images */}
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          {product.imgs?.map((img, i) => (
            <Image
              key={i}
              src={img}
              width={100}
              height={100}
              alt={`${product.title} image ${i + 1}`}
              style={{ borderRadius: 6 }}
            />
          ))}
        </div>

        {/* Product Info */}
        <div style={{ marginTop: 20 }}>
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

          {/* Show any additional dynamic fields */}
          {Object.keys(product).map((key) => {
            if (
              [
                'title',
                'sku',
                'prices',
                'imgs',
                'desc',
                'categories',
                'sizes',
                'stock',
                '_id',
                '__v',
              ].includes(key)
            )
              return null;
            return (
              <p key={key}>
                <strong>{key}:</strong> {JSON.stringify(product[key])}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;
