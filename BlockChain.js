const SHA256 = require('crypto-js/sha256');
const mysql = require('mysql2');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


// Database connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ChgKyDirt',
    database: 'KyCoin'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
});

function saveBlock(block) {
    const { timestamp, transactions, previousHash, hash } = block;
    const sql = 'INSERT INTO blocks (timestamp, transactions, previousHash, hash) VALUES (?, ?, ?, ?)';
    db.query(sql, [timestamp, JSON.stringify(transactions), previousHash, hash], (err, result) => {
        if (err) throw err;
    });
}


// Monin
class Block {
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp,
        this.transactions = transactions,
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        
        console.log("Block mined: " + this.hash);
        saveBlock(this);
    }

    
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress,
        this.toAddress = toAddress,
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Blockchain {
    constructor () {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = []
        this.miningReward = 500;
    }

    createGenesisBlock(){
        return new Block("01/01/2017", "Genesis Block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1]
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
        block.mineBlock(this.difficulty)

        console.log("Successfully mine: ");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error("Transaction must include from and to address");
        }

        if(!transaction.isValid()){
            throw new Error("Cannot addd invalid transaction to the chain");
        }
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress == address){
                    balance += trans.amount;
                }
            }
        }

        return balance
    }

    isChainValid(){
        for (let i = 1; i < this.chain.length; i++){
            let currentBlock = this.chain[i]
            let previousBlock= this.chain[i - 1]
            if(!currentBlock.hasValidTransactions()){
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
