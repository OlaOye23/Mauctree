const functions = require('firebase-functions');
const fetch = require("node-fetch");




exports.onNewOrder = functions.firestore
  .document('/orders/{id}')
  .onCreate((change, context) => {
    console.log('context parameters')
    console.log(context.params)
    async function sendPushNotification(expoPushToken) {
        const message = {
          to: expoPushToken,
          sound: 'default',
          title: 'New Order!',
          body: 'Open app to see details',
          data: { name: context.params.name,
                  address: context.params.address + context.params.address,
                  total: context.params.total,  
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
    sendPushNotification("ExponentPushToken[CCn2edEVIjaUzfnqhSebut]") 
    console.log('new order alert complete')
});