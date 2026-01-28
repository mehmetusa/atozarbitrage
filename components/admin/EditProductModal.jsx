import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../../styles/admin/EditProductModal.module.css';

const categories = [
  { id: 'bakery', name: 'Bakery' },
  { id: 'cakes', name: 'Cakes' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'salads', name: 'Salads' },
  { id: 'savory', name: 'Savory' },
  { id: 'cookies', name: 'Cookies' },
  { id: 'drinks', name: 'Drinks' },
];

const EditProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [prices, setPrices] = useState([0, 0]);
  const [ingredients, setIngredients] = useState([]);
  const [extraOptions, setExtraOptions] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isHot, setIsHot] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isOrganic, setIsOrganic] = useState(false);
  const [isVegeterian, setIsVegeterian] = useState(false);
  const [isDiscounted, setIsDiscounted] = useState(0);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [isInStock, setIsInStock] = useState(false);
  const [isBakedToday, setIsBakedToday] = useState(false);

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    setTitle(product.title || '');
    setSku(product.sku || '');
    setDesc(product.desc || '');
    setCategoryId(product.category || '');
    setPrices(product.prices || [0, 0]);
    setIngredients(product.ingredients || []);
    setExtraOptions(product.extraOptions || []);
    setImages(product.imgs || []);
    setPreviews(product.imgs || []);
    setIsHot(product.isHot ?? false);
    setIsNew(product.isNew ?? false);
    setIsLive(product.isLive ?? true);
    setIsOrganic(product.isOrganic ?? false);
    setIsVegeterian(product.isVegeterian ?? false);
    setIsDiscounted(product.isDiscounted ?? 0);
    setIsSoldOut(product.isSoldOut ?? false);
    setIsFreeShipping(product.isFreeShipping ?? false);
    setIsInStock(product.isInStock ?? true);
    setIsBakedToday(product.isBakedToday ?? false);
  }, [product]);

  const handleIngredientChange = (idx, value) => {
    const newIngredients = [...ingredients];
    newIngredients[idx] = value;
    setIngredients(newIngredients);
  };
  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleRemoveIngredient = (idx) => setIngredients(ingredients.filter((_, i) => i !== idx));

  const handleExtraChange = (idx, field, value) => {
    const newExtras = [...extraOptions];
    newExtras[idx][field] = field === 'price' ? Number(value) : value;
    setExtraOptions(newExtras);
  };
  const handleAddExtra = () => setExtraOptions([...extraOptions, { text: '', price: 0 }]);
  const handleRemoveExtra = (idx) => setExtraOptions(extraOptions.filter((_, i) => i !== idx));

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages((prev) => [...prev, ...selectedFiles]);
    const previewUrls = selectedFiles.map((file) =>
      typeof file === 'string' ? file : URL.createObjectURL(file),
    );
    setPreviews((prev) => [...prev, ...previewUrls]);
  };

  const handlePriceChange = (e, idx) => {
    const updated = [...prices];
    updated[idx] = Number(e.target.value);
    setPrices(updated);
  };

  const handleSave = async () => {
    if (!title || !desc || !categoryId) {
      alert('Please fill all required fields.');
      return;
    }
    try {
      setLoading(true);

      // Upload new files to Cloudinary
      const uploadedUrls = [];
      for (const file of images) {
        if (typeof file === 'string') {
          uploadedUrls.push(file); // already uploaded URL
        } else {
          const formDataFile = new FormData();
          formDataFile.append('file', file);
          formDataFile.append('upload_preset', 'noordon');
          const res = await axios.post(
            'https://api.cloudinary.com/v1_1/dcjz84xa8/image/upload',
            formDataFile,
          );
          uploadedUrls.push(res.data.url);
        }
      }

      const updatedProduct = {
        title,
        sku,
        desc,
        category: categoryId,
        prices,
        ingredients,
        extraOptions,
        imgs: uploadedUrls,
        isHot,
        isNew,
        isLive,
        isOrganic,
        isVegeterian,
        isDiscounted,
        isSoldOut,
        isFreeShipping,
        isInStock,
        isBakedToday,
      };

      await onSave(product._id, updatedProduct);
      onClose();
      alert('Product updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h2>Edit Product</h2>

        {/* Images */}
        <div className={styles.item}>
          <label>Images</label>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button className={styles.addButton} onClick={() => fileInputRef.current?.click()}>
              Select Files
            </button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              style={{
                opacity: 0,
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
              }}
              onChange={handleFilesChange}
            />
          </div>
          <div className={styles.previewContainer}>
            {previews.map((url, i) => (
              <img key={i} src={url} alt={`Preview ${i}`} className={styles.previewImg} />
            ))}
          </div>
        </div>

        <div className={styles.item}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className={styles.item}>
          <label>SKU</label>
          <input value={sku} onChange={(e) => setSku(e.target.value)} />
        </div>

        <div className={styles.item}>
          <label>Details</label>
          <textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <div className={styles.item}>
          <label>Prices (Standard, Organic)</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {prices.map((p, i) => (
              <input key={i} type="number" value={p} onChange={(e) => handlePriceChange(e, i)} />
            ))}
          </div>
        </div>

        <div className={styles.item}>
          <label>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">-- Select a category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ingredients */}
        <div className={styles.item}>
          <label>Ingredients</label>
          {ingredients.map((ing, i) => (
            <div key={i} className={styles.dynamicField}>
              <input value={ing} onChange={(e) => handleIngredientChange(i, e.target.value)} />
              <button type="button" onClick={() => handleRemoveIngredient(i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddIngredient}>
            Add Ingredient
          </button>
        </div>

        {/* Extra Options */}
        <div className={styles.item}>
          <label>Extra Options</label>
          {extraOptions.map((opt, i) => (
            <div key={i} className={styles.dynamicField}>
              <input
                placeholder="Text"
                value={opt.text}
                onChange={(e) => handleExtraChange(i, 'text', e.target.value)}
              />
              <input
                placeholder="Price"
                type="number"
                value={opt.price}
                onChange={(e) => handleExtraChange(i, 'price', e.target.value)}
              />
              <button type="button" onClick={() => handleRemoveExtra(i)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddExtra}>
            Add Extra Option
          </button>
        </div>

        {/* Flags */}
        <div className={styles.item}>
          <label>
            <input type="checkbox" checked={isHot} onChange={() => setIsHot(!isHot)} /> Hot Item
          </label>
          <label>
            <input type="checkbox" checked={isNew} onChange={() => setIsNew(!isNew)} /> New Item
          </label>
          <label>
            <input type="checkbox" checked={isLive} onChange={() => setIsLive(!isLive)} /> Live
          </label>
          <label>
            <input type="checkbox" checked={isOrganic} onChange={() => setIsOrganic(!isOrganic)} />{' '}
            Organic
          </label>
          <label>
            <input
              type="checkbox"
              checked={isVegeterian}
              onChange={() => setIsVegeterian(!isVegeterian)}
            />{' '}
            Vegeterian
          </label>
          <label>
            Discount %{' '}
            <input
              type="number"
              value={isDiscounted}
              onChange={(e) => setIsDiscounted(Number(e.target.value))}
            />
          </label>
          <label>
            <input type="checkbox" checked={isSoldOut} onChange={() => setIsSoldOut(!isSoldOut)} />{' '}
            Sold Out
          </label>
          <label>
            <input
              type="checkbox"
              checked={isFreeShipping}
              onChange={() => setIsFreeShipping(!isFreeShipping)}
            />{' '}
            Free Shipping
          </label>
          <label>
            <input type="checkbox" checked={isInStock} onChange={() => setIsInStock(!isInStock)} />{' '}
            In Stock
          </label>
          <label>
            <input
              type="checkbox"
              checked={isBakedToday}
              onChange={() => setIsBakedToday(!isBakedToday)}
            />{' '}
            Baked Today
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
