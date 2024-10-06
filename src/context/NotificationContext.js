// context/NotificationContext.js
import React, { createContext, useContext, useState } from 'react';

// Create the Notification Context
const NotificationContext = createContext();

// Create a custom hook to use the Notification Context
export const useNotificationContext = () => {
  return useContext(NotificationContext);
};

// Create the Notification Provider
export const NotificationProvider = ({ children }) => {
   const [articleTitle, setArticleTitle] = useState(null);

  return (
    <NotificationContext.Provider value={{ articleTitle, setArticleTitle }}>
      {children}
    </NotificationContext.Provider>
  );
};
