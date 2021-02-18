import React from 'react'
import {View, ScrollView, Modal, Platform, Text, Linking, Image, StyleSheet} from 'react-native'
//import {BaseButton} from 'react-native-gesture-handler'
import { getOrders }from '../../api/ShopsApi'
//import Modal from 'react-native-modal';
import Fuse from 'fuse.js'
import { RefreshControl } from 'react-native';
import * as myEPT from '../../../assets/myEPT.json'

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'

import config from '../../../config'

import uuid4 from "uuid4"
import { AsyncStorage } from 'react-native';

import { TouchableOpacity } from '../../web/react-native-web'; //'react-native' //
//import { TouchableOpacity } from 'react-native' //




export default class MyOrders extends React.Component{
  constructor(props){
      super(props)
      this.ordList = []
      this.editing = {}
      this.state = {
          orders: [],
          modalVisible : false,
          forceRefresh: Math.floor(Math.random() * 100000000),//to force a re-render
          current: undefined,
          refreshing: false,
          stock: 0,
          token: "",  
      }
  }

  static navigationOptions = {
    title: "orders",
  };  
  

  componentDidMount = async () =>{
    //get order and put in list
    //let _token = await this.registerForPushNotificationsAsync()
    //let _token = await this.getUID()
    //this.setState({token: _token})
    //console.warn(_token)
    try{
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      //await getOrders(this.ordersRetrieved, this.state.token)
      this.ordList = JSON.parse(await AsyncStorage.getItem("history"))
      if (this.ordList.length < 1){
        this.ordList = []
    }
      console.log(this.ordList)
      this.setState({orders: this.ordList.reverse()})
      console.log(this.state.orders)
    }catch(error){
      console.warn(error)
    }
    
  }
/*
  getUID = async () =>{
    let id = await AsyncStorage.getItem("uid")
    if ((id == undefined) || (id == null) || (id == "")){
      let uid = uuid4();
      await this.storeLocalData("uid", uid)
    }
    id = await AsyncStorage.getItem("uid")
    return id
  }*/

  storeLocalData = async (key, val) => {
    try {
      await AsyncStorage.setItem(key, val)
    } catch (error) {
      console.warn(error)
      alert('Error: please try again or restart')
    }
  }

  
  registerForPushNotificationsAsync = async () => {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      //console.log("token: ",token); // log token to send to user
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  }


  ordersRetrieved = (orderList) =>{
    console.log('retrieved')
    this.ordList = orderList
    console.log(orderList)
    this.setState({orders: orderList})
  }


  onCloseModal= () => {
    //set modalVisible to false
    this.setState({modalVisible : false})
  }

  onPressItem =(order) => {
    console.log("Item pressed")
    console.log(order.basket)
    this.setState({current : order})

    const { navigation } = this.props;
    navigation.navigate(
      'View Order',
      {current: order}
    )
    
}



_onRefresh= () => {
  this.setState({refreshing: true});
  this.componentDidMount().then(() => {
    this.setState({refreshing: false});
  });
}

makeCall = (phoneNumber) => {
  if (Platform.OS === 'android') {
    phoneNumber = 'tel:${' +phoneNumber+ '}'
  } else {
    phoneNumber = 'telprompt:${' +phoneNumber+ '}';
  }
  Linking.openURL(phoneNumber);
}

openGps = (lat, lng) => {
  let scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=:';
  let url = scheme + `${lat},${lng}`;
  Linking.openURL(url);
}  



  
  render(){
  return (
      
      <View style = {orderHistoryStyles.allContainer}>

      <ScrollView 
       refreshControl={
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={this._onRefresh.bind(this)}/>}
       >
      
      {/*<Text style={orderHistoryStyles.titleText}>Pull down to update </Text> */}

          { (this.state.orders !== []) && this.state.orders.map((order,i) =>(
              order.name && 
              <TouchableOpacity style = {{borderColor: '#c0c0c0', borderWidth: 1,}} key ={i} onPress = {()=> this.onPressItem(order)}>
                <View style = {orderHistoryStyles.superContainer}>
                <View style = {orderHistoryStyles.mainContainer}>
                    <View style = {orderHistoryStyles.titleContainer}>
                        <Text style = {orderHistoryStyles.titleText}>{order.name} </Text>
                        <Text style = {orderHistoryStyles.titleText}> {'Total: N' + order.total } </Text>
                    </View>
                    <Text style = {orderHistoryStyles.neutralText} >{order.address}: {order.house}</Text>
                    <Text style = {orderHistoryStyles.description}>{order.phoneNumber}</Text>
                    {/*<Text style = {orderStyles.neutralText}>Time: {Date(order.timeOpened.seconds.toLocaleString()).slice(0,25)}</Text>*/}
                </View>
              </View>

              </TouchableOpacity>
  
            
          ))}

          
         
          

        </ScrollView>
        </View>
  );
}
}


const orderHistoryStyles = StyleSheet.create({
  neutralText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percWidth(5)),
    //alignSelf: 'center',
  },
  
  modal: { 
    marginTop: hp(percWidth(50)),
    alignContent: 'center',
   },

  
  allContainer:{
    alignSelf : 'center',
    width: wp("100%") < hp(percHeight(450))? wp("100%") : hp(percHeight(450)),//hp(percHeight(450)),
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percWidth(5)),

  },
  superContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percWidth(5)),

  },
  mainContainer: {
    width: "75%",//hp(percWidth(350)),
    margin : hp(percWidth(5)),

  },
  description: {
    margin: hp(percWidth(5)),
    fontSize: hp(percHeight(10*1.25)),

  },
  titleText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
  },
  
  
  
  
  
  


})

