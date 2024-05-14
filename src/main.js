const {Blockchain , Transaction } = require("./BlockChain.js")
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('6d4d6cff92d6d9d9d0bf1cf601289f55d2cf9dd2485a7aeb2b7f649e0296e686')
const myWalletAddress = myKey.getPublic('hex');

let KyCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, "My Public", 100);
tx1.signTransaction(myKey);
KyCoin.createTransaction(tx1);

// console.log("\nStaring Miner...");
// KyCoin.minePendingTransactions(myWalletAddress);
// console.log('Balance of Chhorng Ky', KyCoin.getBalanceOfAddress(myWalletAddress))

console.log('\nBalance of Chhorng Ky', KyCoin.getBalanceOfAddress(myWalletAddress))

// // KyCoin.chain[1].previousHash = "asdf";

console.log("Is coin Valid: " + KyCoin.isChainValid().toString());


