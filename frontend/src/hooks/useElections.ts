import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import useContract from "./useContract";

interface Election {
    id: number;
    title: string;
    description: string;
    open: boolean;
    candidateCount: number;
}

const useElections = (provider: BrowserProvider | null) => {
    const contract = useContract(provider);
    const [elections, setElections] = useState<Election[]>([]);

    useEffect(() => {
        if(!contract) return;

        const fetchElections = async () => {
            const count = await contract.electionCount();
            const results: Election[] = [];

            for(let i=1;i<=count;i++) {
                const e = await contract.getElectionMetadata(i);
                results.push({
                    id: i,
                    title: e.name,
                    description: e.description,
                    open: e.votingOpen,
                    candidateCount: Number(e.candidateCount)
                });
            }

            setElections(results);
        };

        fetchElections();
    }, [contract]);

    return elections;
};

export default useElections;