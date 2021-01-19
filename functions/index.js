const functions = require('firebase-functions');
const fetch = require("node-fetch");
var request = require('request');
var fs = require('fs');
const admin = require('firebase-admin');// to access other firebase stuff out of trigger event
admin.initializeApp()
const path = require('path');
const os = require('os');
const db = admin.firestore();
const UUID = require("uuid-v4");





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

    
    const bucket = admin.storage().bucket("gs://mobishopvgc.appspot.com");
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

    const bucket = admin.storage().bucket("gs://mobishopvgc.appspot.com");
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