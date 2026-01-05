import { useMemo } from "react";
import { BrowserProvider } from "ethers";
import { getHashedVoiceContract } from "../blockchain/contract";

const useContract = (provider: BrowserProvider | null) => {
    const contract = useMemo(() => {
        if(!provider) return null;
        return getHashedVoiceContract(provider);
    }, [provider]);

    return contract;
};

export default useContract;
