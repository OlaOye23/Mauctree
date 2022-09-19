import firebase from 'firebase';
import '@firebase/firestore'
import fbconfig from '../../fbconfig'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

//get list of properties
export async function getProperties() {
  console.log('in getProperties')
  firebase.auth().signInAnonymously()
  let propertiesList = [];
  let snapshot = await firebase.firestore()
    .collection('mauctree_properties')
    .get()
  snapshot.forEach((doc) => {
    const propertyItem = doc.data();
    propertyItem.id = doc.id;
    propertiesList.push(propertyItem);
  });
  console.log('out getProperties')
  return propertiesList
}
   


export async function getSelectProperty(selectedProperty){
  console.log('in load selected property')
  firebase.auth().signInAnonymously()
  let property = null 
  const db = firebase.firestore()
  let query = db.collection('mauctree_properties')
                      .where('name', '==', selectedProperty.name)
                      .limit(1) 

  await query.get().then(d00=> {
    console.log('still running load')
    d00.forEach(d0 => {
      let data = d0.data()
      property = data
      console.log('in db')
      console.log(property)
    })
  })
  return property
}  




export default firebase;
