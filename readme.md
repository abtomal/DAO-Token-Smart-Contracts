# DAOMetra Project

## Advanced Solidity Smart Contract Project by Alessandro Ponton

**DAOMetra** is an implementation of a DAO (Decentralized Autonomous Organization) on the Ethereum blockchain.

The project consists of two main smart contracts:

1. **DAOMetraToken.sol**: An ERC20 token representing the DAO's tokens.
2. **DAOMetra.sol**: The main DAO contract managing governance.

---

## Technical Features

### DAOMetraToken

- Implements the ERC20 standard for maximum compatibility.
- **Token Name**: "Demtoken".
- **Symbol**: "DMTK".
- **Decimals**: 18 (ERC20 standard).
- Administration system controlled by the DAO.
- Protections against zero addresses and overflow/underflow.
- Events to track transfers and administrative changes.

### DAOMetra

- Share-based voting system.
- Fixed price of 110 tokens per share.
- Voting period of 1 week.
- 24-hour timelock for proposal execution.
- 51% quorum for proposal approval.
- Supports voting, abstaining, and voting against proposals.

---

## Key Features

### Token Management

- Purchase shares in exchange for tokens.
- Secure transfers with balance checks.
- Approval system for delegated spending.

### Governance System

- Proposal creation by members.
- Weighted voting based on shares held.
- Timelock for added security.
- Quorum system for significant decisions.

### Security and Implemented Controls

- Balance checks before transfers.
- Zero address checks.
- Timelock to prevent flash loan attacks.
- Role-based permission system.

### Administrative Rights

- Initial administration assigned to the deployer.
- Administration transferred to the DAO.
- Access controls for critical functions.

---

## Versions and Compatibility

- **Solidity**: v0.8.20.
- **EVM Version**: Paris.
- **Optimization**: Enabled (200 runs).

---

## Deployment

The contracts have been deployed on the Sepolia testnet:

- **DAOMetraToken**: [0x8017b00a1217EcbA1998f62f948379FDe187D0A2](https://sepolia.etherscan.io/address/0x8017b00a1217EcbA1998f62f948379FDe187D0A2#code).
- **DAOMetra**: [0xBBcFf03a5dE9987dE141AAD29b8b9E89e2e1Cb28](https://sepolia.etherscan.io/address/0xBBcFf03a5dE9987dE141AAD29b8b9E89e2e1Cb28#code).

---

## Testing

The project includes a comprehensive test suite covering:

- Contract initialization.
- Share purchase.
- Proposal creation and management.
- Voting system.
- Timelock functionality.

---

## Share System

- Shares represent voting power in the DAO.
- Fixed price ensures fairness in purchases.
- Non-transferable to maintain governance stability.

---

## Timelock

The 24-hour timelock implementation:

- Protects against rapid attacks.
- Allows members to react to suspicious proposals.
- Adds a layer of security to governance.

---

## Security Notes

- Events implemented to track all critical actions.
- Voting system protected against manipulation.
- Timelock safeguards against flash loan attacks.
