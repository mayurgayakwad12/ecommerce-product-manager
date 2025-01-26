import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragAndDropIcon from '../assets/DragAndDrop.svg';
import CrossIcon from '../assets/Cross.svg';
import ProductModal from './ProductPickerModal';
import { useAppProvider } from '../AppContext';
import CreatePencilIcon from '../assets/Createpencil.svg';
import DownIcon from '../assets/DownIcon.svg';

const ItemType = {
  PRODUCT: 'product',
  VARIANT: 'variant',
};

const DragAndDropProducts = () => {
  const [modalState, setModalState] = useState({ id: null, open: false });
  const { selectedProducts } = useAppProvider();
  const [data, setData] = useState(() => [...selectedProducts]);

  const moveItem = (draggedId, hoverId, type, parentId) => {
    const updatedData = [...data];

    if (type === ItemType.PRODUCT) {
      const draggedIndex = updatedData.findIndex((item) => item.id === draggedId);
      const hoverIndex = updatedData.findIndex((item) => item.id === hoverId);
      const [draggedItem] = updatedData.splice(draggedIndex, 1);
      updatedData.splice(hoverIndex, 0, draggedItem);
    } else if (type === ItemType.VARIANT) {
      const parentIndex = updatedData.findIndex((item) => item.id === parentId);
      const variants = updatedData[parentIndex].variants;
      const draggedIndex = variants.findIndex((variant) => variant.id === draggedId);
      const hoverIndex = variants.findIndex((variant) => variant.id === hoverId);
      const [draggedVariant] = variants.splice(draggedIndex, 1);
      variants.splice(hoverIndex, 0, draggedVariant);
    }

    setData(updatedData);
  };

  useEffect(() => {
    setData((prev) => {
      if (!selectedProducts.length) return prev;

      const parentId = selectedProducts[0]?.parentId;

      const indexToReplace = prev.findIndex((val) => val.id === parentId);

      if (indexToReplace === -1) {
        return prev;
      }

      const updatedList = [
        ...prev.slice(0, indexToReplace),
        ...selectedProducts,
        ...prev.slice(indexToReplace + 1),
      ];

      return [...new Map(updatedList.map((item) => [item.id, item])).values()];
    });
  }, [selectedProducts]);

  const toggleVariants = (id) => {
    setData((prevData) =>
      prevData.map((product) =>
        product.id === id ? { ...product, showVariants: !product.showVariants } : product
      )
    );
  };

  const handleAddEmptyProduct = () => {
    setData((prev) => [
      ...prev,
      {
        id: Math.floor(Math.random() * 100000),
        title: '',
        source: 'new',
      },
    ]);
  };

  const handleProductAndVariantDelete = (productId, type, variantId) => {
    setData((prev) => {
      if (type === ItemType.PRODUCT) {
        return prev.filter((product) => product.id !== productId);
      }

      if (type === ItemType.VARIANT) {
        return prev.map((product) => {
          if (product.id === productId) {
            return {
              ...product,
              variants: product.variants.filter((variant) => variant.id !== variantId),
            };
          }
          return product;
        });
      }

      return prev;
    });
  };

  useEffect(() => {
    if (!data.length) {
      handleAddEmptyProduct();
    }
  }, [data.length]);

  const handleDiscountChange = (event, productId, type, variantId) => {
    const { name, value } = event.target;
    setData((prev) => {
      if (type === ItemType.PRODUCT) {
        return prev.map((product) =>
          product.id === productId ? { ...product, [name]: value } : product
        );
      }

      if (type === ItemType.VARIANT) {
        return prev.map((product) => {
          if (product.id === productId) {
            return {
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === variantId ? { ...variant, [name]: value } : variant
              ),
            };
          }
          return product;
        });
      }

      return prev;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          padding: '50px',
          margin: 'auto',
          width: '500px',
          fontFamily: 'Arial, sans-serif',
          height: 'calc(100vh + -179px)',
          overflow: 'scroll',
          scrollbarWidth: 'none',
        }}
      >
        <h3>Product List</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 500 }}>
          <div>Product Name</div>
          <div>Discount</div>
        </div>
        {data.map((product, index) => (
          <Product
            key={product.id}
            sno={index + 1}
            product={product}
            moveItem={moveItem}
            toggleVariants={toggleVariants}
            setModalState={setModalState}
            handleProductAndVariantDelete={handleProductAndVariantDelete}
            handleDiscountChange={handleDiscountChange}
          />
        ))}
        <button
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            border: '2px solid #008060',
            backgroundColor: 'transparent',
            color: '#008060',
            borderRadius: '4px',
            width: '193px',
            outline: 0,
          }}
          onClick={handleAddEmptyProduct}
        >
          Add Product
        </button>
      </div>
      <ProductModal setModalState={setModalState} modalState={modalState} />
    </DndProvider>
  );
};

const Product = ({
  product,
  moveItem,
  sno,
  toggleVariants,
  setModalState,
  handleProductAndVariantDelete,
  handleDiscountChange,
}) => {
  const [, ref] = useDrop({
    accept: [ItemType.PRODUCT],
    hover: (item) => {
      if (item.id !== product.id) {
        moveItem(item.id, product.id, ItemType.PRODUCT);
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType.PRODUCT,
    item: { id: product.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const variantsLength = product.variants?.length;

  return (
    <div
      ref={(node) => drag(ref(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '10px',
        // border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ cursor: 'grab' }}>
          <img src={DragAndDropIcon} />
        </span>
        <span>{sno}.</span>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '215px',
            boxShadow: '0px 2px 4px 0px #0000001A',
          }}
        >
          <input
            style={{
              flex: 1,
              width: '215px',
              border: '1px solid #00000012',
              backgroundColor: '#FFFFFF',
              padding: '12px 50px 12px 12px',
              outline: 0,
              boxSizing: 'border-box',
            }}
            type="text"
            value={product.title}
            readOnly
          />
          <div
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              color: '#00000033',
              cursor: 'pointer',
            }}
          >
            <div
              onClick={() => setModalState({ id: product.id, open: true })}
              style={{ cursor: 'pointer', paddingTop: '8px' }}
            >
              <img src={CreatePencilIcon} />
            </div>
          </div>
        </div>

        {product.source === 'new' ? (
          <button
            style={{
              padding: '10px 20px',
              border: '2px solid #008060',
              backgroundColor: '#008060',
              color: '#FFFFFF',
              borderRadius: '4px',
              width: '180px',
              outline: 0,
              fontWeight: 600,
            }}
          >
            Add Discount
          </button>
        ) : (
          <>
            <input
              style={{
                width: '69px',
                border: '1px solid #00000012',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 2px 4px 0px #0000001A',
                outline: 0,
                padding: '12px',
              }}
              type="number"
              name="discountValue"
              value={product.discountValue}
              onChange={(e) => handleDiscountChange(e, product.id, ItemType.PRODUCT)}
            />
            <select
              style={{
                width: '95px',
                border: '1px solid #00000012',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 2px 4px 0px #0000001A',
                outline: 0,
                padding: '11px',
              }}
              onChange={(e) => handleDiscountChange(e, product.id, ItemType.PRODUCT)}
              name="discountType"
              value={product.discountType}
            >
              <option value="percentage">% Off</option>
              <option value="flatOff">flat Off</option>
            </select>
          </>
        )}

        {product.source !== 'new' && (
          <img
            src={CrossIcon}
            alt="cross"
            style={{ cursor: 'pointer' }}
            onClick={() => handleProductAndVariantDelete(product.id, ItemType.PRODUCT)}
          />
        )}
      </div>
      {product.source !== 'new' && variantsLength > 1 && (
        <div style={{ margin: '14px' }}>
          <a
            onClick={() => toggleVariants(product.id)}
            style={{
              textDecoration: 'none',
              cursor: 'pointer',
              color: '#006EFF',
              float: 'right',
            }}
          >
            <span style={{ textDecoration: 'underline' }}>
              {product.showVariants ? 'Hide variants' : 'Show variants'}
            </span>
            <img
              src={DownIcon}
              style={{
                marginLeft: '3px',
                transition: 'all 0.2s ease-in-out',
                rotate: product.showVariants ? '180deg' : '0deg',
              }}
            />
          </a>
        </div>
      )}
      {(product.showVariants || variantsLength === 1) && (
        <div style={{ marginTop: variantsLength === 1 ? '14px' : '45px' }}>
          {product.variants.map((variant) => (
            <Variant
              key={variant.id}
              variant={variant}
              parentId={product.id}
              moveItem={moveItem}
              variantsLength={variantsLength}
              handleProductAndVariantDelete={handleProductAndVariantDelete}
              handleDiscountChange={handleDiscountChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Variant = ({
  variant,
  parentId,
  moveItem,
  variantsLength,
  handleProductAndVariantDelete,
  handleDiscountChange,
}) => {
  const [, ref] = useDrop({
    accept: [ItemType.VARIANT],
    hover: (item) => {
      if (item.id !== variant.id) {
        moveItem(item.id, variant.id, ItemType.VARIANT, parentId);
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType.VARIANT,
    item: { id: variant.id, parentId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={(node) => drag(ref(node))}
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '40px',
        height: '50px',
      }}
    >
      <span style={{ cursor: 'grab', marginRight: '10px' }}>
        <img src={DragAndDropIcon} />
      </span>
      <input
        style={{
          opacity: isDragging ? 0.5 : 1,
          borderRadius: '30px',
          marginRight: '10px',
          width: '170px',
          border: '1px solid #00000012',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 2px 4px 0px #0000001A',
          padding: '12px',
          outline: 0,
        }}
        type="text"
        value={variant.title}
        readOnly
      />
      <input
        style={{
          marginRight: '10px',
          width: '69px',
          border: '1px solid #00000012',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 2px 4px 0px #0000001A',
          outline: 0,
          padding: '12px',
        }}
        type="number"
        name="discountValue"
        value={variant.discountValue}
        onChange={(e) => handleDiscountChange(e, parentId, ItemType.VARIANT, variant.id)}
        min={0}
      />
      <select
        style={{
          marginRight: '10px',
          width: '95px',
          border: '1px solid #00000012',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 2px 4px 0px #0000001A',
          outline: 0,
          padding: '12px',
        }}
        name="discountType"
        value={variant.discountType}
        onChange={(e) => handleDiscountChange(e, parentId, ItemType.VARIANT, variant.id)}
      >
        <option value="percentage">% Off</option>
        <option value="flatOff">flat Off</option>
      </select>
      {variantsLength > 1 && (
        <img
          src={CrossIcon}
          alt="cross"
          style={{ cursor: 'pointer' }}
          onClick={() => handleProductAndVariantDelete(parentId, ItemType.VARIANT, variant.id)}
        />
      )}
    </div>
  );
};

export default DragAndDropProducts;
