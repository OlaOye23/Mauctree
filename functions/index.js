const functions = require('firebase-functions');
const fetch = require("node-fetch");




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
          body: 'Open app to see details',
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
    sendPushNotification("ExponentPushToken[CCn2edEVIjaUzfnqhSebut]", data) 
    console.log('new order alert complete')
});