import { Link } from 'react-router-dom';
import useWallet from '../../hooks/useWallet';

const Navbar = () => {
    const { address, connectWallet } = useWallet();

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-wide">
                HashedVoice
            </h1>

            <div className="flex gap-6 text-sm font-medium">
                <Link to="/" className="hover:text-blue-400 py-1">
                    Elections
                </Link>
                <Link to="/results" className="hover:text-blue-400 py-1">
                    Results
                </Link>
                <Link to="/admin" className="hover:text-blue-400 py-1">
                    Admin
                </Link>
                <Link to="/register" className="hover:text-blue-400 py-1">
                    Register
                </Link>

                {address ? (
                    <span className="px-3 py-1 bg-slate-700 rounded text-xs">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                ) : (
                    <button 
                        onClick={connectWallet}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                    >
                        Connect Wallet
                    </button>
                )}
            </div>
        </div>
    </nav>
  );
};

export default Navbar;
