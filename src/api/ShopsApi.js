import firebase from 'firebase';
import '@firebase/firestore'

const config = {//firebase project configuration
  apiKey: "AIzaSyCaIAv4g9dzPRnJneyv6Yofu8X93ReYwYU",
  authDomain: "mobishopvgc.firebaseapp.com",
  databaseURL: "https://mobishopvgc.firebaseio.com",
  projectId: "mobishopvgc",
  storageBucket: "mobishopvgc.appspot.com",
  messagingSenderId: "578653668100",
  appId: "1:578653668100:web:75bffa6e62bea2b1d80651",
  measurementId: "G-J8HH92VW1Q"
};
// Initialize Firebase
firebase.initializeApp(config);
//firebase.analytics();




//get a specific store
export async function getSelectStore(selectedStore){
  console.log('in load selected store')
  store = null 
  const db = firebase.firestore()
  let query = db.collection('stores')
                      .where('name', '==', selectedStore.name)
                      .limit(1) 

  await query.get().then(d00=> {
    console.log('still running load')
    d00.forEach(d0 => {
      data = d0.data()
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
  var productList = [];
  var snapshot = await firebase.firestore()
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
  product = null 
  const db = firebase.firestore()
  let query = db.collection('products')
                      .where('name', '==', selectedProduct.name)
                      .limit(1) 

  await query.get().then(d00=> {
    console.log('still running load')
    d00.forEach(d0 => {
      data = d0.data()
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