import React from 'react'
import {View, ScrollView, TextInput, Text, Image, StyleSheet, Linking, Platform} from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'

import { TouchableOpacity } from '../../web/react-native-web'; //'react-native' //
//import { TouchableOpacity } from 'react-native' //

import * as Analytics from 'expo-firebase-analytics';




export default class MoreApps extends React.Component{
  constructor(props){
      super(props)
      this.appList = 
      [ 
          

          {
              "name": "Continue Shopping",
              "description": "Shop and pay before or after delivery. Our selection is growing. We deliver between 10 minutes and 2 hours",
              "imgAddr": require('../../../assets/icon.png'),
              "nav": "Location"
          },

          

          {
              "name": "Order History",
              "description": "See your past orders and their status",
              "imgAddr": require('../../../assets/history.jpg'),
              "nav": "My Orders"
          },

          {
            "name": "Get Android App",
            "description": "Get the full featured app on the Play Store with features like driver tracking and more added on.",
            "imgAddr": require('../../../assets/playstore.png'),
            "nav": "store",
            "link": "https://play.google.com/store/apps/details?id=com.adadevng.shopmob"
          },

          {
            "name": "Contact us on Whatsapp",
            "description": "Chat with our representative on Whatsapp. Send us your questions, reviews, suggestions, requests, and complaints. We are very responsive",
            "imgAddr": require('../../../assets/whatsapp.jpg'),
            "nav": "store",
            "link": "http://api.whatsapp.com/send?phone=+2348090653657"
          },
      ]
      /*

          {
            "name": "View Basket",
            "description": "View items in your basket and checkout",
            "imgAddr": require('../../../assets/basket.jpg'),
            "nav": "Basket"
          },
          
          {
              "name": "Light App",
              "description": "Check if there is light in the estate",
              "imgAddr": require('../../../assets/light_bulb_on.jpg'),
              "nav": "Request"
          },
  
          {
              "name": "Track Driver",
              "description": "View the location of the mobile shop",
              "imgAddr": require('../../../assets/icon.png'),
              "nav": "Track Driver"
          }
      ]
      */
      this.state = {
          apps: [],
          forceRefresh: Math.floor(Math.random() * 100000000),//to force a re-render
      }
  }




  componentDidMount = async () =>{
    //this.appList = moreApps.apps
    Analytics.logEvent('openApp', {
      os: Platform.OS,
    })
    this.setState({apps: this.appList})
    
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    logErrorToMyService(error, errorInfo);
  }

  
  onOpenApp = (app) =>{
    const { navigation } = this.props;
    if (app.nav == "store"){
      Linking.openURL(app.link)
    }
    else{
      navigation.navigate(app.nav)
    }
  }


  

render(){
  return (
      
     
      
        <ScrollView style = {moreAppStyles.allContainer} >
            { this.state.apps.map((app,i) =>(
                app.name && 
                <TouchableOpacity key ={i} onPress = {()=> this.onOpenApp(app)}>
                    <View style = {moreAppStyles.superContainer}>
                    <Image source = {app.imgAddr} style = {moreAppStyles.appPic} />
                    <View style = {moreAppStyles.mainContainer}>
                        <View style = {moreAppStyles.titleContainer}>
                            <Text style = {moreAppStyles.titleText}>{app.name} </Text>
                        </View>
                        <View style = {moreAppStyles.sizeContainer}>
                            <Text style = {moreAppStyles.titleText}>{app.description} </Text>
                        </View>
                    </View>
                </View>
    
                <View>
                
                </View>
                </TouchableOpacity>  
            ))}
        </ScrollView>
 
  );
}
}


const moreAppStyles = StyleSheet.create({
  refreshText: {
    color: 'black',
    //fontWeight: 'bold',
    fontSize: hp(percHeight(9*1.25)),
    marginLeft: hp(percHeight(5)),
    alignSelf: 'center',
  },
  neutralCenterText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    alignSelf: 'center',
  },
  goodCenterText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    alignSelf: 'center',
  },
  badCenterText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12*1.25,
    alignSelf: 'center',
  },
  badText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  goodText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  searchBox: {
    height: hp(percHeight(50)),
    marginTop: 0,
    marginBottom: 10,
    paddingLeft: 0,
    textAlign: 'center',
    fontSize: hp(percHeight(18*1.25)),
    color: '#707070',
    borderColor: '#c0c0c0',
    borderWidth: 1,
  },

  modal: { 
    marginTop: hp(percHeight(25)),
    alignContent: 'center',
   },

  modalPic:{
    width: hp(percHeight(250)),
    height: hp(percHeight(250)),
    alignSelf:'center'
  },

  modalText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(20*1.25)),
    alignSelf: 'center',
    padding: hp(percHeight(5)),
    textAlign: 'center',
  },

  addConfirmText: {
    marginTop: hp(percHeight(200)),
    fontWeight: 'bold',
    fontSize: hp(percHeight(20*1.25)),
    alignSelf: 'center',
    padding: hp(percHeight(5)),
    textAlign: 'center',
  },
  
  modalButton: {
    margin: hp(percHeight(5)),
    alignItems: 'stretch',
    paddingTop: hp(percHeight(10)),
    paddingBottom: hp(percHeight(10)),
    backgroundColor: 'black',
  },

  modalDisabledButton: {
    margin: hp(percHeight(10)),
    marginTop: hp(percHeight(10)),
    marginBottom: hp(percHeight(10)),
    alignItems: 'stretch',
    paddingTop: hp(percHeight(10)),
    paddingBottom: hp(percHeight(10)),
    backgroundColor: 'grey',
  },

  textInput:{
    alignSelf: 'center',
    textAlign: 'center',
    height: hp(percHeight(40)),
    width: hp(percHeight(60)),
    marginLeft: hp(percHeight(10)),
    marginBottom: hp(percHeight(10)),
    color: 'black',
    borderBottomColor: 'black' ,
    borderBottomWidth: 1,
  },
  buttonText: {
    fontSize: hp(percHeight(20*1.25)),
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  
  allContainer:{
    alignSelf : 'center',
    width: wp("100%") < hp(percHeight(450))? wp("100%") : hp(percHeight(450)),
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 0,
    marginLeft: hp(percHeight(5)),

  },
  superContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  mainContainer: {
    width: "75%",
    margin : hp(percHeight(5)),

  },
  description: {
    margin: hp(percHeight(5)),
    fontSize: hp(percHeight(12*1.25)),

  },
  titleText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
  },
  
  newItemText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
  },
  
  appPic:{
    width: "20%",
    height:  wp("20%") < hp(percHeight(80))? wp("20%") : hp(percHeight(80)),//used width to maintain ratio- very slight difference
    margin: hp(percHeight(5)),
  },
  appTitle:{
    fontSize: hp(percHeight(12*1.25)),
    fontWeight: 'bold',
    marginLeft: hp(percHeight(5)),
  },
  location2: {
    height: hp(percHeight(45)),
    marginTop: 0,
    marginBottom: hp(percHeight(5)),
    textAlign: 'center',
    fontSize: hp(percHeight(12*1.25)),
    color: 'grey',
    borderColor: 'grey',
    borderWidth: 1,
  },    


})