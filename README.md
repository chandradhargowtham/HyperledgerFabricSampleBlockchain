# HyperledgerFabricSampleBlockchain

Sample Hyperledger Faric blockchain application with Node JS public APIs to add and fetch.

The folder blockchain contains the fabric blockchain network built upon the fabric-samples.
To start the network, go to the network folder and :
./network.sh up -ca -s couchdb
or just ./network.sh up

other commands: 

./network.sh createChannel or ./network.sh createChannel {channelName}

./network.sh deployCC -ccn basic -ccp ../chaincode-go -ccl go

Add the following PATh variables:

// To identify the peer command:
export PATH=${PWD}/../bin:$PATH

// fabric config path:
export FABRIC_CFG_PATH=$PWD/../config/

//org definitions and specifications:
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

Chaincode invoke: 

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'

// Get All Assets :
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}'

Using the Node API:
In the folder blockchainApp, run the blockchainApp.js using the command :
node blockchainApp.js

The active port would be 8080.
The APIs can be called via a website/Insomnia/Postman at the addresses:

Get all assets: 
http://localhost:8080/get -Method = GET  - output would be a JSON string

Invoke/Add a new Asset:
http://localhost:8080/add/{value} - Method + POST - dummy value with user-defined id will be added to 
blockchain. You can add other parameters also. Catch and send the new parameters in the blockchainApp.js file.

Note: The parameters will have to be caught at the add POST API method and can be sent as arguments to the invoke function. Inside the invoke function, replace the dummy values with these args. The API format would be:

http://localhost:8080/add/{value1}/{value2}/{value3}
