import ElectionCard from "../components/election/ElectionCard";

const Home = () => {

    const elections = [
        {
            id: 1,
            title: "CR Election",
            description: "Class Represenatative Election 2025",
            status: "OPEN" as const
        },
        {
            id: 2,
            title: "CSES Secretary Election",
            description: "CSE Society Secretary Election 2025",
            status: "UPCOMING" as const
        },
        {
            id: 1,
            title: "CSES Joint Secretary Election",
            description: "CSE Society Joint Secretary Election 2025",
            status: "CLOSED" as const
        }
    ];
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Elections</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {elections.map((e) => (
                    <ElectionCard
                        key={e.id}
                        id={e.id}
                        title={e.title}
                        description={e.description}
                        status={e.status}
                    />
                ))}
            </div>
        </div>
    );
};

export default Home;
