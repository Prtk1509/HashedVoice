import ElectionCard from "../components/election/ElectionCard";
import useWallet from "../hooks/useWallet";
import useElections from "../hooks/useElections";

const Home = () => {

    const { provider } = useWallet();
    const elections = useElections(provider);
    const activeElections = elections.filter(e => e.open);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Elections</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeElections.map((e) => (
                    <ElectionCard
                        key={e.id}
                        id={e.id}
                        title={e.title}
                        description={e.description}
                        status={e.open ? "OPEN" : "CLOSED"}
                    />
                ))}
            </div>
        </div>
    );
};

export default Home;
