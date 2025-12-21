import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-wide">
                HashedVoice
            </h1>

            <div className="flex gap-6 text-sm font-medium">
                <Link to="/" className="hover:text-blue-400">
                    Elections
                </Link>
                <Link to="/results" className="hover:text-blue-400">
                    Results
                </Link>
                <Link to="/admin" className="hover:text-blue-400">
                    Admin
                </Link>
            </div>
        </div>
    </nav>
  );
};

export default Navbar;
