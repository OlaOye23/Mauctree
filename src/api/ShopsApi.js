import firebase from 'firebase';
import '@firebase/firestore'
import fbconfig from '../../fbconfig'

const config = {//firebase project configuration
  apiKey: fbconfig.API_KEY,
  authDomain: fbconfig.AUTH_DOMAIN,
  databaseURL: fbconfig.DATABASE_URL,
  projectId: fbconfig.PROJECT_ID,
  storageBucket: fbconfig.STORAGE_BUCKET,
  messagingSenderId: fbconfig.MESSAGE_ID,
  appId: fbconfig.APP_ID,
  measurementId: fbconfig.MEASUREMENT_ID
};
// Initialize Firebase
firebase.initializeApp(config);
//firebase.analytics();

//get orders
export async function getOrders(ordersRetreived, pushToken ) {
  console.log('in getOrders')
  firebase.auth().signInAnonymously()
  var orderList = [];
  var snapshot = await firebase.firestore()
    .collection('orders')
    .where('token', '==', pushToken)
    //.where('status', '==', "open")
    .orderBy('timeOpened','desc')
    .get()
  snapshot.forEach((doc) => {
    const orderItem = doc.data();
    orderItem.id = doc.id;
    orderList.push(orderItem);
  });
  console.log(orderList)
  ordersRetreived(orderList);
  console.log('out getOrders')
}

//get a specific store
export async function getSelectStore(selectedStore){
  console.log('in load selected store')
  firebase.auth().signInAnonymously()
  let store = null 
  const db = firebase.firestore()
  let query = db.collection('stores')
                      .where('name', '==', selectedStore.name)
                      .limit(1) 

  await query.get().then(d00=> {
    console.log('still running load')
    d00.forEach(d0 => {
      let data = d0.data()
      store = data
      console.log('in db')
      console.log(store)
    })
  })
  return store
}  


//get list of products
export async function getProducts(productsRetreived) {
  console.log('in getProducts')
  firebase.auth().signInAnonymously()
  let productList = [];
  let snapshot = await firebase.firestore()
    .collection('products')
    //.where('stock', '>', -1)
    //.orderBy('stock','desc')
    .orderBy('createdAt','asc')
    .get()
  snapshot.forEach((doc) => {
    const productItem = doc.data();
    productItem.id = doc.id;
    productList.push(productItem);
  });
  productsRetreived(productList);
  console.log('out getProducts')
}
   
export async function addOrder(order, addComplete) {
  console.log('in addOrder')
  firebase.auth().signInAnonymously()
  order.timeOpened = firebase.firestore.FieldValue.serverTimestamp();
  //order.DateText = order.timeOpened.toDate().toString().slice(0,25)//didnt work
  await firebase.firestore()
    .collection('orders')
    .add(order)
    .then((snapshot) => {
      order.id = snapshot.id;
      snapshot.set(order);
    }).then(() => addComplete(order))
    .catch((error) => console.log(error));
    console.log('out addOrder')
}

export async function addSale(sale, addComplete) {
  console.log('in addSale')
  firebase.auth().signInAnonymously()
  /*sale.timeOpened = firebase.firestore.FieldValue.serverTimestamp();
  console.log(sale.timeOpened)
  sale.DateText = sale.timeOpened.toString
  console.log(sale.DateText)*/ //didnt work
  await firebase.firestore()
    .collection('sales')
    .add(sale)
    .then((snapshot) => {
      sale.id = snapshot.id;
      snapshot.set(sale);
    }).then(() => addComplete(sale))
    .catch((error) => console.log(error));
    console.log('out addSale')
}

export async function getSelectProduct(selectedProduct, retrievedSelectedProduct){
  console.log('in load selected product')
  firebase.auth().signInAnonymously()
  let product = null 
  const db = firebase.firestore()
  let query = db.collection('products')
                      .where('name', '==', selectedProduct.name)
                      .limit(1) 

  await query.get().then(d00=> {
    console.log('still running load')
    d00.forEach(d0 => {
      let data = d0.data()
      product = data
      console.log('in db')
      console.log(product)
    })
  })
  return product
  retrievedSelectedProduct(product)
  console.log('out load shop')
}  

//update a product
export async function updateProduct(product, updateComplete) {
  firebase.auth().signInAnonymously()
  product.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  console.log("Updating product in firebase");

  await firebase.firestore()
    .collection('products')
    .doc(product.id).set(product)
    .then(() => updateComplete(product))
    .catch((error) => console.log(error));
}



export async function loadDriverLoc() {
    firebase.auth().signInAnonymously()
    const db = firebase.firestore()
    let reports_query = db.collection('driver_loc')
                        .orderBy('timeCalc', 'desc')
                        .limit(1) 
        
    await reports_query.get().then(d00=> {
        d00.forEach(d0 => {
            d = d0.data
            let long = d.long
            let lat = d.lat
            return [lat, long] 
        })
    })
}

export default firebase;
