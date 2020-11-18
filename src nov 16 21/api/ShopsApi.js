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
  let productList = [];
  let snapshot = await firebase.firestore()
    .collection('products')
    .orderBy('createdAt','desc')
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
  order.timeOpened = firebase.firestore.FieldValue.serverTimestamp();
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

export async function getSelectProduct(selectedProduct, retrievedSelectedProduct){
  console.log('in load selected product')
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
  product.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  console.log("Updating product in firebase");

  await firebase.firestore()
    .collection('products')
    .doc(product.id).set(product)
    .then(() => updateComplete(product))
    .catch((error) => console.log(error));
}



export async function loadDriverLoc() {
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