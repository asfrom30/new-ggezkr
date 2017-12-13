const config = require('../../../config/environment');
const client = require('mongodb').MongoClient;
const collectionSuffix = require('../collection-suffix');

exports.getNewPlayerId = function(device, region) {
    const dbUri = `${config.mongo.baseUri}_${device}_${region}`;
    const collectionName = 'counters';
    const targetSeqName = 'players';
    return new Promise((resolve, reject) =>{
        client.connect(dbUri).then(db => {
            db.collection(collectionName).findOne({_id : targetSeqName}).then(result => {
                db.close();
                if(result.seq == undefined) reject('seq is undefined');
                else resolve(result.seq + 1);
            }, reason => {
                db.close();
                reject(reason);
            });
        })
    })
}

exports.insertPlayer = function (device, region, doc) {
    const dbUri = `${config.mongo.baseUri}_${device}_${region}`;
    const collectionName = 'players';

    return insertOneWithAI(dbUri, collectionName, doc);
}

exports.insertTodayCrawlData = function(device, region, doc) {
    const todaySuffix = collectionSuffix.getTodaySuffix(region);
    const dbUri = `${config.mongo.baseUri}_${device}_${region}`;
    const collectionName = `${config.mongo.collectionName.crawlDatas}-${todaySuffix}`;

    return new Promise((resolve, reject) => {
        client.connect(dbUri).then((db) => {
            db.collection(collectionName).insertOne(doc).then((result) => {
                db.close();
                resolve(doc);
            }, (reason) => {
                reject(reason);
            });
        })
    })
}

exports.insertCurrentCrawlData = function(device, region, doc) {
    const dbUri = `${config.mongo.baseUri}_${device}_${region}`;
    const collectionName = `${config.mongo.collectionName.crawlDatas}-${config.mongo.collectionSuffix.current}`;

    return new Promise((resolve, reject) => {
        client.connect(dbUri).then((db) => {
            db.collection(collectionName).insertOne(doc).then((result) => {
                db.close();
                resolve(doc);
            }, (reason) => {
                reject(reason);
            });
        })
    })
}

exports.findPlayerById = function(device, region, id) {
    const dbUri = `${config.mongo.baseUri}_${device}_${region}`;
    const collectionName = 'players';

    return new Promise((resolve, reject) => {
        client.connect(dbUri).then((db) => {
            db.collection(collectionName).findOne({_id : id}, {btg : 0}).then((doc) => {
                db.close();
                resolve(doc);
            }, reason => {
                reject(reason);
            });
        })
    })
}

exports.findPlayerByBtg = function(device, region, btg) {
    const dbUri = `${config.mongo.baseUri}_${device}_${region}`;
    const collectionName = 'players';

    return new Promise((resolve, reject) => {
        client.connect(dbUri).then((db) => {
            db.collection(collectionName).findOne({btg : btg}).then((doc) => {
                db.close();
                resolve(doc);
            }, reason => {
                reject(reason);
            });
        })
    })
}

exports.findCrawlDataById = function(device, region, collectionSuffix, id) {
    const dbUri = `${config.mongo.baseUri}_${device}_${region}`;
    const collectionName = `${config.mongo.collectionName.crawlDatas}-${collectionSuffix}`;

    return new Promise((resolve, reject) =>{
        client.connect(dbUri).then(db => {
            db.collection(collectionName).findOne({_id : id}, {_id :0, _btg : 0}).then(doc =>{
                db.close();

                let result = {};
                result[collectionSuffix] = doc;
                resolve(result);
            }, reason => {
                rejct(reason);
            })
        })
    })
}

exports.findCrawlDataByBtg = function(device, region, collectionSuffix, btg) {
    const dbUri = `${config.mongo.baseUri}_${device}_${region}`;
    const collectionName = `${config.mongo.collectionName.crawlDatas}-${collectionSuffix}`;

    return new Promise((resolve, reject) =>{
        client.connect(dbUri).then(db => {
            db.collection(collectionName).findOne({_btg : btg}, {btg : 0}).then(doc =>{
                db.close();
                resolve(doc);
            }, reason => {
                rejct(reason);
            })
        })
    })
}

exports.findTierDataByDate = function(device, region, date) {
    const dbUri = `${config.mongo.baseUri}_${device}_${region}`;
    const collectionName = `${config.mongo.collectionName.tierDatas}`;

    return new Promise((resolve, reject) => {
        client.connect(dbUri).then(db => {
            db.collection(collectionName).findOne({_id : date}, {_id : 0}).then(doc => {
                db.close();
                resolve(doc);
            }, reason => {
                reject(reason);
            })
        })
    })
}

function insertOneWithAI(dbUri, collectionName, doc) {
    const counterCollectionName = 'counters';
    return new Promise((resolve, reject) => {
        client.connect(dbUri).then(db => {
            const _query = { _id: collectionName };
            const _doc = { $inc: { seq: 1 }};
            const _options = {new : true, upsert : true};
            db.collection(counterCollectionName).findAndModify(_query, {}, _doc, _options).then(result => {
                doc._id = result.value.seq;
                db.collection(collectionName).insertOne(doc).then(result => {
                    db.close();
                    resolve(result);
                }).catch(reason => {
                    db.close();
                    reject(reason);
                });
            }, reason => {
                db.close();
                reject(reason);
            });
        })
    })
}