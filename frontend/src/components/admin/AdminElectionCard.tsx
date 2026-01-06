interface Candidate {
    id: number;
    name: string;
}

interface AdminElectionCardProps {
    id: number;
    title: string;
    open: boolean;

    candidates: Candidate[];

    isAdmin: boolean;
    isElectionAdmin: boolean;
    isCandidateManager: boolean;

    candidateInput: string;
    onCandidateInputChange: (value: string) => void;
    onAddCandidate: () => void;

    onOpenElection: () => void;
    onCloseElection: () => void;
}

const AdminElectionCard = ({
    id, title, open,
    candidates,
    isAdmin, isElectionAdmin, isCandidateManager,
    candidateInput, onCandidateInputChange, onAddCandidate,
    onOpenElection, onCloseElection
}: AdminElectionCardProps) => {
    return (
        <div key={id} className="border border-slate-700 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">
                {title}
              </h3>

              <span className="text-sm text-slate-400">
                {open ? "OPEN" : "CLOSED"}
              </span>
            </div>

            {/* //----------------------------Candidate Management Section--------------------------- */}

            {/* ------------------- Candidate List ------------------- */}

            {isCandidateManager && (
              <div className="mt-2">
                <p className="text-sm text-slate-400 mb-1">
                  Added Candidates : 
                </p>
            
                {candidates.length > 0 ? (
                  <ul className="text-sm text-slate-300 space-y-1">
                    {candidates.map((c) => (
                      <li key={c.id}>
                        • {c.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-300 space-y-1">
                    No candidates added yet.
                  </p>
                )}
              </div>
            )}

            {/* ------------------- Add Candidate ------------------- */}

            {isCandidateManager && !open && (
              <div className="flex gap-2 mt-3">
                <input 
                  type="text" 
                  value={candidateInput} 
                  onChange={(e) => onCandidateInputChange(e.target.value)} 
                  placeholder="Candidate name"
                  className="flex-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
                />
                <button 
                  onClick={onAddCandidate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Add
                </button>
              </div>
            )}
            
            {isCandidateManager && open && (
              <p className="text-sm text-slate-500 mt-2">
                Cannot add candidates while election is OPEN.
              </p>
            )}

            {/* ----------------------------Election Management Section--------------------------- */}

            {(isAdmin || isElectionAdmin) && (
            <div className="flex gap-3 mt-4">
                {!open && (
                    <button onClick={onOpenElection} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm">
                        Open Election
                    </button>
                )}

                {open && (
                <button onClick={onCloseElection} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm">
                    Close Election
                </button>
                )}
            </div>
            )}
        </div>
    );
};

export default AdminElectionCard;