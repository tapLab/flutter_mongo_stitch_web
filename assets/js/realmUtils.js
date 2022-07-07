'use strict';

var mongoClient;
var realmAppClient;

function uint8ArrayToHex(uint8Array) {
    return Array.prototype.map.call(new Uint8Array(uint8Array.buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}


function Mongo() {
    Mongo.prototype.connectMongo  = function(appId) {
        realmAppClient = new Realm.App({ id: appId });
        console.log('flutterMongoRealmWeb -> connectMongo with appId: ' + appId + ', currentUser: ',realmAppClient.currentUser);

        this.sendAuthListenerEvent(null);
    }


    // mongoDB document methods

    Mongo.prototype.getCollection = function(databaseName, collectionName){
       return mongoClient.db(databaseName).collection(collectionName)
    }


    Mongo.prototype.insertDocument = async function(databaseName, collectionName, docString){
        var collection = this.getCollection(databaseName, collectionName);
        var doc = JSON.parse(docString);

        var doc = await collection.insertOne(doc);
        var id = uint8ArrayToHex(doc['insertedId']['id']);
        console.log(id);
        return new Promise((resolve, reject) => {
            resolve(id);
        });
    };


    Mongo.prototype.insertDocuments = async function(databaseName, collectionName, list){
        var collection = this.getCollection(databaseName, collectionName)

        var docs = [];
        list.forEach((str) => {
            docs.push(JSON.parse(str))
        });

        var result = await collection.insertMany(docs);
        var ids = result['insertedIds'];
        console.log(ids);

        var map = {};
        var keys = Object.keys(ids);

        for(var i=0; i<keys.length; i++){
            map[`${keys[i]}`] = uint8ArrayToHex(ids[keys[i]]['id'])
        }

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(map));
        });
    };

    Mongo.prototype.findDocument = async function (databaseName, collectionName, filter) {
        var collection = this.getCollection(databaseName, collectionName)
        var query = JSON.parse(filter);

        var doc = await collection.findOne(query, {})

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(doc));
        });
    }

    Mongo.prototype.findDocuments = async function (databaseName, collectionName, filter) {
        var collection = this.getCollection(databaseName, collectionName)
        var query = JSON.parse(filter);

        var results = await collection.find(query, {}).toArray()

        var strings = [];
        results.forEach((doc) => {
            strings.push(JSON.stringify(doc))
        })

        return new Promise((resolve, reject) => {
            resolve(strings);
        });
    }

    Mongo.prototype.deleteDocument = async function(databaseName, collectionName, filter){
        var collection = this.getCollection(databaseName, collectionName)
        var query = JSON.parse(filter)

        var result = await collection.deleteOne(query)

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(result));
        });
    }

    Mongo.prototype.deleteDocuments = async function(databaseName, collectionName, filter){
        var collection = this.getCollection(databaseName, collectionName)
        var query = JSON.parse(filter)

        var result = await collection.deleteMany(query)

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(result));
        });
    }

    Mongo.prototype.countDocuments = async function(databaseName, collectionName, filter){
        var collection = this.getCollection(databaseName, collectionName)
        var query = JSON.parse(filter)

        var docsCount = await collection.count(query);

        return new Promise((resolve, reject) => {
            resolve(docsCount);
        });
    }


    Mongo.prototype.updateDocument = async function(databaseName, collectionName, filter, update){
        var collection = this.getCollection(databaseName, collectionName)
        var query = JSON.parse(filter)
        var update = JSON.parse(update)
        var options = {}

        var results = await collection.updateOne(query, update, options);

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(results));
        });
    }


    Mongo.prototype.updateDocuments = async function(databaseName, collectionName, filter, update){
        var collection = this.getCollection(databaseName, collectionName)
        var query = JSON.parse(filter)
        var update = JSON.parse(update)
        var options = {}

        var results = await collection.updateMany(query, update, options);

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(results));
        });
    }


    // login methods

    Mongo.prototype.loginAnonymously  = async function(){
        const credentials = Realm.Credentials.anonymous();

        try {
            var user = await realmAppClient.logIn(credentials);
        } catch (err) {
            console.error("flutterMongoRealmWeb -> Failed to login anonymously", err);
        }

        var userObject = {
            "id": user.id
        }

        this.sendAuthListenerEvent(userObject);

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify({"id": user.id}));
        });
    }


    Mongo.prototype.signInWithUsernamePassword  = async function(username, password){
        console.log('flutterMongoRealmWeb -> signInWithUsernamePassword, username: ' + username);

        const credentials = Realm.Credentials.emailPassword(username, password);

        try {
            var user = await realmAppClient.logIn(credentials);
            console.log('flutterMongoRealmWeb -> signInWithUsernamePassword, user: ',user);
        } catch (err) {
            console.error("flutterMongoRealmWeb -> Failed to sign in with username and password", err);
        }

        var userObject = {
            "id": user.id,
            "profile": {
                'email': user.profile.email
            }
        }

        this.sendAuthListenerEvent(userObject);

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(userObject));
        });
    }

    Mongo.prototype.signInWithGoogle = async function(authCode){
        const credentials = Realm.Credentials.google(authCode);

        try {
            var user = await realmAppClient.logIn(credentials);
        } catch (err) {
            console.error("flutterMongoRealmWeb -> Failed to sign in with google", err);
        }

        var userObject = {
            "id": user.id,
            "profile": {
                'email': user.profile.email
            }
        }

        this.sendAuthListenerEvent(userObject);

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(userObject));
        });
    }

    Mongo.prototype.signInWithFacebook = async function(token){
        const credentials = Realm.Credentials.facebook(token);

        try {
            var user = await realmAppClient.logIn(credentials);
        } catch (err) {
            console.error("flutterMongoRealmWeb -> Failed to sign in with facebook", err);
        }

        var userObject = {
            "id": user.id,
            "profile": {
                'email': user.profile.email
            }
        }

        this.sendAuthListenerEvent(userObject);

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(userObject));
        });
    }

    Mongo.prototype.signInWithCustomJwt = async function(jwtString){
        const credentials = Realm.Credentials.jwt(jwtString);

        try {
            var user = await realmAppClient.logIn(credentials);
        } catch (err) {
            console.error("flutterMongoRealmWeb -> Failed to sign in with custom jwt", err);
        }

        var userObject = {
            "id": user.id,
            "profile": {
                'email': user.profile.email
            }
        };

        this.sendAuthListenerEvent(userObject);

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(userObject));
        });
    };

    Mongo.prototype.signInWithCustomFunction = async function(jsonData){
        var json = JSON.parse(jsonData);

        const credentials = Realm.Credentials.function(json);

        try {
            var user = await realmAppClient.logIn(credentials);
        } catch (err) {
            console.error("flutterMongoRealmWeb -> Failed to sign in with custom function", err);
        }

        var userObject = {
            "id": user.id,
            "profile": {
                'email': user.profile.email
            }
        };

        this.sendAuthListenerEvent(userObject);

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(userObject));
        });
    };

    Mongo.prototype.logout  = async function(){
        var user = await realmAppClient.currentUser;
        if (user!=null) {
            await user.logOut();
            this.sendAuthListenerEvent(null);
            console.log('flutterMongoRealmWeb -> logged out');
        }
    };

    
    // registration methods

    Mongo.prototype.registerWithEmail  = async function(email, password){
        await realmAppClient.emailPasswordAuth.registerUser({email, password});

        console.log('flutterMongoRealmWeb -> registerWithEmail done!');
    };

    // Mongo.prototype.confirmUserWithToken = async function(token, tokenId){
    //     await realmAppClient.emailPasswordAuth.confirmUser({ token, tokenId });
    // };

    // Mongo.prototype.resendConfirmationEmail = async function(email){
    //     await realmAppClient.emailPasswordAuth.resendConfirmationEmail({ email });
    // };

    Mongo.prototype.sendResetPasswordEmail = async function(email){
        await realmAppClient.emailPasswordAuth.sendResetPasswordEmail({ email });
    };

    // Mongo.prototype.resetPassword = async function(password, token, tokenId){
    //     await realmAppClient.emailPasswordAuth.resetPassword({ password, token, tokenId });
    // };

    // user information methods

    Mongo.prototype.getUserId  = async function(){
        var user = await realmAppClient.currentUser;

        return new Promise((resolve, reject) => {
            resolve(user.id);
        });
    };


    Mongo.prototype.getUser  = async function(){
        var user = await realmAppClient.currentUser;
        console.log('flutterMongoRealmWeb -> getUser, user: ' + user.id);

        var userObject = {
            "id": user.id,
            "profile": {
                'email': user.profile.email
            }
        };

        return new Promise((resolve, reject) => {
            resolve(JSON.stringify(userObject));
        });
    };


    // callFunction method

    Mongo.prototype.callFunction  = async function(name, args/*, timeout*/){
        console.log('flutterMongoRealmWeb -> callFunction, name: ' + name);
        var result = await realmAppClient.currentUser.callFunction(name, args);
        console.log('flutterMongoRealmWeb -> callFunction, result: ',result);

        return new Promise((resolve, reject) => {
            resolve(result);
        });
    };


    // STREAM SOLUTION

    Mongo.prototype.setupWatchCollection = async function(databaseName, collectionName, arg){
        var collection = this.getCollection(databaseName, collectionName)

        console.log(arg)
        console.log(typeof arg)
        if (typeof arg === 'string' || arg instanceof String){
            arg = JSON.parse(arg);
        }
        if (typeof arg === 'array' || arg instanceof Array){
            if(arg[1] == false){
                arg = arg[0]
            }
            else {
                var lst = [];
                arg[0].forEach((str) => {
                    lst.push(new Realm.BSON.ObjectId(str))
                })
                arg = lst;
            }
        }


        var changeStream = await collection.watch(arg);

        // Set the change listener. This will be called
        // when the watched documents are updated.
        changeStream.onNext((event) => {

            var results = {
                "_id": event.fullDocument['_id']
            }
            var watchEvent = new CustomEvent("watchEvent."+databaseName+"."+collectionName, {
                detail: JSON.stringify(results)
            });

            document.dispatchEvent(watchEvent);

            // Be sure to close the stream when finished(?).
            // changeStream.close()
        })
    }

    // private methods

    Mongo.prototype.sendAuthListenerEvent = async function(arg){

        var authEvent = new CustomEvent("authChange", {
            detail: arg
        });

        document.dispatchEvent(authEvent);
        this.getMongoClient();
    };

    Mongo.prototype.getMongoClient = async function(){
        if (realmAppClient.currentUser!=null) {
            mongoClient = realmAppClient.currentUser.mongoClient("mongodb-atlas");
            console.log('flutterMongoRealmWeb -> connectMongo, mongoClient: ', mongoClient);
        }
    };
}