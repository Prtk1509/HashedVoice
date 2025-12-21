import { Link } from "react-router-dom";

interface ElectionCardProps {
    id: number;
    title: string;
    description: string;
    status: 'UPCOMING' | 'OPEN' | 'CLOSED';
}

const statusColors = {
    UPCOMING: "bg-yellow-600",
    OPEN: "bg-green-600",
    CLOSED: "bg-red-600",
};

const ElectionCard = ({ id, title, description, status}: ElectionCardProps) => {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    {title}
                </h3>
                <span className={`text-xs px-3 py-1 rounded-full text-white ${statusColors[status]}`}>
                    {status}
                </span>
            </div>

            <p className="text-slate-400 text-sm">
                {description}
            </p>

            <Link to={`/election/${id}`} className="mt-2 inline-block text-sm text-blue-400 hover:underline">
                View Election →
            </Link>
        </div>
    );
};

export default ElectionCard;