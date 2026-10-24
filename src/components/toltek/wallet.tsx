import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";

type Ctx = {
  address: string | null;
  connect: () => void;
  disconnect: () => void;
  lang: "ES" | "EN";
  toggleLang: () => void;
};

const WalletCtx = createContext<Ctx | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [lang, setLang] = useState<"ES" | "EN">("ES");
  const connect = () => {
    setAddress("GBTK…7QXA");
    toast.success("Billetera Stellar conectada correctamente", { description: "Freighter · Testnet · 1,240.50 USDC" });
  };
  const disconnect = () => {
    setAddress(null);
    toast("Billetera desconectada");
  };
  const toggleLang = () => {
    setLang((l) => (l === "ES" ? "EN" : "ES"));
    toast(lang === "ES" ? "Language: English (preview)" : "Idioma: Español");
  };
  return (
    <WalletCtx.Provider value={{ address, connect, disconnect, lang, toggleLang }}>{children}</WalletCtx.Provider>
  );
}

export function useWallet() {
  const c = useContext(WalletCtx);
  if (!c) throw new Error("useWallet outside provider");
  return c;
}
