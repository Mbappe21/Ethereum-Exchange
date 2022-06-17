const express = require('express');
const app = express();
const cors = require('cors');
const port = 3045;
const secp = require('@noble/secp256k1');


app.use(cors());
app.use(express.json());

let privateKey1 = secp.utils.randomPrivateKey();
let privateKey2 = secp.utils.randomPrivateKey();
let privateKey3 = secp.utils.randomPrivateKey();

privateKey1 = Buffer.from(privateKey1).toString('hex');
privateKey2 = Buffer.from(privateKey2).toString('hex');
privateKey3 = Buffer.from(privateKey3).toString('hex');

let publicKey1 = secp.getPublicKey(privateKey1);
let publicKey2 = secp.getPublicKey(privateKey2);
let publicKey3 = secp.getPublicKey(privateKey3);

publicKey1 = Buffer.from(publicKey1).toString('hex');
publicKey2 = Buffer.from(publicKey2).toString('hex');
publicKey3 = Buffer.from(publicKey3).toString('hex');

publicKey1= "0x" + publicKey1.slice(publicKey1.length -40);
publicKey2= "0x" + publicKey2.slice(publicKey2.length -40);
publicKey3= "0x" + publicKey3.slice(publicKey3.length -40);




const balances = {
  [publicKey1]: 100,
  [publicKey2]: 200,
  [publicKey3]: 300,
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {recipient, amount, privateKey} = req.body;

const message = JSON.stringify({
    to: recipient,
    amount: parseInt(amount)
  });


(async () => {
const messageHash = await secp.utils.sha256(message);

const sign= await secp.sign(messageHash, privateKey, { recovered: true});

let signature = sign[0];
let bit= sign[1];

signature = Buffer.from(signature).toString('hex');


let ogRecoveredPublicKey;

let recoveredPublicKey;

if(bit ===0){
  ogRecoveredPublicKey = secp.recoverPublicKey(messageHash, signature, 0);
}else if(bit ===1){
  ogRecoveredPublicKey=secp.recoverPublicKey(messageHash, signature, 1)
};

if(bit===0 || bit===1){
recoveredPublicKey=Buffer.from(ogRecoveredPublicKey).toString('hex');
recoveredPublicKey="0x" + recoveredPublicKey.slice(recoveredPublicKey.length - 40);

console.log("Requested transaction from " + recoveredPublicKey +" of "+ amount+" ETH ");
console.log(" to " +recipient );
console.log(" ");
}





if(balances[recoveredPublicKey] && secp.verify(signature, messageHash, ogRecoveredPublicKey) &&amount<=balances[recoveredPublicKey]){
  balances[recoveredPublicKey] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[recoveredPublicKey] })
    console.log(" ");
    console.log("Successful transaction!");
      console.log(" ");
  logBalances();
  return;
}else if(amount>balances[recoveredPublicKey]){
    console.log(" ");
  console.error("Get more ETH!")
    console.log(" ");
  logBalances();
  return;
}else if(!secp.verify(signature, messageHash, recoveredPublicKey)){
    console.log(" ");
  console.error("Wrong Private Key;"+" Verification is "+ secp.verify(signature, messageHash, recoveredPublicKey) )
    console.log(" ");
  logBalances();
  return;
}else if(!balances[recoveredPublicKey]){
    console.log(" ");
    console.error("wrong key")
    console.log(" ");
    logBalances();
    return;
}
}) ()

});


function logBalances() {
console.log("                 ");
console.log("Available Accounts");
console.log("==================");
console.log("(1) "+publicKey1+" ("+Object.values(balances)[0]+" ETH)");
console.log("(2) "+publicKey2+" ("+Object.values(balances)[1]+" ETH)");
console.log("(3) "+publicKey3+" ("+Object.values(balances)[2]+" ETH)");
console.log("                 ");

}
app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log("Available Accounts");
  console.log("==================");
  console.log("(1) "+publicKey1+" ("+Object.values(balances)[0]+" ETH)");
  console.log("(2) "+publicKey2+" ("+Object.values(balances)[1]+" ETH)");
  console.log("(3) "+publicKey3+" ("+Object.values(balances)[2]+" ETH)");
  console.log("                 ");
  console.log("Private Keys");
  console.log("==================");
  console.log("(1) "+privateKey1);
  console.log("(2) "+privateKey2);
  console.log("(3) "+privateKey3);
});
