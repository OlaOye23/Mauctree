import React, {Component} from 'react'
import {addOrder, updateProduct, getSelectStore, getSelectProduct} from '../../api/ShopsApi'
import {StyleSheet, Modal, Image, TextInput, View, ScrollView} from 'react-native'
import {Button, Text} from 'react-native-elements'
import { AsyncStorage } from 'react-native';
import * as yup from 'yup';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'
import * as defaultCheckout from '../../../assets/defaultCheckout.json'

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

import config from '../../../config'

import uuid4 from "uuid4"
import { TouchableOpacity } from '../../web/react-native-web';//'react-native' //

//import { Expo } from 'expo-server-sdk';

//import uuid from 'react-native-uuid'



export default class OrderForm extends Component{
    constructor(props){
        super(props)
        this.basket = []
        this.state = {
            id: null,
            status: null,
            name: "",
            address: "",
            house: "",
            phoneNumber: "",
            phoneNumber2: "",
            longitude: null, 
            latitude: null,
            long2dp: null,
            lat2dp: null,  
            geoAddress: null,
            style: null,
            basket: [],
            timeOpened: null,
            timeClosed: null,
            total: 0,
            modalVisible: false,
            disableSubmit: true,
            invalidName: true,
            invalidPhone: true,
            invalidPhone2: true,
            invalidAddress: true,
            invalidHouse: true,
            store:{
              id: "bvUlmrcHZsUi6SpECE8y",//VGC STORE HARD CODE
              name: "VGC",
              open: ""
            },
            token: "",
            email: "",
            cardNumber: "",
            cvc: "",
            expiry: {
              month: "",
              year: "",
            }
        }
    }

    onOrderUploaded = () => {
    console.log('order uploaded')
    /*
    //OPEN UP A CONFIRMATION MODAL
    */
  }


  componentDidMount = async () =>{
    //get location
    //get order items from async storage
    console.log(this.state.expiry.month)
    console.log(this.state.expiry.year)
    const { route } = this.props;
    const { total } = route.params;
    this.setState({total : total })

    

    this.getAllLocalData() 
    this.setGeoLoc()
    this.checkValidity()
    //this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})

    //let _token = await this.registerForPushNotificationsAsync()
    let name = await AsyncStorage.getItem("checkoutName")
    let address = await AsyncStorage.getItem("checkoutAddr")
    let house = await AsyncStorage.getItem("checkoutHouse")
    let phoneNumber = await AsyncStorage.getItem("checkoutPhone")

    this.setState({name: name})
    this.setState({address: address})
    this.setState({house: house})
    this.setState({phoneNumber: phoneNumber})

    /*
    let _token = await this.getUID()
    this.setState({token: _token})
    console.warn(_token)
    */
  }

  
  getUID = async () =>{
    let id = await AsyncStorage.getItem("uid")
    console.log(id)
    if ((id == undefined) || (id == null) || (id == "")){
      let uid = uuid4();
      await this.storeLocalData("uid", uid)
      console.log(uid)
    }
    return await AsyncStorage.getItem("uid")
  }
  
/*
 getUID = async () =>{
    let id = await AsyncStorage.getItem("uid")
    if ((id == undefined) || (id == null) || (id == "")){
      let uid = uuid.v4();
      await this.storeLocalData("uid", uid)
    }
    return await AsyncStorage.getItem("uid")
  }

  */

  storeHistory = async () =>{
    let history = await AsyncStorage.getItem("history")
    if ((history == undefined) || (history == null) || (history == "")){
      let history = []
      await this.storeLocalData("history", JSON.stringify(history))
    }
    let hist = JSON.parse(await AsyncStorage.getItem("history"))
    hist.push(this.state)
    await this.storeLocalData("history", JSON.stringify(hist))
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

  setGeoLoc = async () =>{
    if (navigator.geolocation) {//if navigation is enabled
      const position =  await this.getCoordinates()
      let lat = position.coords.latitude//.toFixed(4);
      let long = position.coords.longitude//.toFixed(4);
      this.setState({latitude: lat, longitude: long})
      this.setState({lat2dp: parseFloat(lat).toFixed(2), long2dp: parseFloat(long).toFixed(2)})//not actually used here
      console.log(this.state)
    }
  }

    getAllLocalData = async () =>{
      console.log('in async get')
      try{
        await AsyncStorage.getAllKeys( async (err, keys) => {
          await AsyncStorage.multiGet(keys, async (err, stores) => {
            stores.map((result, i, store) => {
              let key = store[i][0];
              let value = store[i][1];
              try{
                let prodObj = JSON.parse(value)
                if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
                  this.basket.push(prodObj)
                  console.log('hahaha'+this.basket)
                }
              }catch(error){
                console.log(error)
              }
            });
          });
          this.setState({basket : this.basket})
          console.log('done')   
        });
      } catch (error) {
        console.warn(error)
        alert('Error: please try again or restart')
      }
      console.log('out async get')
    }

    clearAllLocalData = async () =>{
      console.log('in async get')
      try{
        await AsyncStorage.getAllKeys( async (err, keys) => {
          await AsyncStorage.multiGet(keys, async (err, stores) => {
            stores.map(async (result, i, store) => {
              let key = store[i][0];
              let value = store[i][1];
              try{
              let prodObj = JSON.parse(value)
              if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
                await AsyncStorage.setItem(key, JSON.stringify({"null": "null"}))
              }
            }catch(error){
              console.warn(error)
            }
            });
          });
          console.log('done')   
        });
      } catch (error) {
        console.warn(error)
        alert('Error: please try again or restart')
      }
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      console.log('out async get') 
    }

    storeLocalData = async (key, val) => {
      try {
        await AsyncStorage.setItem(key, val)
      } catch (error) {
        console.warn(error)
        alert('Error: please try again or restart')
      }
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


    onProductUploaded = () =>{
      console.log('product stock updated')
      
    }

    //alert shop of new order
    sendAlert = async (orderObj) =>{
      async function sendPushNotification(expoPushToken) {
        const message = {
          to: expoPushToken,
          sound: 'default',
          title: 'New Order!',
          body: 'Open app to see details',
          data: { name: orderObj.name,
                  address: orderObj.address,
                  total: orderObj.total,  
                },
        };
      
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          'mode': 'no-cors',
            'method': 'POST',
            'headers': {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
          body: JSON.stringify(message),
        });
      }
      try{
        sendPushNotification(config.PUSH_TOKEN) 
      } catch (error) {
        console.warn(error)
        alert('Error: please try again or restart')
      }
    console.log('new order alert complete')
    }
    
    sendAlertSDK = async (orderObj) =>{
      let expo = new Expo();
      let messages = []
      const message = {
        to: config.PUSH_TOKEN,
        sound: 'default',
        title: 'New Order!',
        body: 'Open app to see details',
        data: { name: orderObj.name,
                address: orderObj.address,
                total: orderObj.total,  
              },
      }
      messages.push(message)

      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      (async () => {
     
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
            
          } catch (error) {
            console.error(error);
          }
        }
      })();
    }


    onRetrieved = () =>{
      console.log('in callback onretrieved')
    }

    asyncForEach = async (array, callback) => {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    } 

    checkOutCheck = async () =>{// different from similar func in basketpage
      console.log('checking out')
      let items = this.basket
      let fail = false

      if (this.total < 2000){
        alert("You need to spend a minimum of N2000 for our delivery service")
        fail = true
        const { navigation } = this.props;
          navigation.navigate(
            'Basket',
          )
        return fail
      }
  
      if (items.length < 1){
        alert("There are no items in your basket")
        fail = true
        const { navigation } = this.props;
          navigation.navigate(
            'Basket',
          )
        return fail
      }
  
      try{
        let store = await getSelectStore(this.state.store)
        this.setState({store: store}) 
        if (this.state.store.open === "no"){
          alert('shop closed! opens at 8am')
          fail = true
          return fail
        }
        await this.asyncForEach(items, async (basketItem) => { 
          let dbItem = await getSelectProduct(basketItem.info, this.onRetrieved)   
          if (parseInt(dbItem.price) == parseInt(basketItem.info.price)){
            console.log('price equal')
          }
          else{
            console.log('price not equal')
            fail = true
            alert(basketItem.name + "'s price has changed since you added it to your basket.\nPlease review the updated price and checkout agian")
          }
          if (parseInt(dbItem.stock) >= parseInt(basketItem.qty)){
            console.log('product still in stock')
          }
          else{
            console.log('product not in stock')
            fail = true
            alert("Not enough " + basketItem.name + ' in stock.\nPlease revise your basket and checkout again')
          }
        
        if (fail === true){
          const { navigation } = this.props;
          navigation.navigate(
            'Basket',
          )
          console.log('fail on checkoutcheck i.e 1 '+ fail)
          return fail
        }
        })
        setTimeout(()=> {console.log("waiting")}, 1000)
        } catch (error) {
          console.warn(error)
          alert('Error: please try again or restart')
        }
        //setTimeout(()=> {console.log("waiting")}, 1000)
        return fail
    }

    onClickSubmit = async () => {
      await this.storeLocalData("checkoutName",  this.state.name)
      await this.storeLocalData("checkoutAddr", this.state.address)
      await this.storeLocalData("checkoutHouse", this.state.house)
      await this.storeLocalData("checkoutPhone", this.state.phoneNumber)
      alert("your order is being submitted \n please wait...")
      const { navigation } = this.props;
      navigation.navigate(
        'Payment',
        {order: this.state}
      )
/*
      try{
         await this.checkOutCheck().then( async (fail)=>{
          console.log('fail on submit i.e 2 '+ fail)
          if (fail === false){

            //setTimeout(async ()=> {await this.sendAlert(this.state)}, 1000) //comment only in test
            await addOrder(this.state, this.onOrderUploaded)
            await this.clearAllLocalData()
            let prods =  this.basket
            await this.asyncForEach(prods,async (prod)=>{//change to asyncforech
              let dbItem = await getSelectProduct(prod.info)
              prod.info.amt = prod.qty//TBC for cloud security rules i.e allow update if data.new == data.old - prod.info.amt
              prod.info.stock = Math.max(dbItem.stock - prod.qty,0)
              await updateProduct(prod.info, this.onProductUploaded)
            })
          }
          else if (fail === true){
            console.log('checkout failed')
            alert('please revise your basket')
          }
        })
      } catch (error) {
        console.warn(error)
        alert('Error: please try again or restart')
      }
      await this.storeHistory()

      navigation.navigate(
        'Order Complete',
        {total: this.state.total}
      )
  */
    }

 
    


    checkValidity = async () => {
      this.state.disableSubmit = false
      //check name
      if (this.state.name === null || this.state.name === ""){
        console.log('invalid name')
        this.state.invalidName = true
      }
      else{
        this.state.invalidName = false
      }
      //check phoneNumber
      if ((this.state.phoneNumber) === null || (this.state.phoneNumber) === "" ){
        console.log('invalid phone')
        this.state.invalidPhone = true
      }
      else{
        this.state.invalidPhone = false
      }
      //check phoneNumber2
      if (this.state.phoneNumber2 !== this.state.phoneNumber){
        console.log('invalid phone')
        this.state.invalidPhone2 = true
      }
      else{
        this.state.invalidPhone2 = false
      }
      //check address
      if (this.state.address === null || this.state.address === ""){
        console.log('invalid address')
        this.state.invalidAddress = true
      }
      else{
        this.state.invalidAddress = false
      }
      //check house
      if (this.state.house === null || this.state.house === ""){
        console.log('invalid address')
        this.state.invalidHouse = true
      }
      else{
        this.state.invalidHouse = false
      }

      
      if (this.state.invalidAddress || this.state.invalidPhone || this.state.invalidPhone2 || this.state.invalidName ){
        this.state.disableSubmit = true
      }
      else if (this.state.invalidAddress && this.state.invalidPhone && this.state.invalidPhone2 && this.state.invalidName){
        this.state.disableSubmit = false
      }

      console.log(this.state.invalidAddress)
      console.log(this.state.invalidPhone)
      console.log(this.state.invalidName)
      console.log(this.state.disableSubmit)


      //CHANGE TO ASYNCSTORE(checkoutname, checkoutaddr, checkouthouse, checkoutphone)
      /*
      await storeLocalData("checkoutName",  this.state.name)
      await storeLocalData("checkoutAddr", this.state.address)
      await storeLocalData("checkoutHouse", this.state.house)
      await storeLocalData("checkoutPhone", this.state.phoneNumber)
      */

      /*
      defaultCheckout.name = this.state.name
      defaultCheckout.address = this.state.address
      defaultCheckout.house = this.state.house
      defaultCheckout.phoneNumber = this.state.phoneNumber
      */

      console.log(defaultCheckout.name )

      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})

    }
    


    render(){
        return(
            <ScrollView style = {orderFormStyles.regForm}>
                <View style = {{marginBottom: 300}}>
                <Text style = {orderFormStyles.header} >delivery details</Text>

                <Text style = {orderFormStyles.subHeader} >your name</Text>
                <TextInput style = {this.state.invalidName === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g. Ola"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.name}
                  onChangeText={(text) =>{
                    this.setState({ name: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>
             

                <Text style = {orderFormStyles.subHeader} >house number:</Text>  
                <TextInput style = {this.state.invalidHouse === false? orderFormStyles.textInput: orderFormStyles.textInputBad }
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g A123"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.house}
                  onChangeText={(text) =>{
                     this.setState({ house: text})
                     setTimeout(()=>this.checkValidity(),500)
                     }}/>

                <Text style = {orderFormStyles.subHeader} >street number/name: </Text>  
                <TextInput style = {this.state.invalidAddress === false? orderFormStyles.textInput: orderFormStyles.textInputBad }
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g. road 3"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.address}
                  onChangeText={(text) =>{
                     this.setState({ address: text})
                     setTimeout(()=>this.checkValidity(),500)
                     }}/>

                <Text style = {orderFormStyles.subHeader} >your contact number</Text>  
                <TextInput style = {this.state.invalidPhone === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g 0801 234 5678"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.phoneNumber}
                  onChangeText={(text) =>{
                    this.setState({ phoneNumber: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>

                <Text style = {orderFormStyles.subHeader} >confirm contact number</Text>  
                <TextInput style = {this.state.invalidPhone2 === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g 0801 234 5678"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.phoneNumber2}
                  onChangeText={(text) =>{
                    this.setState({ phoneNumber2: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>

              



              <View style = {{marginBottom: 300}}>
                <Text style = {orderFormStyles.header} >payment details</Text>

               

                <Text style = {orderFormStyles.subHeader} >email address</Text>
                <TextInput style = {this.state.invalidName === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g. Ola"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.email}
                  onChangeText={(text) =>{
                    this.setState({ email: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>

                <Text style = {orderFormStyles.subHeader} >Card number</Text>  
                <TextInput style = {this.state.invalidPhone === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g 1234 5678 9876 5432"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.cardNumber}
                  onChangeText={(text) =>{
                    this.setState({ cardNumber: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>

                <Text style = {orderFormStyles.subHeader} >CVC 3-digit number</Text>  
                <TextInput style = {this.state.invalidPhone === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g 234"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.cvc}
                  onChangeText={(text) =>{
                    this.setState({ cvc: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>

                <Text style = {orderFormStyles.subHeader} >Expirty date</Text>  
                <TextInput style = {this.state.invalidPhone === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"MMYY"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.expiry.month + this.state.expiry.year}
                  onChangeText={(text) =>{
                    if (text.length == 4){
                    let vExpiry = this.state.expiry
                    vExpiry.month = text[0]+text[1] 
                    vExpiry.year = text[2] + text[3]
                    this.setState({ expiry: vExpiry})
                    setTimeout(()=>this.checkValidity(),500)
                    }}}/>
                    
             
                    </View>

                <TouchableOpacity 
                  disabled = {this.state.disableSubmit}
                  style = {this.state.disableSubmit === false? orderFormStyles.loadButton: orderFormStyles.modalDisabledButton} 
                  onPress = {() => this.onClickSubmit()}>
                  <Text style = {orderFormStyles.buttonText}>SUBMIT</Text>
                </TouchableOpacity>

                <Text style={orderFormStyles.modalText}>your total is: N {this.state.total + 100 + this.state.total * 0.015} </Text> 

                <Text style={orderFormStyles.titleText}>items: N {this.state.total} </Text> 
                <Text style={orderFormStyles.titleText}>paayment charges: N {100 + this.state.total * 0.015} </Text> 

                </View>

                
            </ScrollView>
      
        )
    }

}


const orderFormStyles = StyleSheet.create({
  modalPic:{
    marginTop: hp(percWidth(25)),
    width: hp(percWidth(250)),
    height: hp(percHeight(250)),
    alignSelf:'center'
  },
  modalDisabledButton: {
    margin: hp(percHeight(10)),
    marginTop:  hp(percHeight(10)),
    marginBottom:  hp(percHeight(20)),
    alignItems: 'stretch',
    paddingTop:  hp(percHeight(10)),
    paddingBottom:  hp(percHeight(10)),
    backgroundColor: 'grey',
  },
  topText: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    marginTop:  hp(percHeight(100)),
    padding:  hp(percHeight(5)),
    textAlign: 'center',
  },
  modalText: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding:  hp(percHeight(5)),
    textAlign: 'center',
  },
  modalSmallText: {
    fontWeight: 'bold',
    fontSize: 15,
    alignSelf: 'center',
    padding:  hp(percHeight(5)),
    textAlign: 'center',
  },
    regForm: {
      alignSelf : 'center',
      width: hp(percHeight(450)),
      
    },
    header: {
      fontSize: 24,
      color: 'black',
      paddingBottom:  hp(percHeight(10)),
      marginBottom:  hp(percHeight(40)),
      borderBottomColor: 'white',
      borderBottomWidth: 1,
      fontWeight: 'bold',
    },
    subHeader:{
      fontSize: 14,
      color: 'black',
      borderBottomColor: 'white' ,
      borderBottomWidth: 1,
      fontWeight: 'bold',
      marginBottom:  hp(percHeight(50)),
    },
    textInputBad:{
      alignSelf: 'stretch',
      height:  hp(percHeight(40)),
      marginBottom:  hp(percHeight(30)),
      color: 'black',
      borderBottomColor: 'red' ,
      borderBottomWidth: 1,
    },
    textInput:{
      alignSelf: 'stretch',
      height:  hp(percHeight(40)),
      marginBottom:  hp(percHeight(30)),
      color: 'black',
      borderBottomColor: 'black' ,
      borderBottomWidth: 1,
    },

  loadButton: {
    margin:  hp(percHeight(10)),
    marginTop:  hp(percHeight(10)),
    marginBottom:  hp(percHeight(20)),
    alignItems: 'stretch',
    paddingTop:  hp(percHeight(10)),
    paddingBottom:  hp(percHeight(10)),
    backgroundColor: 'black',
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
 
  modal: { 
    marginTop:  hp(percHeight(50)),
    alignContent: 'center',
   },

  modalText: {
    fontWeight: 'bold',
    fontSize:  20,
    alignSelf: 'center',
    padding: 5,
    textAlign: 'center',
  },

  titleText: {
    fontWeight: 'bold',
    fontSize:  12,
    alignSelf: 'center',
  },

  
})
    







    





