import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

const useWallet = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);

    const connectWallet = async () => {
        if(!window.ethereum)
        {
            alert("MetaMask not installed");
            return;
        }

        const browserProvider = new BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        setProvider(browserProvider);
        setAddress(accounts[0]);
    };

    useEffect(() => {
        const checkConnection = async () => {
            if(!window.ethereum) return;

            const browserProvider = new BrowserProvider(window.ethereum);
            const accounts = await browserProvider.send("eth_accounts", []);
            if(accounts.length > 0) {
                setProvider(browserProvider);
                setAddress(accounts[0]);
            }
        };

        checkConnection();
    }, []);

    return {
        address,provider,connectWallet
    };
};

export default useWallet;
