import { Link, useParams } from "react-router-dom";
import CandidateCard from "../components/election/CandidateCard";
import useWallet from "../hooks/useWallet";
import useCandidates from "../hooks/useCandidates";
import { CONTRACT_ADDRESS } from "../blockchain/address";
import ABI from "../blockchain/abi";
import { Contract } from "ethers";
import { useEffect, useState } from "react";

const Election = () => {
    const { id } = useParams();
    const electionId = Number(id);

    const { provider } = useWallet();
    const { candidates, loading } = useCandidates(provider, electionId);

    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [checkingVote, setCheckingVote] = useState<boolean>(true);

    const [electionOpen, setElectionOpen] = useState<boolean>(false);
    const [loadingElection, setLoadingElection] = useState<boolean>(true);

    const [checkingRegistration, setCheckingRegistration] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [admission, setAdmission] = useState<string | null>(null);

    const [txHash, setTxHash] = useState<string | null>(null);

    const [isAdmin, setIsAdmin] = useState(false);

    const [isRevoked, setIsRevoked] = useState(false);

    const handleVote = async (candidateId: number) => {
        if(!provider) {
            alert("Wallet not connected");
            return;
        }
        
        if(!admission) {
            alert("Admission not found. Please Register again.");
            return;
        }

        try {
            const signer = await provider.getSigner();
            const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

            const tx = await contract.vote(electionId, candidateId, admission);

            setTxHash(tx.hash);
            await tx.wait();

            alert("Vote cast successfully!");
        } catch (err) {
            console.error(err);
            alert("Transaction failed");
        }
    }


    useEffect(() => {
        const checkHasVoted = async () => {
            if(!provider) return;

            try {
                const signer = await provider.getSigner();
                const address = await signer.getAddress();

                const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

                const voted = await contract.hasVoted(electionId, address);
                setHasVoted(voted);
            } catch (err: unknown) {
                console.error("Failed to check voting status", err);
                let message = "Transaction Failed";

                if(
                    typeof err === "object" &&
                    err !== null
                ) {
                    const e = err as {
                        shortMessage?: string;
                        message?: string;
                        info?: {
                            error?: {
                                message?: string;
                            };
                        };
                    };

                    if(
                        e.shortMessage?.includes("Not allowed") ||
                        e.message?.includes("Not allowed") ||
                        e.info?.error?.message?.includes("Not allowed")
                    ) {
                        message = "Your admission number is not eligible for this election";
                    }

                    alert(message);
                }
            } finally {
                setCheckingVote(false);
            }
        };

        checkHasVoted();
    }, [provider, electionId]);

    useEffect(() => {
        const fetchElectionMetadata = async () => {
            if(!provider) return;

            try {
                const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

                const metadata = await contract.getElectionMetadata(electionId);
                setElectionOpen(metadata[3])
            } catch (err) {
                console.error("Failed to fetch election metadata", err);
            } finally {
                setLoadingElection(false);
            }
        };

        fetchElectionMetadata();
    }, [provider, electionId]);

    //Effect for Registration

    useEffect(() => {
        const checkRegistration = async () => {
            if(!provider) {
                setCheckingRegistration(false);
                return;
            }

            try {
                const signer = await provider.getSigner();
                const address = await signer.getAddress();

                const res = await fetch(
                    `http://localhost:5000/api/voters/${address}`
                );
                const data = await res.json();

                if(data.registered) {
                    setIsRegistered(true);
                    setAdmission(data.admission);
                    setIsRevoked(data.revoked === true);
                } else {
                    setIsRegistered(false);
                }
            } catch(err) {
                console.error(err);
            } finally {
                setCheckingRegistration(false);
            }
        };

        checkRegistration();
    }, [provider]);

    // Effect for Admin Check

    useEffect(() => {
        const checkAdmin = async () => {
            if (!provider) return;
    
            try {
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
    
                const contract = new Contract(CONTRACT_ADDRESS,ABI,provider);
                const ADMIN_ROLE = await contract.ADMIN_ROLE();
    
                const admin = await contract.hasRole(ADMIN_ROLE, address);
                setIsAdmin(admin);
            } catch(err) {
                console.error("Failed to check admin role", err);
            }
        };

        checkAdmin();
    }, [provider]);

    const canVote = electionOpen && isRegistered && !isRevoked && !hasVoted && !checkingVote;

    //---------FINAL UI------------
    return (
        <div>
            {checkingRegistration ? (
                <p className="text-slate-400">
                    Checking Voter registration...
                </p>
            ) : (
                <div>
                    <h2 className="text-2xl font-bold mb-2">
                        Election #{id}
                    </h2>

                    <p className="text-slate-400 mb-6">
                        {
                            loadingElection
                            ? "Loading election status..."
                            : electionOpen
                                ? "Voting is OPEN"
                                : "Voting is CLOSED"
                        }
                    </p>

                    {/* Registration Warning */}

                    {electionOpen && !checkingRegistration && !isRegistered && (
                        <div className="text-sm text-red-400 mb-4">
                            <p>You are not registered to vote.</p>
                            <Link to="/register" className="text-blue-400 underline">
                                Register here
                            </Link>
                        </div>
                    )}

                    {electionOpen && isRegistered && isRevoked && (
                        <p className="text-red-500 mb-3">
                            Your voting rights have been revoked by the administrator.
                        </p>
                    )}

                    {hasVoted && (
                        <p className="text-green-600 mb-4">
                            You have already voted in this election.
                        </p>
                    )}

                    {loading && (
                        <p className="text-slate-500">
                            Loading candidates...
                        </p>
                    )}
                    
                    {!loading && candidates.length === 0 && (
                        <p className="text-slate-500">
                            No candidates found for this election.
                        </p>
                    )}

                    <div className="space-y-4">
                        {candidates.map((c) => (
                            <CandidateCard
                                key={c.id}
                                name={c.name}
                                votes={c.votes}
                                showVotes={!electionOpen || isAdmin}
                                disabled={!canVote}
                                onVote={() => handleVote(c.id)}
                            />
                        ))}
                    </div>

                    {txHash && (
                        <div className="mt-4 text-sm text-slate-400 break-all">
                            <p>Transaction Hash : </p>
                            <code className="text-green-400">
                                {txHash}
                            </code>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Election;
