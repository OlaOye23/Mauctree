import React from 'react'
import {View, ScrollView, Modal, Platform, Text, Linking, TouchableOpacity, Image, StyleSheet} from 'react-native'
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
      this.setState({orders: this.ordList})
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
    if (this.state.modalVisible === false){
      this.setState({modalVisible: true})
    }
    else{
      this.setState({modalVisible: false})
    }
    
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
      
      <View >

<Modal visible={this.state.modalVisible} transparent={false}>
          {(this.state.current !== undefined) &&
            <View>
              <Text style = {orderHistoryStyles.modalTextFirst}>{this.state.current.name}</Text>
              <Text style = {orderHistoryStyles.modalText}>{this.state.current.address} {this.state.current.house}</Text>
              <Text style = {orderHistoryStyles.modalText}>{'Total: N' + this.state.current.total}</Text>
              
              <TouchableOpacity 
                style = {orderHistoryStyles.modalButton} 
                onPress = {() => this.makeCall(config.CONTACT_US_NO)}
                >
                <Text style = {orderHistoryStyles.buttonText}>CALL US</Text>
              </TouchableOpacity>
              <TouchableOpacity style = {orderHistoryStyles.modalButton} onPress = {() => this.onCloseModal() }>
                <Text style = {orderHistoryStyles.buttonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          }
            <ScrollView>
            { (this.state.current !== undefined) && this.state.current.basket.map((product,i) =>(
              product.name && 
              
                <View key ={i} style = {orderHistoryStyles.superContainer}>
                <Image source = {{uri:product.info.imgURL}} style = {orderHistoryStyles.productPic} />
                <View style = {orderHistoryStyles.mainContainer}>
                    <View style = {orderHistoryStyles.titleContainer}>
                        <Text style = {orderHistoryStyles.titleText}>{product.info.name} </Text>
                        <Text style = {orderHistoryStyles.titleText}> N{product.info.price}</Text>
                    </View>
                    <Text style = {orderHistoryStyles.neutralText} >
                        {product.qty+ " in basket"}
                    </Text>
                    <Text style = {orderHistoryStyles.neutralText}>
                        {"Total: N"+ product.qty* product.info.price } 
                    </Text>
                </View>
                
            </View>

              
          ))}
              </ScrollView>
            </Modal>

      <ScrollView styles = {orderHistoryStyles.allContainer}
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
    fontSize: wp(percWidth(12)),
    marginLeft: wp(percWidth(5)),
    //alignSelf: 'center',
  },
  warnText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12,
    alignSelf: 'center',
  },
  badText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: wp(percWidth(5)),
    //alignSelf: 'center',
  },
  goodText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: wp(percWidth(5)),
    //alignSelf: 'center',
  },
  searchBox: {
    height: wp(percWidth(50)),
    marginTop: 0,
    marginBottom: 0,
    paddingLeft: 0,
    textAlign: 'center',
    fontSize: 18,
    color: '#707070',
    borderColor: '#c0c0c0',
    borderWidth: 1,
  },
  
  productPic:{
    width: wp(percWidth(80)),
    height: wp(percWidth(80)),
    margin: wp(percWidth(5)),

  },

  modal: { 
    marginTop: wp(percWidth(50)),
    alignContent: 'center',
   },

  modalPic:{
    width: wp(percWidth(250)),
    height: wp(percWidth(250)),
    alignSelf:'center'
  },

  modalTextFirst: {
    marginTop: wp(percWidth(50)),
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding: wp(percWidth(5)),
    textAlign: 'center',
  },

  modalText: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding: wp(percWidth(5)),
    textAlign: 'center',
  },
  modalButtonFirst: {
    margin: wp(percWidth(10)),
    marginTop: wp(percWidth(50)),
    marginBottom: wp(percWidth(20)),
    alignItems: 'stretch',
    paddingTop: wp(percWidth(10)),
    paddingBottom: wp(percWidth(10)),
    backgroundColor: 'black',
  },
  
  modalButton: {
    margin: wp(percWidth(5)),
    marginTop: wp(percWidth(5)),
    marginBottom: wp(percWidth(5)),
    alignItems: 'stretch',
    paddingTop: wp(percWidth(10)),
    paddingBottom: wp(percWidth(10)),
    backgroundColor: 'black',
  },

  textInput:{
    alignSelf: 'center',
    textAlign: 'center',
    height: wp(percWidth(40)),
    width: wp(percWidth(60)),
    marginLeft: wp(percWidth(10)),
    marginBottom: wp(percWidth(10)),
    color: 'black',
    borderBottomColor: 'black' ,
    borderBottomWidth: wp(percWidth(1)),
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  
  allContainer:{
    marginTop: wp(percWidth(100)),  // doesnt do anything
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: wp(percWidth(5)),

  },
  superContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: wp(percWidth(5)),

  },
  mainContainer: {
    width: wp(percWidth(260)),
    margin : wp(percWidth(5)),

  },
  description: {
    margin: wp(percWidth(5)),
    fontSize: 10,

  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 12,
    alignSelf: 'center',
  },
  
  newItemText: {
    fontWeight: 'bold',
    fontSize: 12,

  },
  
  orderPic:{
    width: wp(percWidth(80)),
    height: wp(percWidth(80)),
    margin: wp(percWidth(5)),

  },
  orderTitle:{
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: wp(percWidth(5)),
  },
  location2: {
    height: wp(percWidth(45)),
    marginTop: wp(percWidth(0)),
    marginBottom: wp(percWidth(5)),
    textAlign: 'center',
    fontSize: 16,
    color: 'grey',
    borderColor: 'grey',
    borderWidth: wp(percWidth(1)),
  },    


})

