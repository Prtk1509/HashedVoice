import { useEffect, useState } from "react";
import { Contract } from "ethers";
import ABI from "../blockchain/abi";
import { CONTRACT_ADDRESS } from "../blockchain/address";
import { BrowserProvider } from "ethers";

export interface Candidate {
    id: number;
    name: string;
    votes: number;
}

const useCandidates = (
    provider: BrowserProvider | null,
    electionId: number
) => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!provider || !electionId) return;

        const fetchCandidates = async () => {
            setLoading(true);

            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

            const election = await contract.getElectionMetadata(electionId);
            const count = Number(election.candidateCount);

            const results: Candidate[] = [];

            for(let i=1;i<=count;i++) {
                const c = await contract.getCandidate(electionId, i);
                results.push({
                    id: Number(c[0]),
                    name: c[1],
                    votes: Number(c[2])
                });
            }

            setCandidates(results);
            setLoading(false);
        };

        fetchCandidates();
    }, [provider, electionId]);

    return { candidates, loading };
};

export default useCandidates;