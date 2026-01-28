import { useState, useRef } from 'react';
import styles from '../../styles/admin/AddProductModal.module.css';
import axios from 'axios';

const categories = [
  { id: 'bakery', name: 'Bakery' },
  { id: 'cakes', name: 'Cakes' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'salads', name: 'Salads' },
  { id: 'savory', name: 'Savory' },
  { id: 'cookies', name: 'Cookies' },
  { id: 'drinks', name: 'Drinks' },
];

const AddProductModal = ({ setClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [prices, setPrices] = useState([0, 0]);
  const [ingredients, setIngredients] = useState([]);
  const [extraOptions, setExtraOptions] = useState([]);
  const [extra, setExtra] = useState({ text: '', price: '' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isHot, setIsHot] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [isOrganic, setIsOrganic] = useState(false);
  const [isVegeterian, setIsVegeterian] = useState(true);
  const [isDiscounted, setIsDiscounted] = useState('10');
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [isFreeShipping, setIsFreeShipping] = useState(true);
  const [isInStock, setIsInStock] = useState(true);
  const [isBakedToday, setIsBakedToday] = useState(true);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setImages((prev) => [...prev, ...selectedFiles]);
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...previewUrls]);
  };

  const handleIngredientChange = (idx, value) => {
    const newIngredients = [...ingredients];
    newIngredients[idx] = value;
    setIngredients(newIngredients);
  };
  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleRemoveIngredient = (idx) => setIngredients(ingredients.filter((_, i) => i !== idx));

  const handleAddExtra = () => {
    if (!extra.text || !extra.price) return;
    setExtraOptions([...extraOptions, { text: extra.text, price: Number(extra.price) }]);
    setExtra({ text: '', price: '' });
  };

  const changePrice = (e, idx) => {
    const updated = [...prices];
    updated[idx] = Number(e.target.value);
    setPrices(updated);
  };

  const handleCreate = async () => {
    // ✅ Require title and desc
    if (!title.trim() || !desc.trim() || !categoryId || prices.length === 0) {
      alert('Please fill all required fields: Title, Details, Category, and Prices.');
      return;
    }

    try {
      setLoading(true);

      // Upload images
      const uploadedUrls = [];
      for (const file of images) {
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        formDataFile.append('upload_preset', 'noordon');

        const res = await axios.post(
          'https://api.cloudinary.com/v1_1/dcjz84xa8/image/upload',
          formDataFile,
        );
        uploadedUrls.push(res.data.url);
      }

      const newProduct = {
        title,
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
        isDiscounted,
        isVegeterian,
        isSoldOut,
        isFreeShipping,
        isInStock,
        isBakedToday,
      };

      await axios.post('/api/products', newProduct);
      setClose(true);
      if (onAdd) onAdd();
      alert('Product created successfully!');
    } catch (err) {
      console.error(err);
      alert('Creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <span className={styles.close} onClick={() => setClose(false)}>
          X
        </span>
        <h1>Add New Product</h1>

        {/* Images */}
        <div className={styles.item}>
          <label className={styles.label}>Images</label>
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

        {/* Title */}
        <div className={styles.item}>
          <label className={styles.label}>Title *</label>
          <input
            className={styles.inputField}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Details / Description */}
        <div className={styles.item}>
          <label className={styles.label}>Details *</label>
          <textarea
            className={styles.inputField}
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
          />
        </div>

        {/* Prices */}
        <div className={styles.item}>
          <label className={styles.label}>Prices</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Standard', 'Organic'].map((size, idx) => (
              <input
                key={idx}
                className={`${styles.inputField} ${styles.inputSm}`}
                type="number"
                placeholder={size}
                value={prices[idx] || ''}
                onChange={(e) => changePrice(e, idx)}
              />
            ))}
          </div>
        </div>

        {/* Category */}
        <div className={styles.item}>
          <label className={styles.label}>Category *</label>
          <select
            className={styles.selectField}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
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
          <label className={styles.label}>Ingredients</label>
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
          <label className={styles.label}>Extra Options</label>
          <div className={styles.extra}>
            <input
              className={`${styles.inputField} ${styles.inputSm}`}
              type="text"
              placeholder="Item"
              name="text"
              value={extra.text}
              onChange={(e) => setExtra({ ...extra, text: e.target.value })}
            />
            <input
              className={`${styles.inputField} ${styles.inputSm}`}
              type="number"
              placeholder="Price"
              name="price"
              value={extra.price}
              onChange={(e) => setExtra({ ...extra, price: e.target.value })}
            />
            <button type="button" className={styles.extraButton} onClick={handleAddExtra}>
              Add
            </button>
          </div>
          <div className={styles.extraItems}>
            {extraOptions.map((opt, i) => (
              <span key={i} className={styles.extraItem}>
                {opt.text} (+${opt.price})
              </span>
            ))}
          </div>
        </div>

        {/* Flags */}
        <div className={styles.item}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={isHot} onChange={() => setIsHot(!isHot)} /> Hot Item
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={isLive} onChange={() => setIsLive(!isLive)} /> Live
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={isOrganic} onChange={() => setIsOrganic(!isOrganic)} />{' '}
            Organic
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={isNew} onChange={() => setIsOrganic(!isNew)} /> New ?
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isVegeterian}
              onChange={() => setIsVegeterian(!isVegeterian)}
            />{' '}
            Vegeterian
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={isSoldOut} onChange={() => setIsSoldOut(!isSoldOut)} />{' '}
            Sold Out
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isFreeShipping}
              onChange={() => setIsFreeShipping(!isFreeShipping)}
            />{' '}
            Free Shipping
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={isInStock} onChange={() => setIsInStock(!isInStock)} />{' '}
            In Stock
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isBakedToday}
              onChange={() => setIsBakedToday(!isBakedToday)}
            />{' '}
            Baked Today
          </label>
        </div>

        {/* Discount */}
        <div className={styles.item}>
          <label className={styles.label}>Discount (%)</label>
          <input
            className={`${styles.inputField} ${styles.discountInput}`}
            type="number"
            min="0"
            max="100"
            value={isDiscounted}
            onChange={(e) => setIsDiscounted(Number(e.target.value))}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className={styles.addButton} onClick={() => setClose(false)}>
            Cancel
          </button>
          <button className={styles.addButton} onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
