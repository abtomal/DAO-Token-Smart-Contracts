// SPDX-License-Identifier: MIT
// https://sepolia.etherscan.io/address/0x8017b00a1217EcbA1998f62f948379FDe187D0A2#code

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DAOMetraToken is IERC20 {
    // Variabili di stato del token
    string public name = "Demtoken";
    string public symbol = "DMTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Variabile admin per la gestione del contratto
    address public admin;

    // Dichiariamo l'evento per il cambio di admin
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);

    // Modifier per limitare l'accesso a certe funzioni solo all'admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor(uint256 _initialSupply) {
        // Impostiamo msg.sender come admin iniziale e assegniamo i token
        admin = msg.sender;
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }

    function transfer(address to, uint256 value) external override returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        require(to != address(0), "Cannot transfer to zero address");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external override returns (bool) {
        require(spender != address(0), "Cannot approve zero address");
        
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external override returns (bool) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        require(to != address(0), "Cannot transfer to zero address");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 amount) external onlyAdmin {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external onlyAdmin {
        require(from != address(0), "Cannot burn from zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf[from] >= amount, "Burn amount exceeds balance");
        
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function setDAOAsAdmin(address daoAddress) external onlyAdmin {
        require(daoAddress != address(0), "Cannot set zero address as admin");
        address oldAdmin = admin;
        admin = daoAddress;
        emit AdminChanged(oldAdmin, daoAddress);
    }
}