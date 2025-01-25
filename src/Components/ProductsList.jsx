import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragAndDropIcon from '../assets/DragAndDrop.svg';
import CrossIcon from '../assets/Cross.svg';
import ProductModal from './ProductPickerModal';
import { useAppProvider } from '../AppContext';
import CreatePencilIcon from '../assets/Createpencil.svg';

const ItemType = {
  PRODUCT: 'product',
  VARIANT: 'variant',
};

const DragAndDropProducts = () => {
  const [modalState, setModalState] = useState({ id: null, open: false });
  const { selectedProducts } = useAppProvider();
  const [data, setData] = useState([...selectedProducts]);

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
      const list = [
        ...prev.filter((val) => val.id !== selectedProducts[0].parentId),
        ...selectedProducts,
      ];
      return [...new Map(list.map((item) => [item['id'], item])).values()];
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

  console.log({ data });

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: '50px', width: '500px', fontFamily: 'Arial, sans-serif' }}>
        <h3>Add Products</h3>
        {data.map((product) => (
          <Product
            key={product.id}
            product={product}
            moveItem={moveItem}
            toggleVariants={toggleVariants}
            setModalState={setModalState}
          />
        ))}

        <ProductModal setModalState={setModalState} modalState={modalState} />
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
    </DndProvider>
  );
};

const Product = ({ product, moveItem, toggleVariants, setModalState }) => {
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
            onClick={() => console.log('Button clicked')}
          >
            <div
              // variant="outlined"
              onClick={() => setModalState({ id: product.id, open: true })}
              style={{ cursor: 'pointer' }}
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
            // onClick={handleAddEmptyProduct}
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
            >
              <option style={{ backgroundColor: '#FFFFFF' }}>% Off</option>
              <option>flat Off</option>
            </select>
          </>
        )}

        {product.source !== 'new' && <img src={CrossIcon} alt="cross" />}
      </div>
      {product.source !== 'new' && (
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
            <span>{product.showVariants ? '˄' : '˅'}</span>
          </a>
        </div>
      )}
      {product.showVariants && (
        <div style={{ marginTop: '45px' }}>
          {product.variants.map((variant) => (
            <Variant key={variant.id} variant={variant} parentId={product.id} moveItem={moveItem} />
          ))}
        </div>
      )}
    </div>
  );
};

const Variant = ({ variant, parentId, moveItem }) => {
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
        justifyContent: 'flex-end',
      }}
    >
      <span style={{ cursor: 'grab', marginRight: '10px' }}>
        <img src={DragAndDropIcon} />
      </span>
      <input
        style={{
          opacity: isDragging ? 0.5 : 1,
          borderRadius: '30px',
          marginBottom: '5px',
          marginRight: '10px',
          width: '184px',
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
      >
        <option>% Off</option>
        <option>flat Off</option>
      </select>
      <img src={CrossIcon} alt="cross" />
    </div>
  );
};

export default DragAndDropProducts;
