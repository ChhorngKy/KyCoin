const {Blockchain , Transaction } = require("./BlockChain.js")
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('06b9a347c16242c2296c2b0530f552d008e6d66511415d1e4c0002e58db0c9cd')
const myWalletAddress = myKey.getPublic('hex');

let KyCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, "My Public", 100);
tx1.signTransaction(myKey);
KyCoin.createTransaction(tx1);

console.log("\nStaring Miner...");
KyCoin.minePendingTransactions(myWalletAddress);

console.log('Balance of Chhorng Ky', KyCoin.getBalanceOfAddress(myWalletAddress))

KyCoin.chain[1].previousHash = "asdfsdf";

console.log("Is coin Valid: " + KyCoin.isChainValid().toString());
