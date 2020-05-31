'use strict';

async function updateDocumentIntoDatabase(userName, documentType, documentId) {
    try {
        const mongo = require('mongodb').MongoClient;
        const url = 'mongodb://127.0.0.1:27017';
        let client;
        let userSchema = {
            userName: userName,
            documentType: documentType,
            documentId: documentId,
            publicId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        };
        client = await mongo.connect(url);
        client.db('SSI').collection(userName).insertOne(userSchema);
        console.log("the public key is successfully stored " + userSchema.publicId);
        await client.close();
        return userSchema.publicId;
    } catch (e) {
        console.log(e);
    }
}

async function removeDocumentFromDatabase(userName, documentType, documentId) {
    try {
        const mongo = require('mongodb').MongoClient;
        const url = 'mongodb://127.0.0.1:27017';
        let client;
        let userSchema = {
            userName: userName,
            documentType: documentType,
            publicId: documentId
        };
        client = await mongo.connect(url);
        await client.db('SSI').collection(userName).deleteOne(userSchema);
        console.log('removed the Document due to unsuccessful generation of EHR');
        await client.close();
    } catch (e) {
        console.log(e);
    }
}

async function verifyFileExistenceAndHash(documentId, hashValue, documentType, collectionName) {
    try {
        const mongoose = require('mongoose');
        let Grid = require('gridfs-stream');
        const mongoURI = `mongodb://127.0.0.1:27017/SSI`;
        const conn = mongoose.createConnection(mongoURI);
        let gfs;

        await conn.once('open', () => {
            // Init stream
            gfs = Grid(conn.db, mongoose.mongo);
            gfs.collection(collectionName);
        });
        let documentSchema = {
            filename: documentId,
            md5: hashValue,
            metadata: {
                documentType: documentType
            }
        };
        console.log(documentSchema);
        let file = await gfs.files.findOne(documentSchema);
        conn.close();
        console.log(file);
        return !(!file || file.length === 0);
    } catch (e) {
        console.log(e);
    }

}

async function getFileDetailsAndDocumentId(userName, publicId, documentType) {
    try {
        const mongo = require('mongodb').MongoClient;
        const url = 'mongodb://127.0.0.1:27017';
        let client;
        let userSchema = {
            userName: userName,
            documentType: documentType,
            publicId: publicId,
        };
        console.log(userSchema);
        client = await mongo.connect(url);
        let result = await client.db('SSI').collection(userName).findOne(userSchema);
        console.log(result);
        let documentId = '';
        if (result && result.userName) {
            documentId = result.documentId;
        }
        await client.close();
        return documentId;
    } catch (e) {
        console.log(e);
    }
}

async function registerNewUser(id, name, type) {
    try {
        const mongo = require('mongodb').MongoClient;
        const url = 'mongodb://127.0.0.1:27017';
        let client;
        let userSchema = {
            userId: id,
            type: type,
            name: name,
        };
        console.log(userSchema);
        client = await mongo.connect(url);
        let result = await client.db('EHR').collection('registeredUserList').insertOne(userSchema);
        await client.close();
        return result;
    } catch (e) {
        console.log(e);
    }
}

async function fetchUsersByType(type) {
    try {
        const mongo = require('mongodb').MongoClient;
        const url = 'mongodb://127.0.0.1:27017';
        let client;
        let userSchema = {
            type: type,
        };
        console.log(userSchema);
        client = await mongo.connect(url);
        let result = await client.db('SSI').collection('registeredUserList').find(userSchema).toArray();
        console.log(result);
        await client.close();
        return result;
    } catch (e) {
        console.log(e);
    }
}

async function fetchUserByUserName(userName) {
    try {
        const mongo = require('mongodb').MongoClient;
        const url = 'mongodb://127.0.0.1:27017';
        let client;
        let userSchema = {
            userId: userName,
        };
        console.log(userSchema);
        client = await mongo.connect(url);
        let result = await client.db('SSI').collection('registeredUserList').findOne(userSchema);
        console.log(result);
        await client.close();
        return result;
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    updateDocumentIntoDatabase,
    removeDocumentFromDatabase,
    verifyFileExistenceAndHash,
    getFileDetailsAndDocumentId,
    fetchUsersByType,
    fetchUserByUserName,
    registerNewUser
};