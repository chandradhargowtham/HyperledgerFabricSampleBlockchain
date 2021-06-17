// Fabric Specific Variables
const FabricCAServices = require('fabric-ca-client');
const { Wallets, Gateway } = require('fabric-network');

// File System and Wallet Save Variables 
const fs= require('fs');
const path = require('path');

// API required Variables
var express = require('express');
const { Console } = require('console');
var app = express(); // init 

// Saved Variables for API calls
var allAssets;
var getId;

//#region blockchain methods

async function enrollAdmin()
{
    
    try{
        // load the network config
        const ccpPath = path.resolve(__dirname,'..','blockchain','network','organizations','peerOrganizations','org1.example.com','connection-org1.json');
        ccp = JSON.parse(fs.readFileSync(ccpPath,'utf-8'));


        // create the CA client for interacting with the CA
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url,{ trustedRoots: caTLSCACerts, verify: false}, caInfo.caName);
        
        // Wallet file system to manage identities
        const walletPath = path.join(process.cwd(),'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        // enroll admin user and import the new identity into the wallet
        const enrollment = await ca.enroll({enrollmentID:'admin',enrollmentSecret:'adminpw'});
        const x509Identity = {
            credentials:{
                certificate:enrollment.certificate,
                privateKey:enrollment.key.toBytes()
            },
            mspId:'Org1MSP',
            type: 'X.509'
        };

        await wallet.put('admin',x509Identity);
        console.log('CA Config Done');

    } catch(error)
    {
        console.log("Enroll Admin error"+error);
        //process.exit(1);
        //registerUser();
    } finally{
        //registerUser();
    }
}

async function registerUser()
{
    
    try{
        // load the network config
        const ccpPath = path.resolve(__dirname,'..','blockchain','network','organizations','peerOrganizations','org1.example.com','connection-org1.json');
        ccp = JSON.parse(fs.readFileSync(ccpPath,'utf-8'));
        
        // create the CA client for interacting with the CA
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const ca = new FabricCAServices(caInfo.url);
        
        // create a new wallet
        const walletPath = path.join(process.cwd(),'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        // build the admin object for CA
        const adminIdentity = await wallet.get('admin');
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity,'admin');
        
        // register, enroll and import the identity
        const secret = await ca.register({affiliation:'org1.department1',enrollmentID: 'appUser2', role: 'client'}, adminUser);
        const enrollment = await ca.enroll({enrollmentID:'appUser2',enrollmentSecret:secret});
        const x509Identity = {credentials: {certificate : enrollment.certificate, privateKey:enrollment.key.toBytes()},mspId:'Org1MSP',type:'X.509'};

        await wallet.put('appUser2',x509Identity);
        console.log('User Registration Successful');
    } catch(error)
    {
        console.log("Register User error"+error);
        //process.exit(1);
        //invoke();
    } finally {
        //invoke();
    }
}

async function invoke(getId)
{
    console.log("Invoke Started");
    
    try{
        // load the network config
        const ccpPath = path.resolve(__dirname,'..','blockchain','network','organizations','peerOrganizations','org1.example.com','connection-org1.json');
        ccp = JSON.parse(fs.readFileSync(ccpPath,'utf-8'));
        
    
        // create a new wallet
        const walletPath = path.join(process.cwd(),'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // create gateway
        var gateway1 = new Gateway();
        await gateway1.connect(ccp, {wallet, identity:'appUser2',discovery:{enabled:true,asLocalhost:true}});

        // create network object
        const network = await gateway1.getNetwork('mychannel');

        // create contract object
        const contract = network.getContract('basic');

        // invoke
        console.log(getId.toString() + "is the val");
        await contract.submitTransaction('createAsset',getId.toString(),'red78','777','chnan','7');

        // disconnect from gateway
        await gateway1.disconnect();
        
        console.log('Invoke success');
    } catch(error)
    {
        console.log("Invoke error "+error);
        //process.exit(1);
    } finally {
        //query();
    }
}

 async function query()
{
    
    try{
        // load the network config
        const ccpPath = path.resolve(__dirname,'..','blockchain','network','organizations','peerOrganizations','org1.example.com','connection-org1.json');
        ccp = JSON.parse(fs.readFileSync(ccpPath,'utf-8'));
        
    
        // create a new wallet
        const walletPath = path.join(process.cwd(),'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // create gateway
        var gateway = new Gateway();
        await gateway.connect(ccp, {wallet, identity:'appUser2',discovery:{enabled:true,asLocalhost:true}});

        // create network object
        const network = await gateway.getNetwork('mychannel');

        // create contract object
        const contract = network.getContract('basic');

        // query
        const result = await contract.evaluateTransaction('GetAllAssets');
        //console.log("Result : "+result.toString());

        // disconnect from gateway
        await gateway.disconnect();
        
        console.log('success');
        allAssets=result;
        return await result.toString();
        
        

        //process.exit(1);
    } catch(error)
    {
        console.log("Query error"+error);
        process.exit(1);
    }
}
//#endregion

//#region API Methods

app.listen(8080);
app.get('/get',function(request,response){
    var results="ABC";
    results = query();
    setTimeout(function () {
        console.log(allAssets.toString());
        //var op=JSON.stringify(allAssets.toString());
        response.status(200).send({ 
    'result':allAssets.toString()
})    
      }, 1000)
    
});

app.post('/add/:id',function(request,response){
    const { id } = request.params;
    getId = id.toString();
    //console.log(getId);
    allAssets=invoke(getId);
    response.status(200).send({ 
        "result":"Done"
    })
    }); 
//#endregion

  

// Runtime function calls (if any): 
//enrollAdmin();
//registerUser();
//invoke();
//query();