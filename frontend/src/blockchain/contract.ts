import { BrowserProvider, Contract } from "ethers";
import ABI from "./abi";
import { CONTRACT_ADDRESS } from "./address";

export const getHashedVoiceContract = (
    providerOrSigner: BrowserProvider
) => {
    return new Contract(CONTRACT_ADDRESS, ABI, providerOrSigner);
};