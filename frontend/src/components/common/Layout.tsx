import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Navbar />
            <main className="p-6 max-w-6xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;