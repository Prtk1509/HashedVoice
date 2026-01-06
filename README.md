# **🛅HashedVoice**


**HashedVoice** is a decentralised voting application that combines **on-chain immutability** with **off-chain identity management** to deliver a secure, transparent and practical voting system.

>"**Hashed**" reflects irreversible encoding on the block chain.\
>"**Voice**" symbolizes individual expression.\
>Together, HashedVoice captures opinions transformes into immutable, verifiable records.

This Project demonstrate how blockchain can be used for **tamper-proof voting**, while still handling real-world constraints like identity, eligibilty, and administration.

---

### 📌**Problem Statement**

Traditional voting system suffer from multiple issues:
- Centralised Control → single point of failure
- Lack of transparency → difficult to audit
- Identity & privacy conflicts
- Difficulty enforcing one person, one vote
- Administrative manipulation risks

Pure on-chain voting, on the other hand, introduces new problems:
- Storing personal data on-chain is expensive and unsafe
- Eligibility rules (admission numbers, etc.) are hard to manage purely on-chain

### 🎯 Goal of HashedVoice

To design a **Hybrid Web3 voting system** that:
- Guarantees **one vote per wallet**
- Makes votes **immutable and verifiable**
- Keeps **identity off-chain** for privacy
- Supports **real-world eligibility rules**
- Allows **role-based administration**
- Is reproducible on a local bockchain for demos and evaluation

---

## 🧠 **High-Level Architecture**

<!-- Could've used mermaid too, but VS Code does't preview it, so it would've become strictly confined to GitHub -->
```

┌────────────────────┐
│   React Frontend   │
│ (Voting Interface) │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  Backend (Node.js) │
│  Express + MongoDB │
│ (Identity, Control)│
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Ethereum Blockchain│
│  (Hardhat Local)   │
│  Solidity Contract │
└────────────────────┘
```

---

## **✨Features**

### 🔐 Smart Contract (Solidity)

- Multiple elections
- Candidate registry per election
- One vote per address (enforced on-chain)
- Admin-controlled election lifecycle (open / close)
- Admission number range validation
- Role-based access control:
    - ADMIN_ROLE
    - ELECTION_ADMIN_ROLE
    - CANDIDATE_MANAGER_ROLE
- Live vote visibility for admins
- Public results after election closure

---

### 🧑‍💻 Frontend (React)

- MetaMask wallet connection
- Election listing (open / closed)
- Voting interface
- Result viewing (public)
- Registration page for voters
- Admin dashboard:
    - Create elections
    - Add candidates
    - Open / close elections
    - Revoke voting rights by admission number
    - Monitor voting
- Transaction hash display of voting for auditability
- Clear UX messages for:
    - Not registered
    - Revoked voters
    - Already voted
    - Election closed

---

### 🗄️ Backend (Node + MongoDB)

- Off-chain voter registration
- Stores:
    - Wallet address
    - Name
    - Admission number
    - Revocation status
- Admission-based voting revocation
- REST API for frontend coordination
- Keeps sensitive data off-chain

---

### 🧪 Security & Design Principles

- Defense in depth
    - Frontend improves UX
    - Backend manages eligibility
    - Contract enforces final authority
- No trust in UI alone
- No personal data on-chain
- Reverts protect against bypassing frontend/backend
- Admin powers are explicit and role-restricted

---

### ⚙️ Tech Stack

#### **Blockchain**
- **Solidity**
- **Hardhat** (local development chain)
- **ethers.js**
- **Chai** (contract testing)

#### **Frontend**
- **React (Vite)**
- **TypeScript**
- **Tailwind CSS**
- **ethers.js**
- **MetaMask**

#### *Backend*
- **Node.js**
- **Express**
- **MongoDB**
- **Mongoose**
- **dotenv**
- **CORS**

---

## 📂 Project Structure

```
HashedVoice/
├── contracts/
│ └── HashedVoice.sol # Solidity smart contract
│
├── scripts/
│ ├── deploy.ts # Contract deployment script
│ └── createElection.ts # Sample election setup script
| └── demo.ts # Sample demo for contract 
| └── grantRoles.ts # Sample roles grant  script
│
├── test/
│ └── HashedVoice.test.ts # Smart contract unit tests
│
├── backend/
│ ├── src/
│ │ ├── index.ts # Backend entry point
│ │ ├── db.ts # MongoDB connection
│ │ ├── models/
│ │ │ └── Voter.ts # Voter schema (off-chain identity)
│ │ └── routes/
│ │   ├── voter.ts # Voter registration & lookup APIs
│ │   └── admin.ts # Admin actions (revocation)
│ │
│ └──.env # Environment variables (Not present in the repo)
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ │ ├── Home.tsx # Election listing
│ │ │ ├── Election.tsx # Voting & results page
│ │ │ ├── Register.tsx # Voter registration
│ │ │ ├── Admin.tsx # Admin dashboard
│ │ │ └── Results.tsx # Closed elections
│ │ │
│ │ ├── components/
│ │ │ ├── election/
│ │ │ │  ├── ElectionCard.tsx
│ │ │ │  └── CandidateCard.tsx
│ │ │ ├── admin/
│ │ │ │  └── AdminElectionCard.tsx #Election Card in Admin Dashboard
│ │ │ └── common/
│ │ │    ├── Layout.tsx 
│ │ │    └── Navbar.tsx #Navigation Bar
│ │ │
│ │ ├── hooks/
│ │ │ ├── useWallet.ts # MetaMask connection logic
│ │ │ ├── useElections.ts
│ │ │ ├── useContract.ts
│ │ │ └── useCandidates.ts
│ │ │
│ │ ├── types/
│ │ │ └── ethereum.d.ts
│ │ │
│ │ ├── blockchain/
│ │ │ ├── abi.ts # Contract ABI
│ │ │ ├── contract.ts # Contract
│ │ │ └── address.ts # Deployed contract address
│ │ │
│ │ ├── App.tsx # Route configuration
│ │ ├── App.css
│ │ ├── index.css
│ │ └── main.tsx # Frontend entry point
│ │
│ ├── vite.config.ts #Vite configuration
│ └── package.json
│
├── hardhat.config.ts # Hardhat configuration
├── README.md # Project documentation
└── package.json
```

---

## 🚀 **Setup & Installation**

### 1️⃣ Prerequisites
- **Node.js** (v18+ recommended)
- **MetaMask** Browser extension
- **MongoDB** Atlas Account
- **Git**

### 2️⃣ Clone Repository
```bash
git clone https://github.com/Prtk1509/HashedVoice.git
cd HashedVoice
```


### 3️⃣ Install Dependencies

### 4️⃣ Start Local Blockchain
```bash
npx hardhat node
```


### 5️⃣ Deploy Contract
```bash
npx hardhat run scripts/deploy.ts --network localhost
```


Copy the deployed contract address into 

```frontend/src/blockchain/address.ts```


### 6️⃣ Backend Environment Setup
Create ```backend/.env```
```Env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Run backend
```bash
cd backend
npx ts-node src/index.ts
```

### 7️⃣ Run Frontend
```bash
cd frontend
npm run dev
```


---
## 📖 Usage Guide

### 👤 Voter flow
1. Connect Wallet
2. Register with name + admission number
3. Navigate to an open election
4. Vote (only once)
5. View transaction hash
6. View results after election closes

## 🛠️ Admin flow
1. Connect Admin Wallet
2. Create Elections
3. Grant Roles
4. Revoke voting rights (if neede)
5. Add candidates (before opening)
6. Open elections
7. View live votes (admin-only) 
8. View results after election closes

---

## ⚠️ Development Notes
- Local Hardhat blockchain **does not persist state**
- After restarting Hardhat
    - Redeploy contract
    - Update contract address
    - Recreate elections
- Some UI Reloads are intentional for safety
- Wallet switching requires **manual refresh** (by design)

## 🗒️ Limitation & Future Works
- Persistent blockchain deployment
- Improvement in UX
- Admission number is merely an eligibility tag
- Fully reactive wallet switching without reload
- Advanced audit log UI
- Role management UI enhancements

---

## **👥 Credits & Attributions**

### **Libraries & Frameworks**
- **OpenZeppelin Contracts**\
AccessControl, security patterns\
https://openzeppelin.com/contracts/
- **Hardhat**\
Ethereum development environment\
https://hardhat.org/
- **ethers.js**\
Ethereum interaction library\
https://docs.ethers.org/
- **React**\
Frontend framework\
https://react.dev/
- **Tailwind CSS**\
Utility-first CSS framework\
https://tailwindcss.com/
- **MongoDB & Mongoose**\
Off-chain data storage\
https://www.mongodb.com/

---

## **📜 License**
This project is intended for **educational** and **demonstration purposes**.\
You may reuse and modify it with proper attribution.

---

**GitHub repository For HashedVoice - a project for Recruitathon 2.0 by WebCSE.**