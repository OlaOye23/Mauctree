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
    let _token = await this.registerForPushNotificationsAsync()
    this.setState({token: _token})
    console.warn(_token)
    try{
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      await getOrders(this.ordersRetrieved, this.state.token)
      console.log(this.state.orders)
    }catch(error){
      console.warn(error)
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

      <ScrollView styles = {orderStyles.allContainer}
       refreshControl={
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={this._onRefresh.bind(this)}/>}
       >
      
      <Text style={orderStyles.titleText}>Pull down to update </Text> 

          { this.state.orders.map((order,i) =>(
              order.name && 
              <TouchableOpacity style = {{borderColor: '#c0c0c0', borderWidth: 1,}} key ={i} onPress = {()=> this.onPressItem(order)}>
                <View style = {orderStyles.superContainer}>
                <View style = {orderStyles.mainContainer}>
                    <View style = {orderStyles.titleContainer}>
                        <Text style = {orderStyles.titleText}>{order.name} </Text>
                        <Text style = {orderStyles.titleText}> {'Total: N' + order.total } </Text>
                    </View>
                    <Text style = {orderStyles.neutralText} >{order.address}</Text>
                    <Text style = {orderStyles.description}>{order.phoneNumber}</Text>
                </View>
              </View>

              </TouchableOpacity>
  
            
          ))}

          
          <Modal visible={this.state.modalVisible} transparent={false}>
          {(this.state.current !== undefined) &&
            <View>
              <Text style = {orderStyles.modalTextFirst}>{this.state.current.name}</Text>
              <Text style = {orderStyles.modalText}>{this.state.current.address}</Text>
              <Text style = {orderStyles.modalText}>{'Total: N' + this.state.current.total}</Text>
              <TouchableOpacity 
                style = {orderStyles.modalButton} 
                onPress = {() => this.openGps(this.state.current.latitude, this.state.current.longitude)}
                >
                <Text style = {orderStyles.buttonText}>GET DIRECTIONS</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style = {orderStyles.modalButton} 
                onPress = {() => this.makeCall(this.state.current.phoneNumber)}
                >
                <Text style = {orderStyles.buttonText}>CALL US</Text>
              </TouchableOpacity>
              <TouchableOpacity style = {orderStyles.modalButton} onPress = {() => this.onCloseModal() }>
                <Text style = {orderStyles.buttonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          }
            <ScrollView>
            { (this.state.current !== undefined) && this.state.current.basket.map((product,i) =>(
              product.name && 
              
                <View key ={i} style = {orderStyles.superContainer}>
                <Image source = {{uri:product.info.imgURL}} style = {orderStyles.productPic} />
                <View style = {orderStyles.mainContainer}>
                    <View style = {orderStyles.titleContainer}>
                        <Text style = {orderStyles.titleText}>{product.info.name} </Text>
                        <Text style = {orderStyles.titleText}> N{product.info.price}</Text>
                    </View>
                    <Text style = {orderStyles.neutralText} >
                        {product.qty+ " in basket"}
                    </Text>
                    <Text style = {orderStyles.neutralText}>
                        {"Total: N"+ product.qty* product.info.price } 
                    </Text>
                </View>
                
            </View>

              
          ))}
              </ScrollView>
            </Modal>
          

        </ScrollView>
        </View>
  );
}
}


orderStyles = StyleSheet.create({
  neutralText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 10,
    marginLeft: 5,
    //alignSelf: 'center',
  },
  warnText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 10,
    alignSelf: 'center',
  },
  badText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 10,
    marginLeft: 5,
    //alignSelf: 'center',
  },
  goodText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 10,
    marginLeft: 5,
    //alignSelf: 'center',
  },
  searchBox: {
    height: 50,
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
    width: 80,
    height: 80,
    margin: 5,

  },

  modal: { 
    marginTop: 50,
    alignContent: 'center',
   },

  modalPic:{
    width: 250,
    height: 250,
    alignSelf:'center'
  },

  modalTextFirst: {
    marginTop: 50,
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding: 5,
    textAlign: 'center',
  },

  modalText: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding: 5,
    textAlign: 'center',
  },
  modalButtonFirst: {
    margin: 10,
    marginTop: 50,
    marginBottom: 20,
    alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'black',
  },
  
  modalButton: {
    margin: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'black',
  },

  textInput:{
    alignSelf: 'center',
    textAlign: 'center',
    height: 40,
    width: 60,
    marginLeft: 10,
    marginBottom: 10,
    color: 'black',
    borderBottomColor: 'black' ,
    borderBottomWidth: 1,
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  
  allContainer:{
    marginTop: 100,  // doesnt do anything
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 5,

  },
  superContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 5,

  },
  mainContainer: {
    width: 260,
    margin : 5,

  },
  description: {
    margin: 5,
    fontSize: 10,

  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 10,
    alignSelf: 'center',
  },
  
  newItemText: {
    fontWeight: 'bold',
    fontSize: 10,

  },
  
  orderPic:{
    width: 80,
    height: 80,
    margin: 5,

  },
  orderTitle:{
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  location2: {
    height: 45,
    marginTop: 0,
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 16,
    color: 'grey',
    borderColor: 'grey',
    borderWidth: 1,
  },    


})

orderOtherStyles = StyleSheet.create({
  button: {
      marginTop: 5,
      marginBottom: 5,
      width: 350,
      height: 40,
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: '#000000'
    },

    buttonText: {
      textAlign: 'center',
      margin: 14,
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
    },
})