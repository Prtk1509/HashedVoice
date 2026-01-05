import { useEffect, useState } from "react";
import { Contract } from "ethers";
import useWallet from "../hooks/useWallet";
import useElections from "../hooks/useElections";
import { CONTRACT_ADDRESS } from "../blockchain/address";
import ABI from "../blockchain/abi";
import AdminElectionCard from "../components/admin/AdminElectionCard";

interface Candidate {
  id: number;
  name: string;
}

const Admin = () => {
  const { provider } = useWallet();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isElectionAdmin, setIsElectionAdmin] = useState(false);
  const [isCandidateManager, setIsCandidateManager] = useState(false);

  const elections = useElections(provider);

  const [candidateNames, setCandidateNames] = useState<Record<number, string>>({});

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minAdmission, setMinAdmission] = useState("");
  const [maxAdmission, setMaxAdmission] = useState("");

  const [candidatesByElection, setCandidatesByElection] = useState<Record<number, Candidate[]>>({});

  //---------------------- State for Roles ----------------------

  const [roleAddress, setRoleAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<"ELECTION_ADMIN" | "CANDIDATE_MANAGER">("ELECTION_ADMIN");

  const [electionAdmins, setElectionAdmins] = useState<string[]>([]);
  const [candidateManagers, setCandidateManagers] = useState<string[]>([]);

  const [revokeAdmission, setRevokeAdmission] = useState("");

  useEffect(() => {
    const checkRoles = async () => {
      if(!provider) {
        setCheckingAccess(false);
        return;
      }

      try {
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

        const ADMIN_ROLE = await contract.ADMIN_ROLE();
        const ELECTION_ADMIN_ROLE = await contract.ELECTION_ADMIN_ROLE();
        const CANDIDATE_MANAGER_ROLE = await contract.CANDIDATE_MANAGER_ROLE();
        
        const admin = await contract.hasRole(ADMIN_ROLE, address);
        const electionAdmin = await contract.hasRole(ELECTION_ADMIN_ROLE, address);
        const candidateManager = await contract.hasRole(CANDIDATE_MANAGER_ROLE, address);

        setIsAdmin(admin);
        setIsElectionAdmin(electionAdmin);
        setIsCandidateManager(candidateManager);

        if(admin || electionAdmin || candidateManager) {
          setHasAccess(true);
        }
      } catch (err) {
        console.error("Failed to check roles", err);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkRoles();
  }, [provider]);

  useEffect(() => {
    const fetchCandidates = async () => {
      if(!provider || elections.length === 0) return;

      try {
        const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

        const result: Record<number,Candidate[]> = {};

        for(const e of elections) {
          const list = [];

          for(let i=1; i<=e.candidateCount; i++) {
            const c = await contract.getCandidate(e.id, i);

            list.push({
              id: Number(c[0]),
              name:c[1]
            });
          }
          result[e.id] = list;
        }
        setCandidatesByElection(result);
      } catch (err) {
        console.error("Failed to fetch candidates", err);
      }
    };
    fetchCandidates();
  }, [provider, elections]);

  //--------------------- Effect for Roles ---------------------

  useEffect(() => {
    const fetchRoleMembers = async () => {
      if(!provider||isAdmin) return;

      try {
        const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

        const ELECTION_ADMIN_ROLE = await contract.ELECTION_ADMIN_ROLE();
        const CANDIDATE_MANAGER_ROLE = await contract.CANDIDATE_MANAGER_ROLE();

        const electionAdminCount = await contract.getRoleMemberCount(ELECTION_ADMIN_ROLE);
        const candidateManagerCount = await contract.getRoleMemberCount(CANDIDATE_MANAGER_ROLE);

        const ea: string[] = [];
        const cm: string[] = [];

        for(let i=0; i<electionAdminCount; i++) {
          ea.push(await contract.getRoleMember(ELECTION_ADMIN_ROLE,i));
        }

        for(let i=0; i<candidateManagerCount; i++) {
          cm.push(await contract.getRoleMember(CANDIDATE_MANAGER_ROLE,i));
        }

        setElectionAdmins(ea);
        setCandidateManagers(cm);
      } catch(err) {
        console.error("Failed to fetch role members", err);                
      }
    };

    fetchRoleMembers();
  }, [provider, isAdmin]);

  //--------------------CANDIDATE MANAGEMENT--------------------

  const handleCandidateNameChange = (electionId: number, value: string) => {
    setCandidateNames(prev => ({
      ...prev,
      [electionId]: value
    }));
  }

  const handleAddCandidate = async (electionId: number) => {
    if(!provider) return;

    const name = candidateNames[electionId];
    if(!name || name.trim() === "") {
      alert("Candidate name required");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx=await contract.addCandidate(electionId, name);
      await tx.wait();

      alert("Candidate added successfully");
      setCandidateNames(prev => ({
        ...prev,
        [electionId]: ""
      }));

      window.location.reload();
    } catch (err) {
      console.error("Failed to add candidate", err);
      alert("Transaction failed");
    }
  };

  //-------------------------Election Admin----------------------------------

  const handleOpenElection = async (electionId: number) => {
    if(!provider) return;

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.openElection(electionId);
      await tx.wait();

      alert("Election opened successfully");
      window.location.reload();
    } catch (err) {
      console.error("Failed to open election", err);
      alert("Transaction failed");
    }
  };

  const handleCloseElection = async (electionId: number) => {
    if(!provider) return;

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.closeElection(electionId);
      await tx.wait();

      alert("Election closed successfully");
      window.location.reload();
    } catch (err) {
      console.error("Failed to close election", err);
      alert("Transaction failed");
    }
  };

  //---------------------------Admin----------------------------------

  const handleCreateElection = async () => {
    if(!provider) return;

    if(!name || name.trim() === "" || !description || description.trim() === "") {
      alert("Name and description are required");
      return;
    }
    
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.createElection(
        name,
        description,
        minAdmission,
        maxAdmission
      );
      await tx.wait();

      alert("Election created successfully");
      setName("");
      setDescription("");
      setMinAdmission("");
      setMaxAdmission("");

      window.location.reload();
    } catch (err) {
      console.error("Failed to create election", err);
      alert("Transaction failed");
    }
  };

  //------------ Handlers for Granting and Revoking Roles -----------

  const handleGrantRole = async () => {
    if(!provider || !roleAddress) return;

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const role = 
        selectedRole === "ELECTION_ADMIN"
          ? await contract.ELECTION_ADMIN_ROLE()
          : await contract.CANDIDATE_MANAGER_ROLE();

      const tx = await contract.grantRole(role,roleAddress);
      await tx.wait();

      alert("Role granted successfully.");
      window.location.reload();
    } catch(err) {
      console.error("Failed to grant role",err);
      alert("Transaction Failed.");
    }
  };

  const handleRevokeRole = async (roletype: "ELECTION_ADMIN" | "CANDIDATE_MANAGER", address: string) => {
    if(!provider) return;

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const role = 
        roletype === "ELECTION_ADMIN"
          ? await contract.ELECTION_ADMIN_ROLE()
          : await contract.CANDIDATE_MANAGER_ROLE();

      const tx = await contract.revokeRole(role, address);
      await tx.wait();

      alert("Role Revoked successfully.");
      window.location.reload();
    } catch(err) {
      console.error("Failed to grant role",err);
      alert("Transaction Failed.");
    }
  };

  //------------------Handler for revoking----------------

  const handleRevoke = async () => {
    if(!revokeAdmission.trim()) {
      alert("Admission number required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({admission: revokeAdmission})
      });

      const data = await res.json();
      alert(`Revoked voters: ${data.affected}`);
      setRevokeAdmission("");
    } catch (err) {
      console.error(err);
      alert("Failed to revoke voting rights");
    }
  }

  //------------------UI States------------------

  if(!provider){
    return (
      <p className="text-slate-400">
        Please connect your wallet to access the admin panel.
      </p>
    );
  }
  
  if(checkingAccess) {
    return (
      <p className="text-slate-400">
        Checking admin access...
      </p>
    );
  }

  if(!hasAccess) {
    return (
      <p className="text-red-500">
        Access denied. You do not have admin privileges.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Control Dashboard
      </h2>

      <ul className="text-xl font-semibold text-slate-300 space-y-5 mb-5">
        {isAdmin && <li>• ADMIN ROLE</li>}
        {isElectionAdmin && <li>• ELECTION ADMIN ROLE</li>}
        {isCandidateManager && <li>• CANDIDATE MANAGER ROLE</li>}
      </ul>

      {/* ---------Admin UI Section------------- */}

      {isAdmin && (
        <div className="mb-8 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-semibold mb-4">
            Create New Election
          </h3>

          <div className="space-y-3">
            <input 
              type="text"
              placeholder="Election Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm" 
            />

            <textarea 
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            />

            <input 
              type="text"
              placeholder="Minimum Admission (optional)"
              value={minAdmission}
              onChange={(e) => setMinAdmission(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm" 
            />

            <input 
              type="text"
              placeholder="Maximum Admission (optional)"
              value={maxAdmission}
              onChange={(e) => setMaxAdmission(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm" 
            />

            <button onClick={handleCreateElection} className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
              Create Election
            </button>
          </div>
        </div>
      )}

      {/* UI of Roles Granting and Revoking */}

      {isAdmin && (
        <div className="mb-8 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-semibold mb-4">
            Manage Roles
          </h3>

          {/* Grant Roles */}

          <div className="flex gap-2 mb-4">
            <input 
              type="text"
              placeholder="Wallet Address"
              value={roleAddress}
              onChange={(e) => setRoleAddress(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            />

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as "ELECTION_ADMIN" | "CANDIDATE_MANAGER")}
              className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            >
              <option value="ELECTION_ADMIN">Election Admin</option>
              <option value="CANDIDATE_MANAGER">Candidate Manager</option>
            </select>

            <button
                onClick={handleGrantRole}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Grant
            </button>
          </div>

          {/* Current Role Holders UI */}

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">Election Admins</p>
              {!electionAdmins.length && (
                <p className="text-slate-300">
                  This role is not granted to any address yet.
                </p>
              )}
              {electionAdmins.map(addr => (
                <div key={addr} className="flex justify-between items-center">
                  <span>{addr}</span>
                  <button onClick={() => handleRevokeRole("ELECTION_ADMIN", addr)} className="text-red-400 hover:underline">
                    Revoke
                  </button>
                </div>
              ))}
            </div>

            <div>
              <p className="font-medium mb-1">Candidate Managers</p>
              {!candidateManagers.length && (
                <p className="text-slate-300">
                  This role is not granted to any address yet.
                </p>
              )}
              {candidateManagers.map(addr => (
                <div key={addr} className="flex justify-between items-center">
                  <span>{addr}</span>
                  <button onClick={() => handleRevokeRole("CANDIDATE_MANAGER", addr)} className="text-red-400 hover:underline">
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* UI for revoking voting rights */}

      {isAdmin && (
        <div className="mt-6 border border-slate-700 p-4 rounded">
          <h3 className="font-semibold mb-2">
            Revoke Voting Rights
          </h3>

          <input
            type="text"
            placeholder="Admission Number"
            value={revokeAdmission}
            onChange={(e) => setRevokeAdmission(e.target.value)}
            className="px-3 py-2 mr-2 bg-slate-900 border border-slate-700 rounded text-sm"
          />

          <button
            onClick={handleRevoke}
            className="px-4 py-2 bg-red-900 border hover:bg-red-700 rounded text-sm"
          >
            Revoke
          </button>
        </div>
      )}

      {/* UI for Election lists */}
      <div className="space-y-6">
        {elections.map((e) => (
          <AdminElectionCard
            key={e.id}
            id={e.id}
            title={e.title}
            open={e.open}

            candidates={candidatesByElection[e.id] || []}

            isAdmin={isAdmin}
            isElectionAdmin={isElectionAdmin}
            isCandidateManager={isCandidateManager}

            candidateInput={candidateNames[e.id] || ""}
            onCandidateInputChange={(value) => 
              handleCandidateNameChange(e.id,value)
            }

            onAddCandidate={() => handleAddCandidate(e.id)}

            onOpenElection={() => handleOpenElection(e.id)}
            onCloseElection={() => handleCloseElection(e.id)}
          />
        ))}
      </div>
    </div>
  )
};

export default Admin;
