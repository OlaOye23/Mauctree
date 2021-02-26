


const functions = require('firebase-functions');
const fetch = require("node-fetch");
var request = require('request');
var fs = require('fs');
//const admin = require('firebase-admin');// to access other firebase stuff out of trigger event
const firebase = require('firebase-admin');// to access other firebase stuff out of trigger event
firebase.initializeApp({
  storageBucket: 'mobishopvgc.appspot.com',
});
const path = require('path');
const os = require('os');
const db = firebase.firestore();
const UUID = require("uuid-v4");
const json2csv = require('json2csv')



//admin.initializeApp();




exports.onNewOrder = functions.firestore
  .document('/orders/{id}')
  .onCreate((snap, context) => {
    console.log('context parameters')
    console.log(context.params)
    data = snap.data()
    async function sendPushNotification(expoPushToken,data) {
        const message = {
          to: expoPushToken,
          sound: 'default',
          title: 'New Order!',
          body:  data.name + " " + data.house + " " + data.address + "\n " + data.total+  '\nOpen app to see details',
          data: { name: data.name,
                  address: data.address + data.house,
                  total: data.total,  
                },
        };
      
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
      }
    sendPushNotification("ExponentPushToken[mb2N8NKVqR_yutp1u6WC0l]", data) 
    sendPushNotification("ExponentPushToken[a5Hf6AAkdBFxR1m_cmhiXT]", data) 
    console.log('new order alert complete')
});


exports.onNewProduct = functions.firestore
  .document('/products/{id}')
  .onCreate(async (snap, context) => {
    //setTimeout(()=>{
    //console.log('context parameters')
    //console.log(context.params)
  
    data = snap.data()
    id = data.id
    oldImgURL = data.imgURL
    data.oldImgURL = oldImgURL
    // Requires "request" to be installed (see https://www.npmjs.com/package/request)

    
    const bucket = firebase.storage().bucket("gs://mobishopvgc.appspot.com");
    const tempFilePath = path.join(os.tmpdir(), data.name);
    const thumbFilePath = path.join(path.dirname("`products/images/"), data.name);
    const metadata = {
      contentType: 'image/png',
    };

    request.post({
      url: 'https://api.remove.bg/v1.0/removebg',
      formData: {
        image_url: oldImgURL,
        size: 'full',
      },
      headers: {
        'X-Api-Key': 'KkwqsYxtQymfbBJ5bwnRLagD'
      },
      encoding: null
    }, async function(error, response, body) {
      if(error) return console.error('Request failed:', error);
      if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
      console.log(response.statusCode)
      try{fs.writeFileSync(tempFilePath, body)}catch(error){console.log(error)}

      
      console.log(data.name)
      

      await bucket.upload(tempFilePath, {
        destination: thumbFilePath,
        metadata: metadata,
      }).then((d) => {
        console.log('stuff')
        let file = d[0];
        let uuid = UUID();
        getFilePath = () =>{
          console.log('in getFilePath')
          return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
        }
        
    
        getFilePath().then( async (downloadURL) => {
          
          console.log(downloadURL);
          data.imgURL = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid //JSON.stringify(downloadURL)
          data.updated = true
          console.log(data.imgURL)
          await db.doc('products/'+data.id).set(JSON.parse(JSON.stringify(data)));//JSON.parse(JSON.stringify(data))
          console.log('done with db upload')

        });
    });
  })
    console.log('new product alert complete')
});

exports.onProductUpdate = functions.firestore
  .document('/products/{id}')
  .onUpdate(async (change, context) => {
    //setTimeout(()=>{
    //console.log('context parameters')
    //console.log(context.params)
    data = change.after.data()
    oldData = change.before.data()

    if (data.updated){
      return
    }

    id = data.id
    oldImgURL = data.imgURL
    data.oldImgURL = oldImgURL
    // Requires "request" to be installed (see https://www.npmjs.com/package/request)

    const bucket = firebase.storage().bucket("gs://mobishopvgc.appspot.com");
    const tempFilePath = path.join(os.tmpdir(), data.name);
    const thumbFilePath = path.join(path.dirname("`products/images/"), data.name);
    const metadata = {
      contentType: 'image/png',
    };

    request.post({
      url: 'https://api.remove.bg/v1.0/removebg',
      formData: {
        image_url: oldImgURL,
        size: 'full',
      },
      headers: {
        'X-Api-Key': 'KkwqsYxtQymfbBJ5bwnRLagD'
      },
      encoding: null
    }, async function(error, response, body) {
      if(error) return console.error('Request failed:', error);
      if(response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
      console.log(response.statusCode)
      try{fs.writeFileSync(tempFilePath, body)}catch(error){console.log(error)}

      
      console.log(data.name)
      

      await bucket.upload(tempFilePath, {
        destination: thumbFilePath,
        metadata: metadata,
      }).then((d) => {
        console.log('stuff')
        let file = d[0];
        let uuid = UUID();
        getFilePath = () =>{
          console.log('in getFilePath')
          return Promise.resolve("https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid)
        }
        
    
        getFilePath().then( async (downloadURL) => {
          
          console.log(downloadURL);
          data.imgURL = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid //JSON.stringify(downloadURL)
          data.updated = true
          console.log(data.imgURL)
          await db.doc('products/'+data.id).set(JSON.parse(JSON.stringify(data)));//JSON.parse(JSON.stringify(data))
          console.log('done with db upload')

        });
    });
  })
    console.log('new product alert complete')   
});




exports.generateApplicationCsv = functions.region('asia-northeast1').pubsub
  .topic("generate-application-csv")
  .onPublish(async message => {

    // gets the documents from the firestore collection
    const applicationsSnapshot = await firebase
      .firestore()
      .collection("products")
      .get();

    const applications = applicationsSnapshot.docs.map(doc => doc.data());

    // csv field headers
    const fields = [
      'name',
      'price',
      'shop',
      'createdAt.seconds',
      'createdAt._seconds',
      'class',
      'cprice',
      'id',
      'imgURL',
      'tags',
      'updatedAt',
      'stock'

    ];

    // get csv output
    const output = await json2csv.parseAsync(applications, { fields });

    // generate filename
    const dateTime = new Date().toISOString().replace(/\W/g, "");
    const filename = `applications_${dateTime}.csv`;
    const newFilePath = path.join(path.dirname("history/products/"), filename);
    const latestFilePath = path.join(path.dirname("history/products/"), 'LATEST PRODUCTS LIST.csv');

    const tempLocalFile = path.join(os.tmpdir(), filename);

    return new Promise((resolve, reject) => {
      //write contents of csv into the temp file
      fs.writeFile(tempLocalFile, output, error => {
        if (error) {
          reject(error);
          return;
        }
        const bucket = firebase.storage().bucket();

        // upload the file into the current firebase project default bucket
        bucket
           .upload(tempLocalFile, {
            // Workaround: firebase console not generating token for files
            // uploaded via Firebase Admin SDK
            // https://github.com/firebase/firebase-admin-node/issues/694
            destination: newFilePath,
            metadata: {
              metadata: {
                firebaseStorageDownloadTokens: UUID(),
              }
            },
          })
          .then(() => resolve())
          .catch(errorr => reject(errorr));

          bucket
           .upload(tempLocalFile, {
            // Workaround: firebase console not generating token for files
            // uploaded via Firebase Admin SDK
            // https://github.com/firebase/firebase-admin-node/issues/694
            destination: latestFilePath,
            metadata: {
              metadata: {
                firebaseStorageDownloadTokens: UUID(),
              }
            },
          })
          .then(() => resolve())
          .catch(errorr => reject(errorr));
      });
    });
  });