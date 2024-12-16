# DAOMetra Project

## Progetto Smart Contract con Solidity Advanced di Alessandro Ponton

**DAOMetra** è un'implementazione di una DAO (Decentralized Autonomous Organization) sulla blockchain Ethereum.

Il progetto consiste in due smart contract principali:

1. **DAOMetraToken.sol**: Un token ERC20 che rappresenta i token della DAO.
2. **DAOMetra.sol**: Il contratto principale della DAO che gestisce la governance.

---

## Caratteristiche Tecniche

### DAOMetraToken

- Implementa lo standard ERC20 per la massima compatibilità.
- **Nome Token**: "Demtoken".
- **Simbolo**: "DMTK".
- **Decimali**: 18 (standard ERC20).
- Sistema di amministrazione con controllo della DAO.
- Protezioni contro indirizzi zero e overflow/underflow.
- Eventi per tracciare trasferimenti e cambi di amministrazione.

### DAOMetra

- Sistema di shares per il voto.
- Prezzo fisso di 110 token per share.
- Periodo di votazione di 1 settimana.
- Sistema di timelock di 24 ore per l'esecuzione delle proposte.
- Quorum del 51% per l'approvazione delle proposte.
- Supporto per il voto, l'astensione e il voto contrario.

---

## Funzionalità Principali

### Gestione Token

- Acquisto shares in cambio di token.
- Trasferimenti sicuri con controlli di saldo.
- Sistema di approvazioni per spese delegate.

### Sistema di Governance

- Creazione di proposte da parte dei membri.
- Votazione pesata in base alle shares possedute.
- Timelock per sicurezza aggiuntiva.
- Sistema di quorum per decisioni significative.

### Sicurezza e Controlli Implementati

- Verifiche dei saldi prima dei trasferimenti.
- Controlli sugli indirizzi zero.
- Timelock per prevenire attacchi flash loan.
- Sistema di permessi basato su ruoli.

### Diritti di Amministrazione

- Amministrazione iniziale al deployer.
- Trasferimento dell'amministrazione alla DAO.
- Controlli di accesso per funzioni critiche.

---

## Versioni e Compatibilità

- **Solidity**: v0.8.20.
- **EVM Version**: Paris.
- **Ottimizzazione**: Abilitata (200 runs).

---

## Deployment

I contratti sono stati deployati sulla testnet Sepolia:

- **DAOMetraToken**: [0x7bE6F4a5f8aEa8082Ad548c19E51d3F03834d0d1](https://sepolia.etherscan.io/address/0x7bE6F4a5f8aEa8082Ad548c19E51d3F03834d0d1#code).
- **DAOMetra**: [0x9247C769a73BCe6878a529d92FCf847d5933a775](https://sepolia.etherscan.io/address/0x9247C769a73BCe6878a529d92FCf847d5933a775#code).

---

## Testing

Il progetto include una suite completa di test che copre:

- Inizializzazione dei contratti.
- Acquisto di shares.
- Creazione e gestione delle proposte.
- Sistema di voto.
- Funzionalità di timelock.

---

## Sistema di Shares

- Le shares rappresentano il potere di voto nella DAO.
- Prezzo fisso per garantire equità nell'acquisto.
- Non trasferibili per mantenere stabilità nella governance.

---

## Timelock

L'implementazione del timelock di 24 ore:

- Protegge da attacchi veloci.
- Permette ai membri di reagire a proposte sospette.
- Aggiunge un livello di sicurezza alla governance.

---

## Note sulla Sicurezza

- Sono stati implementati eventi per tracciare tutte le azioni importanti.
- Il sistema di voting è protetto da manipolazioni.
- Il timelock protegge da attacchi flash loan.

