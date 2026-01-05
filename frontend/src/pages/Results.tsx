import ElectionCard from "../components/election/ElectionCard";
import useElections from "../hooks/useElections";
import useWallet from "../hooks/useWallet"

const Results = () => {
    const { provider } = useWallet();
    const elections = useElections(provider);

    const closedElections = elections.filter(e => !e.open);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">
                Election Results
            </h2>

            {closedElections.length === 0 && (
                <p className="text-slate-400">
                    No completed elections found.
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {closedElections.map((e) => (
                    <ElectionCard
                        key={e.id}
                        id={e.id}
                        title={e.title}
                        description={e.description}
                        status="CLOSED"
                    />
                ))}
            </div>
        </div>
    );
};

export default Results;
