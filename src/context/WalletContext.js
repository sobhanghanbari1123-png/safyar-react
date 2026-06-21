import { createContext, useContext, useState } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(1250000);

  const charge = (amount) => setBalance(b => b + amount);

  return (
    <WalletContext.Provider value={{ balance, charge }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
