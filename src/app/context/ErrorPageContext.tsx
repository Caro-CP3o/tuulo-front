"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type ErrorPageContextType = {
  isErrorPage: boolean;
  setIsErrorPage: (value: boolean) => void;
  isInitialized: boolean;
};

// ---------------------------
// Create Error Context with default values
// ---------------------------
const ErrorPageContext = createContext<ErrorPageContextType>({
  isErrorPage: false,
  setIsErrorPage: () => {},
  isInitialized: false,
});

export const ErrorPageProvider = ({ children }: { children: ReactNode }) => {
  // ---------------------------
  // State variables
  // ---------------------------
  const [isErrorPage, setIsErrorPage] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // ---------------------------
  // ErrorProvider: wraps the app and provides auth state
  // ---------------------------
  return (
    <ErrorPageContext.Provider
      value={{ isErrorPage, setIsErrorPage, isInitialized }}
    >
      {children}
    </ErrorPageContext.Provider>
  );
};

export const useErrorPage = () => useContext(ErrorPageContext);
