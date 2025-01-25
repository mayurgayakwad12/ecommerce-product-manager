import React, { useEffect, useState } from 'react';
import { Loader } from './Loader';
import SearchIcon from '../assets/SearchIcon.svg';

import { useAppProvider } from '../AppContext';

export const ProductsTreeList = ({ selectedProducts, setSelectedProducts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { apiData, setApiData } = useAppProvider();
  const [dataLoading, setDataLoading] = useState(true);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleProductSelect = (productId, variants, isChecked) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: isChecked ? variants.map((v) => v.id) : [],
    }));
  };

  const handleVariantSelect = (productId, variantId, isChecked) => {
    setSelectedProducts((prev) => {
      const updatedVariants = isChecked
        ? [...(prev[productId] || []), variantId]
        : (prev[productId] || []).filter((id) => id !== variantId);

      return {
        ...prev,
        [productId]: updatedVariants,
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const response = await fetch(
          `https://stageapi.monkcommerce.app/task/products/search?search=${searchQuery}&page=${1}&limit=10`,
          {
            method: 'GET',
            headers: {
              'x-api-key': '72njgfa948d9aS7gs5',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setApiData(data);
        setDataLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchData();
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) setSelectedProducts({});
  }, [searchQuery]);

  const renderList = () => (
    <div
      style={{
        // width: '580px',
        overflowY: 'auto',
        // border: '1px solid #ddd'
        height: '395px',
      }}
    >
      {(apiData || []).map((product) => {
        const productSelected = selectedProducts[product.id] || [];
        const isAllSelected = product.variants.some((v) => productSelected.includes(v.id));
        return (
          <div key={product.id}>
            {/* Product Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid #0000001A',
                height: '50px',
              }}
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) =>
                  handleProductSelect(product.id, product.variants, e.target.checked)
                }
                style={{
                  marginRight: '10px',
                  width: '18px',
                  height: '18px',
                  accentColor: '#008060',
                  borderRadius: '4px',
                }}
              />
              <img
                src={
                  product.image.src
                    ? product.image.src
                    : 'https://thumbs.dreamstime.com/b/web-324830775.jpg'
                }
                alt={product.title}
                style={{
                  width: '36px',
                  height: '36px',
                  marginRight: '10px',
                  borderRadius: '4px',
                }}
              />
              <h3>{product.title}</h3>
            </div>

            <ul
              style={{
                listStyleType: 'none',
                paddingLeft: '40px',
                borderBottom: '1px solid #0000001A',
                // marginTop: '10px',
              }}
            >
              {product.variants.map((variant) => (
                <>
                  <li
                    key={variant.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                      // borderBottom: '1px solid grey',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={productSelected.includes(variant.id)}
                        onChange={(e) =>
                          handleVariantSelect(product.id, variant.id, e.target.checked)
                        }
                        style={{
                          marginRight: '10px',
                          width: '18px',
                          height: '18px',
                          accentColor: '#008060',
                          borderRadius: '4px',
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '80%',
                        }}
                      >
                        <div>{variant.title}</div>
                        <div
                          style={{
                            marginLeft: '16px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              gap: 10,
                              alignItems: 'center',
                            }}
                          >
                            <div>{`${variant.price} available`}</div>
                            <div>$ {variant.price}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '32px',
            paddingTop: '10px',
          }}
        >
          <img src={SearchIcon} />
        </div>
        <input
          type="text"
          placeholder="Search product"
          value={searchQuery}
          onChange={handleSearch}
          style={{
            width: '87%',
            padding: '10px',
            paddingLeft: '38px',
            margin: '20px',
            borderRadius: '4px',
            border: '1px solid #0000001A',
            outline: 0,
          }}
        />
      </div>
      <div
        style={{
          minHeight: '395px',
          margin: 0,
          padding: 0,
          borderTop: '1px solid #0000001A',
        }}
      >
        {!dataLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Loader />
          </div>
        ) : (
          renderList()
        )}
      </div>
    </div>
  );
};
