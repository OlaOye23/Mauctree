import React, {Component} from 'react'
import { Button, TouchableOpacity, ScrollView, View, Animated, Text, TextInput, Image, StyleSheet } from 'react-native';//import native ocmponents
import Geocoder from 'react-native-geocoding'; //import geocoder i.e long/lat --> address
import firebase from '../../api/ShopsApi'; //to access firestore
import {BaseButton} from 'react-native-gesture-handler'// using TouchableOpacity instead as basebutton does not have 'disable' feature
//import 'react-native-geolocation-service'
import dynamic_light_bulb from '../../../assets/light_bulb_dynamic.gif'
import static_light_bulb from '../../../assets/light_bulb_on.jpg'
import * as defaultLoc from '../../../assets/defaultLoc.json'

export default class RequestPage extends Component{
constructor(){
  super()
  this.state = {
    status: "",
    lat: null,
    long: null, 
    lat2dp: null,
    long2dp: null,
    address: "Loading your current location...",
    time: null,
    timeCalc: null,
    unPressable: true,
    count: 0,
    prev_id: null,
  }

  this.t = setInterval(() => {
    this.setState({ count: this.state.count + 1 });
    if (this.state.count >= 12){
        this.setState({address: 'Error: There is a problem with your internet connectivity'})
    }
  }, 1000);
  
}


getAddress = async (lat, long) => {
  Geocoder.init("AIzaSyBLElYt7l1VCCCHI5l8nAlsWwYK6xe1KRk");
  try{
    const json = await Geocoder.from(lat, long)
    var addressComponent = json.results[0].address_components[0]['short_name']+',' +json.results[0].address_components[1]['short_name'] + ','+json.results[0].address_components[2]['short_name'];
    console.log(addressComponent);
    this.setState({address : addressComponent})
  }
  catch(error){
    console.warn(error);
  }
}

  setDefaultLoc = () =>{
    defaultLoc.address = this.state.address
    defaultLoc.latitude = this.state.lat
    defaultLoc.longitude = this.state.long
    defaultLoc.default.lat = this.state.lat
    defaultLoc.default.long = this.state.long
  }


getCoordinates() {
  return new Promise(function(resolve, reject) {
    let options = {
      enableHighAccuracy: false,
      timeout: 5000,
      //maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

setLocation = async () => {//define a function to retrieve the location of the user
  if (navigator.geolocation) {//if navigation is enabled
    try{
      //se time
      let today = new Date();
      let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let dateTime = date+' '+time;
      let timeCalc = (today - 0)/60000;
      this.setState({time: dateTime, timeCalc: timeCalc})
      //set location
      const position =  await this.getCoordinates()
      lat = position.coords.latitude//.toFixed(4);
      long = position.coords.longitude//.toFixed(4);
      this.setState({lat: lat, long: long})
      this.setState({lat2dp: parseFloat(lat).toFixed(1), long2dp: parseFloat(long).toFixed(1)})
      console.log(this.state)
      loc = [lat, long]
      console.log('ended')
      }
    catch(err){
      console.log(err)
    }
    
  } else { 
    console.log(this.state)
    alert('error! please enable location services for this app in settings')
  }
}




uploadStateToDB = async () =>{//uploads the state to Firestore
  const db = firebase.firestore() //create a firstore access instance using the firbase config in './firbase'
  try{ 
    let query = db.collection('light_reports')
                            .where('address', '==', this.state.address)
                            .orderBy('timeCalc', 'desc')
                            .limit(1)
    await query.get().then(snapshot => {
      snapshot.forEach(prev_doc => {
        console.log('id = ')
        console.log(prev_doc.id)
        this.setState({prev_id: prev_doc.id})
      })
    }) 
  }catch(err){
    console.log(err)
  }

  if (this.state.prev_id != null){
    await db.collection("light_reports").doc(this.state.prev_id).set(this.state, {merge: false}).then(console.log('updated'))
    await db.collection("light_reports_all").add(this.state).then(console.log('added to big'))//log message for debugging
  }
  else{
    await db.collection("light_reports").add(this.state).then(console.log('added'))//log message for debugging
    await db.collection("light_reports_all").add(this.state).then(console.log('added to big'))//log message for debugging
    console.log(this.state)
  }
  //set local json for defaul loc
  this.setDefaultLoc()

}

onPressYes = async () =>{
  console.log('in yes')
  let today = new Date();
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date+' '+time;
  let timeCalc = (today - 0)/60000;
  this.setState({time: dateTime, timeCalc: timeCalc,status: "YES"}, async ()=>{//set the statu to YES
  console.log(this.state)
  await this.uploadStateToDB()//upload the data to firestore
  //navigate('mapPage', {lat: this.state.lat, long: this.state.long})
  const {navigate} = this.props.navigation;
  this.setState({lat: null})
  navigate('tabNav')
  })
}

onPressNo = async () =>{
  console.log('in no')
  let today = new Date();
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date+' '+time;
  let timeCalc = (today - 0)/60000;
  this.setState({time: dateTime, timeCalc: timeCalc,status: "NO"}, async ()=>{//set the statu to NO
    console.log(this.state)
    await this.uploadStateToDB()//upload the data to firestore
    //navigate('mapPage', {lat: this.state.lat, long: this.state.long})
    this.setState({lat: null})
    const {navigate} = this.props.navigation;
    navigate('tabNav')
  })
}

componentDidMount = async () => {
  const { navigation } = this.props;
  this.focusListenerReq = navigation.addListener('didFocus', async () => { //set states to update on navigation
    this.setState({ count: 0 });
    this.setState({unPressable: true})
    this.setState({address: "Loading your current location..."})
    const result1 = await this.setLocation()
    console.log(this.state.lat)
    const result2 = await this.getAddress(this.state.lat, this.state.long)
    this.setState({unPressable: false})    
  });
}

/*
componentWillUnmount = () => {
  this.setState({unPressable: true})
  // Remove the event listener before removing the screen from the stack
  this.focusListenerReq.remove();
  clearTimeout(this.t);
}
*/



render(){
  
  return(
    <ScrollView >
    <View style= {lightReqStyles.container}>
      {this.state.address == "Loading your current location..."?
      <Image source = {dynamic_light_bulb} style = {lightReqStyles.img}/>
      :
      <Image source = {static_light_bulb} style = {lightReqStyles.img}/>
      }
      <Text>{this.state.address}</Text>
      <Text style={lightReqStyles.freeText}>Is there light in your current location?{'\n'}</Text>

      <TouchableOpacity onPress={this.onPressYes} disabled = {this.state.unPressable}>
          <View style={this.state.unPressable == false? lightReqStyles.button: lightReqStyles.disabledButtton}>
            <Text style={lightReqStyles.buttonText}>YES - THERE IS LIGHT!</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPressNo} disabled = {this.state.unPressable}>
        <View style={this.state.unPressable == false? lightReqStyles.button: lightReqStyles.disabledButtton}>
            <Text style={lightReqStyles.buttonText}>NO - THERE IS NO LIGHT!</Text>
          </View>
        </TouchableOpacity>


    </ View>
    </ScrollView>

  )
}
}


const lightReqStyles = StyleSheet.create({
  container: {
    marginTop: 30,
    alignItems: 'center'
  },
  button: {
    marginBottom: 30,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#000000'
  },

  disabledButtton: {
    marginBottom: 30,
    width: 260,
    alignItems: 'center',
    backgroundColor: 'grey',
  }, 

  signOutButton: {
    marginTop: 80,
    marginBottom: 30,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#000000'
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white',
    fontWeight: 'bold'
  },
  freeText: {
    textAlign: 'center',
    padding: 20,
    color: 'black',
    fontWeight: 'bold'
  },
  img: {
    width: 300,
    height: 300,
  }
});

