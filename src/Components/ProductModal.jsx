import React, { useState } from 'react';
import { useAppProvider } from '../AppContext';
import { ProductsTreeList } from './ProductsTreeList';
import crossIcon from '../assets/Cross.svg';

export default function ProductModal({ modalState, setModalState }) {
  const { setSelectedProduct, apiData } = useAppProvider();
  const [selectedProducts, setSelectedProducts] = useState({});

  const handleClose = () => {
    setModalState({ id: null, open: false });
    setSelectedProducts({});
  };

  const getSelectedCount = () => {
    return Object.values(selectedProducts).filter((variants) => variants.length > 0).length;
  };

  const handleAdd = () => {
    const returnArray = [];
    Object.keys(selectedProducts).forEach((productId) => {
      const selectedProduct = apiData.find((product) => product.id === +productId);
      const varientSelected = selectedProduct?.variants.filter((vari) =>
        (selectedProducts[productId] || []).includes(vari.id)
      );
      if (selectedProduct) {
        returnArray.push({
          parentId: modalState.id,
          ...selectedProduct,
          variants: varientSelected,
        });
      }
    });

    setSelectedProduct(returnArray);
    handleClose();
  };

  const selectedProductsCount = getSelectedCount();

  if (!modalState.open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          width: '663px',
          maxHeight: '612px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0 }}>Select Product</h2>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              outline: 0,
            }}
            onClick={handleClose}
          >
            <img src={crossIcon} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <ProductsTreeList
            setSelectedProducts={setSelectedProducts}
            selectedProducts={selectedProducts}
          />
        </div>
        <div
          style={{
            borderTop: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px',
          }}
        >
          <div>{selectedProductsCount} product(s) selected</div>
          <div>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginRight: '10px',
                outline: 0,
                cursor: 'pointer',
              }}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              style={{
                padding: '10px 20px',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                outline: 0,
                backgroundColor: selectedProductsCount === 0 ? 'grey' : '#007bff',
                cursor: selectedProductsCount === 0 ? 'not-allowed' : 'pointer',
              }}
              disabled={selectedProductsCount === 0}
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
