import { useEffect, useState } from "react";
import useWallet from "../hooks/useWallet";

const API_BASE = "http://localhost:5000/api";

const Register = () => {
    const {provider} = useWallet();

    const [wallet, setWallet] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [admission, setAdmission] = useState("");

    const [checking, setChecking] = useState(true);
    const [registered, setRegistered] = useState(false);
    const [message, setMessage] = useState("");

    //Fetching Wallet

    useEffect(() => {
        const init = async () => {
            if(!provider) {
                setChecking(false);
                return;
            }

            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setWallet(address);

            try {
                const res = await fetch(`${API_BASE}/voters/${address}`);
                const data = await res.json();

                if(data.registered) {
                    setRegistered(true);
                    setName(data.name);
                    setAdmission(data.admission);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setChecking(false);
            }
        };

        init();
    }, [provider]);

    const handleRegister = async () => {
        if(!wallet || !name || !admission) {
            alert("All fields are required");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/voters/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    wallet,
                    name,
                    admission
                })
            });

            if(res.status === 201) {
                setRegistered(true);
                setMessage("Registration Successful");
            } else if(res.status===409) {
                setMessage("You are already registered");
            } else {
                setMessage("Registration Failed");
            }
        } catch(err) {
            console.error(err);
            setMessage("Server Error");
        }
    };

    //----------------UI states-------------------

    if(!provider) {
        return (
            <p className="text-slate-400">
                Please connect your wallet to register.
            </p>
        );
    }

    if(checking) {
        return (
            <p className="text-slate-400">
                Checking registration status...
            </p>
        );
    }

    if(registered) {
        return (
            <div className="border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">
                    You are Registered ✅
                </h2>

                <p className="text-sm text-slate-400">
                    Name: {name}
                </p>

                <p className="text-sm text-slate-400">
                    Admission: {admission}
                </p>
            </div>
        );
    }

    //-------------------------Registration UI---------------------
    return (
        <div className="border border-slate-700 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-4">
                Voter Registration
            </h2>

            <input 
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mb-3 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            />

            <input
                type="text"
                placeholder="Admission Number"
                value={admission}
                onChange={(e) => setAdmission(e.target.value)}
                className="w-full mb-4 py-2 px-3 rounded bg-slate-900 border border-slate-700 text-sm"
            />

            <button
                onClick={handleRegister}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded tsext-sm" 
            >
                Register
            </button>

            {message && (
                <p className="mt-3 text-sm text-slate-400">
                    {message}
                </p>
            )}
        </div>
    );
};

export default Register;