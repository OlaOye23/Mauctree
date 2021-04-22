import React, {Component} from 'react'
import {addOrder, updateProduct, getSelectStore, getSelectProduct, addSale} from '../../api/ShopsApi'
import {StyleSheet, Modal, Image, TextInput, View, ScrollView, Picker, Linking, Platform} from 'react-native'
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
        this.total = 0 
        this.otherTotal = 0
        this.immediateTotal = 0
        this.state = {
            id: null,
            status: null,
            name: "",
            location: "VGC",
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
            /*cardNumber: "",
            cvc: "",
            expiry: {
              month: "",
              year: "",
            },*/
            type: "Evening",
            discount: 0,
            location: "VGC",
            loadingPic: false,
            
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

  getAllLocalData = async () =>{
    console.log('in async get')
    this.total = 0
    this.otherTotal = 0
    this.immediateTotal = 0
    try{
    await AsyncStorage.getAllKeys( async (err, keys) => {
      await AsyncStorage.multiGet(keys, async (err, stores) => {
        stores.map( async (result, i, store) => {
          let key = store[i][0];
          let value = store[i][1];
          try{
            let prodObj = JSON.parse(value)
            console.log(prodObj.qty)
            if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
              this.total += parseInt(prodObj.qty) * parseInt(prodObj.info.price)
              if (!prodObj.info.shop ){
                this.immediateTotal += parseInt(prodObj.qty) * parseInt(prodObj.info.price)
                this.basket.push(prodObj)
                //console.log('hahaha'+this.basket)
              }
              else{
                this.otherTotal += parseInt(prodObj.qty) * parseInt(prodObj.info.price)
                this.basket.push(prodObj)
                //alert(prodObj.info.price)
                //console.log('hahaha'+this.basket)
              }
            }
          }catch(error){
            console.warn(error)
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

    /*getAllLocalData = async () =>{//old version without total
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
    }*/

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
                  total: this.state.total + this.state.discount ,  
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
    
    /*sendAlertSDK = async (orderObj) =>{//NO LONGER USED- replaced
      let expo = new Expo();
      let messages = []
      const message = {
        to: config.PUSH_TOKEN,
        sound: 'default',
        title: 'New Order!',
        body: 'Open app to see details',
        data: { name: orderObj.name,
                address: orderObj.address,
                total: orderObj.immediateTotal + orderObj.otherTotal,  
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
    }*/


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

      if (this.total < 0){//MINIMUM ORDER CHECK
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
          if (!dbItem.shop){
            if (parseInt(dbItem.stock) >= parseInt(basketItem.qty)){
              console.log('product still in stock')
            }
            else{
              console.log('product not in stock')
              fail = true
              alert("Not enough " + basketItem.name + ' in stock.\nPlease revise your basket and checkout again')
            }
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
      this.setState({loadingPic: true})
      await this.storeLocalData("checkoutName",  this.state.name)
      await this.storeLocalData("checkoutAddr", this.state.address)
      await this.storeLocalData("checkoutHouse", this.state.house)
      await this.storeLocalData("checkoutPhone", this.state.phoneNumber)
      
      const { navigation } = this.props;
      
      let submit_error = false

      let items = this.basket
      let msg = "Order Items:%0A"
      let i = 1
      await this.asyncForEach(items, async (basketItem) => { 
        console.warn(basketItem)
        if (basketItem.info.price){//if basket item is a valid product
          basketItem.customer = this.state.name
          basketItem.location = this.state.location
          basketItem.type = this.state.type
          basketItem.DateText = this.timeConverter(Date.now())
          addSale(basketItem, this.saleComplete )
        }
        msg += "%20" + i + ")" + basketItem.name + " x " + basketItem.qty + "%0A"
        i += 1
        })
      msg += "%0AName: " + this.state.name + "%0A"
      msg += "Address: " + this.state.house + "%20" + this.state.address + "%0A"
      msg += "Location: " + this.state.location + "%0A"
      msg += "Type: " + this.state.type + "%0A"
      msg += "Total: N" + (this.state.total + this.state.discount) + "%0A"

  
      try{
         await this.checkOutCheck().then( async (fail)=>{
          console.log('fail on submit i.e 2 '+ fail)
          if (fail === false){

            //setTimeout(async ()=> {await this.sendAlert(this.state)}, 1000) //comment only in test
            this.state.DateText = this.timeConverter(Date.now())
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
            submit_error = true
          }
        })
      } catch (error) {
        console.warn(error)
        alert('Error: please try again or restart')
        submit_error = true
      }
      await this.storeHistory()
      alert("Your order has been submitted \nOur representative will contact you shortly")
      this.setState({loadingPic: false})
      
      if (submit_error == false){
       navigation.navigate(
        'More Apps',
        {order: this.state}
      )

      navigation.navigate(
        'Order Complete',
        {order: this.state}
      )
      }
      let link = `http://api.whatsapp.com/send?text=${msg}&phone=+2348110233359`
      Linking.openURL(link)
      
    }

 
    saleCOmplete = () =>{
      console.log('sale added')
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
      //check location
      if (this.state.location === null || this.state.location === ""){
        console.log('invalid location')
        this.state.invalidLocation = true
      }
      else{
        this.state.invalidLocation = false
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

    timeConverter= (UNIX_timestamp)=>{
      var a = new Date(UNIX_timestamp);
      //alert(a)
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
      //alert(time)
      return time;
    }

    


    render(){
        return(
          <View style = {{backgroundColor: 'white'}}>
            <View style = {orderFormStyles.regForm}>
                <View style = {{marginBottom: 300}}>
                <Text style = {orderFormStyles.header} >delivery details</Text>
                

                <View style = {{marginBottom: 50}}></View>

                <Text style = {orderFormStyles.subHeader} >your name:</Text>
                <TextInput style = {this.state.invalidName === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g. Ola"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.name}
                  onChangeText={(text) =>{
                    this.setState({ name: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>


                <Text style = {orderFormStyles.subHeader} >select your location</Text>  
                <Picker
                  selectedValue={this.state.location}
                  style = {this.state.location !== ""? orderFormStyles.picker: orderFormStyles.pickerBad}
                  onValueChange={(itemValue, itemIndex) => {
                    this.setState({ location: itemValue })
                    setTimeout(()=>this.checkValidity(),500)
                  }}>
                  <Picker.Item label="VGC" value="VGC" />
                  <Picker.Item label="Chevron Drive" value="Chevron Drive" />
                </Picker>
              
             
                
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

                <Text style = {orderFormStyles.subHeader} >street address: </Text>  
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

                <Text style = {orderFormStyles.subHeader} >when should we deliver?</Text> 
                <Picker
                  selectedValue={this.state.type}
                  style = {this.state.type !== ""? orderFormStyles.picker: orderFormStyles.pickerBad}
                  onValueChange={(itemValue, itemIndex) => {
                    this.setState({type: itemValue})
                    if (itemValue == "Immediate" ){
                      this.state.discount = 200
                    }
                    if (itemValue == "Evening" ){
                      this.state.discount = 0
                    }
                    if (itemValue == "Next Day" ){
                      this.state.discount = -1*(this.otherTotal) * .15
                    }
                    if (itemValue == "Scheduled" ){
                      this.state.discount = -1*(this.otherTotal) * .15
                    }
                    if (itemValue == "Subscribe" ){
                      this.state.discount = -1*(this.otherTotal) * .15
                    }
                    setTimeout(()=>this.checkValidity(),500)
                  }}>
                  <Picker.Item label="Evening --- FREE delivery" value="Evening" />
                  <Picker.Item label="Immediate -- N200 delivery" value="Immediate" />
                  <Picker.Item label="Next Day -- 15% off eligible items" value="Next Day" />
                  <Picker.Item label="Scheduled -- 15% off eligible items" value="Scheduled" />
                  <Picker.Item label="Subscribe -- 15% off eligible items" value="Subscribe" />
                </Picker>

                <Text style={orderFormStyles.modalText}>your total is: N {this.state.total + this.state.discount} </Text> 
                

                {/*<Text style={orderFormStyles.titleText}>items: N {this.state.total} </Text> 
                <Text style={orderFormStyles.titleText}>paayment charges: N {100 + this.state.total * 0.015} </Text> */}


                <TouchableOpacity 
                  disabled = {this.state.disableSubmit}
                  style = {this.state.disableSubmit === false? orderFormStyles.loadButton: orderFormStyles.modalDisabledButton} 
                  onPress = {() => {
                    if (!this.state.disableSubmit){
                      this.onClickSubmit() 
                    }} }>
                  <Text style = {orderFormStyles.buttonText}>PAY BY TRANSFER (WHATSAPP)</Text>
                </TouchableOpacity>

                <Image source = {{uri: require("../../../assets/loading.gif")}} style = {this.state.loadingPic == true? orderFormStyles.loadingPic: orderFormStyles.loadingPicHide} />

                {/*<Text style={orderFormStyles.modalSmallText}>OR DOWNLOAD APP FOR MORE PAYMENT OPTIONS </Text> 
                <TouchableOpacity 
                  style = {orderFormStyles.loadButton} 
                  onPress = {() => {
                    Linking.openURL("https://play.google.com/store/apps/details?id=com.adadevng.shopmob")
                  }}>
                  <Text style = {orderFormStyles.buttonText}>DOWNLOAD ANDROID APP </Text>
                </TouchableOpacity>*/}

                 {/* <TouchableOpacity 
                  style = {orderFormStyles.loadButton} 
                  onPress = {() => {
                    alert("MOBILE app coming soon (1 MONTH)...\n Please select PAY WITH WHATSAPP to continue")
                  }}>
                  <Text style = {orderFormStyles.buttonText}>DOWNLOAD APP </Text>
                  </TouchableOpacity>*/}
                

                </View>

                
            </View>
            </View>
      
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
    fontSize: hp(percHeight(20*1.25)),
    alignSelf: 'center',
    marginTop:  hp(percHeight(100)),
    padding:  hp(percHeight(5)),
    textAlign: 'center',
  },
  modalText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(20*1.25)),
    alignSelf: 'center',
    padding:  hp(percHeight(5)),
    textAlign: 'center',
  },
  modalSmallText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(15*1.25)),
    alignSelf: 'center',
    padding:  hp(percHeight(5)),
    textAlign: 'center',
  },
    regForm: {
      backgroundColor: 'white',
      alignSelf : 'center',
      width: wp("80%") < hp(percHeight(450))? wp("80%") : hp(percHeight(450)),//hp(percHeight(450)),
      
    },
    header: {
      fontSize: hp(percHeight(24*1.25)),
      color: 'black',
      paddingBottom:  hp(percHeight(10)),
      marginBottom:  hp(percHeight(40)),
      //borderBottomColor: 'white',
      //borderBottomWidth: 1,
      fontWeight: 'bold',
    },
    subHeader:{
      fontSize: hp(percHeight(14*1.25)),
      color: 'black',
      //borderBottomColor: 'white' ,
      //borderBottomWidth: 1,
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
    fontSize: hp(percHeight(12*1.25)),
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
    fontSize:  hp(percHeight(20*1.25)),
    alignSelf: 'center',
    padding: 5,
    textAlign: 'center',
  },

  titleText: {
    fontWeight: 'bold',
    fontSize:  hp(percHeight(12*1.25)),
    alignSelf: 'center',
  },
  picker:{
    marginBottom: 30,
  },
  loadingPic:{
    width: hp(percHeight(50)),
    height: hp(percHeight(50)),
    alignSelf:'center',
    alignContent: 'center',
  },
  loadingPicHide:{
    width: hp(percHeight(1)),
    height: hp(percHeight(1)),
    alignSelf:'center',
    alignContent: 'center',
  },

  
})
    







    





