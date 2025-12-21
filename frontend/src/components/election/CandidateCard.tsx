interface CandidateCardProps {
    name: string;
    votes?: number;
    showVotes?: boolean;
    onVote?: () => void;
    disabled?: boolean;
}

const CandidateCard = ({
    name,
    votes,
    showVotes=false,
    onVote,
    disabled=false
}: CandidateCardProps) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex justify-between items-center">
        <div>
            <h3 className="font-semibold">
                {name}
            </h3>
            {showVotes && (
                <p className="text-sm text-slate-400">
                    Votes : {votes}
                </p>
            )}
        </div>

        <button
            disabled={disabled}
            onClick={onVote}
            className={`px-4 py-2 rounded text-sm font-medium 
                ${
                    disabled
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
        >
            Vote
        </button>
    </div>
  );
};

export default CandidateCard
