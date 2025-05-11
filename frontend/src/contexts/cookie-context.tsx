import { Context, createContext, useContext, useState } from 'react';
import { CookiePopup } from '@/components/cookie-popup/CookiePopup';

export type CookieType = 'accept' | 'decline';

export type CookieContextType = {
  cookie?: CookieType;
  setCookie: (cookie: CookieType) => void;
  showCookiePopup: () => void;
};

const cookieLocalStorageKey = 'cookie-accept';

const CookieContext: Context<CookieContextType> = createContext({
  setCookie: (cookie: CookieType) => {
  },
  showCookiePopup: () => {
  },
});

export function CookieDataProvider({ children }: { children: React.ReactNode }) {
  const storageCookie = localStorage.getItem(cookieLocalStorageKey);
  const [cookie, setCookie] = useState<CookieType | undefined>(storageCookie ? storageCookie as CookieType : undefined);
  const [showPopup, setShowPopup] = useState(false);

  const setCookieWrapper = (cookie: CookieType) => {
    localStorage.setItem(cookieLocalStorageKey, cookie.toString());
    setCookie(cookie);
    setShowPopup(false);
  };

  const showCookiePopup = () => {
    setShowPopup(true);
  };

  return (
    <CookieContext.Provider value={{ cookie: cookie, setCookie: setCookieWrapper, showCookiePopup }}>
      {showPopup && (<CookiePopup setCookie={setCookieWrapper}></CookiePopup>)}
      {children}
    </CookieContext.Provider>);
}

export function useCookieContext() {
  return useContext(CookieContext);
}
