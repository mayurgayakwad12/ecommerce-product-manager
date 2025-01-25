import React, { createContext, useState, useContext } from 'react';

export const AppContext = createContext();

export const useAppProvider = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [selectedProducts, setSelectedProduct] = useState([]);
  const [apiData, setApiData] = useState([]);

  return (
    <AppContext.Provider
      value={{
        selectedProducts,
        setSelectedProduct,
        apiData,
        setApiData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
