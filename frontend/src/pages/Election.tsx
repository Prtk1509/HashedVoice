import { useParams } from "react-router-dom";
import CandidateCard from "../components/election/CandidateCard";

const Election = () => {
    const { id } = useParams();

    const electionOpen = true;

    const candidates = [
        {
            id: 1,
            name: "Alice Johnson",
            votes: 1
        },
        {
            id: 2,
            name: "Bob Smith",
            votes: 0
        }
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2">
                Election #{id}
            </h2>
            <p className="text-slate-400 mb-6">
                Class Representative Election
            </p>

            <div className="space-y-4">
                {candidates.map((c) => (
                    <CandidateCard
                        key={c.id}
                        name={c.name}
                        votes={c.votes}
                        showVotes={!electionOpen}
                        disabled={!electionOpen}
                        onVote={() => alert(`Voted for ${c.name}`)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Election;
