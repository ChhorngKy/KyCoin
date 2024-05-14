const {Blockchain , Transaction } = require("./BlockChain.js")
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const myKey = ec.keyFromPrivate('2ad3f5260d67e9ce0dca805a61d87707523cd301359327dbb86386dafc5a38d9')
const myWalletAddress = myKey.getPublic('hex');

let KyCoin = new Blockchain();

console.log("\nStaring Miner...");
KyCoin.minePendingTransactions(myWalletAddress);

const tx1 = new Transaction(myWalletAddress, "Public Key", 10);
tx1.signTransaction(myKey); // Sign the transaction first
KyCoin.createTransaction(tx1); // Then add it to the pending transactions

const tx2 = new Transaction(myWalletAddress, "Public Key", 200);
tx2.signTransaction(myKey); // Sign the transaction first
KyCoin.createTransaction(tx2); 

console.log('\nBalance of ChhorngKy', KyCoin.getBalanceOfAddress(myWalletAddress))

console.log(KyCoin)
// Check valid
// console.log(KyCoin.chain[1])
// KyCoin.chain[1] = "asdf";
// console.log(KyCoin.chain[1])

console.log("Is coin Valid: " + KyCoin.isChainValid().toString());


