import React, { useEffect, useRef, useState } from 'react';
import { Loader } from './Loader';
import SearchIcon from '../assets/SearchIcon.svg';
import NoImage from '../assets/NoImage.jpg';

import { useAppProvider } from '../AppContext';

export const ProductsTreeList = ({ selectedProducts, setSelectedProducts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { apiData, setApiData } = useAppProvider();
  const [dataLoading, setDataLoading] = useState(true);

  const pageCount = useRef(1);

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

  const fetchData = async (source = '') => {
    if (source === 'searchQuery') {
      pageCount.current = 0;
    }
    try {
      setDataLoading(true);
      const response = await fetch(
        `https://stageapi.monkcommerce.app/task/products/search?search=${searchQuery}&page=${pageCount.current}&limit=10`,
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
      if (source === 'pageChange' && !dataLoading && data) {
        setApiData((prev) => [...(prev || []), ...data]);
      } else {
        setApiData(data);
      }
      setDataLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    if (searchQuery) setSelectedProducts({});
    fetchDataDebounced('searchQuery');
  }, [searchQuery]);

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchDataDebounced = debounce((source) => fetchData(source), 300);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !dataLoading && apiData?.length) {
            pageCount.current++;
            fetchDataDebounced('pageChange');
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 1.0 } // Observe when fully visible
    );

    const infiniteDivElement = document.querySelector('.infinite-div');
    if (infiniteDivElement) {
      observer.observe(infiniteDivElement);
    }

    return () => {
      if (infiniteDivElement) {
        observer.unobserve(infiniteDivElement);
      }
      observer.disconnect();
    };
  }, [apiData]);

  const renderList = () => (
    <div
      style={{
        overflowY: 'auto',
        height: '395px',
        scrollbarWidth: 'thin',
      }}
    >
      {(apiData || []).map((product) => {
        const productSelected = selectedProducts[product.id] || [];
        const isAllSelected = product.variants.some((v) => productSelected.includes(v.id));
        const productVariantsLength = product.variants;
        return (
          <div key={product.id}>
            {/* Product Header */}
            <div
              style={{
                borderBottom: '1px solid #0000001A',
                height: '50px',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '50px',
                  gap: '12px',
                  paddingLeft: '22px',
                }}
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) =>
                    handleProductSelect(product.id, product.variants, e.target.checked)
                  }
                  style={{
                    width: '24px',
                    height: '24px',
                    accentColor: '#008060',
                    borderRadius: '4px',
                  }}
                />
                <img
                  src={product.image.src ? `${product.image.src}?width=100&height=100` : NoImage}
                  alt={product.title}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                  }}
                  loading="lazy"
                />
                <div>{product.title}</div>
              </div>
            </div>

            <ul
              style={{
                listStyleType: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {product.variants.map((variant, index) => (
                <>
                  <li
                    key={variant.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      ...(index != productVariantsLength - 1
                        ? { borderBottom: '1px solid #0000001A' }
                        : {}),
                      height: '50px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        paddingLeft: '68px',
                        gap: '12px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={productSelected.includes(variant.id)}
                        onChange={(e) =>
                          handleVariantSelect(product.id, variant.id, e.target.checked)
                        }
                        style={{
                          // marginRight: '10px',
                          width: '24px',
                          height: '24px',
                          accentColor: '#008060',
                          borderRadius: '4px',
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '90%',
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
                              gap: 30,
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
      {!dataLoading && <div className="infinite-div"></div>}
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
        {dataLoading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              top: '150px',
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
