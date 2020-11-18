import React, {Component} from 'react'
import {addOrder, updateProduct, getSelectStore, getSelectProduct} from '../../api/ShopsApi'
import {StyleSheet, Modal, Image, TextInput, TouchableOpacity, View, ScrollView} from 'react-native'
import {Button, Text} from 'react-native-elements'
import { Dropdown } from 'react-native-material-dropdown';
import Geocoder from 'react-native-geocoding'; 
import { AsyncStorage } from 'react-native';
import * as yup from 'yup';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'
import syncforeach from 'sync-foreach'
import * as defaultCheckout from '../../assets/defaultCheckout.json'



export default class OrderForm extends Component{
    constructor(props){
        super(props)
        this.basket = []
        this.state = {
            id: null,
            status: null,
            name: null,
            address: null,
            house: null,
            phoneNumber: null,
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
            invalidAddress: true,
            invalidHouse: true,
            store:{
              id: "bvUlmrcHZsUi6SpECE8y",//VGC STORE HARD CODE
              name: "VGC",
              open: ""
            },
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
    try{
      this.setState({name: JSON.parse(this.retrieveLocalData(deafultCheckoutName))})
      this.setState({phoneNumber: JSON.parse(this.retrieveLocalData(deafultCheckoutPhoneNumber))})
      this.setState({address: JSON.parse(this.retrieveLocalData(deafultCheckoutAddress))})
      this.setState({house: JSON.parse(this.retrieveLocalData(deafultCheckoutHouse))})
      this.checkValidity()
    }catch(error){
      console.warn(error)
    }
    
    //this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
  }

  setGeoLoc = async () =>{
    if (navigator.geolocation) {//if navigation is enabled
      const position =  await this.getCoordinates()
      lat = position.coords.latitude//.toFixed(4);
      long = position.coords.longitude//.toFixed(4);
      this.setState({latitude: lat, longitude: long})
      this.setState({lat2dp: parseFloat(lat).toFixed(2), long2dp: parseFloat(long).toFixed(2)})//not actually used here
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
              let prodObj = JSON.parse(value)
              if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
                this.basket.push(prodObj)
                console.log('hahaha'+this.basket)
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

    clearAllLocalData = async () =>{//actually: clearbasket only
      console.log('in async get')
      try{
        await AsyncStorage.getAllKeys( async (err, keys) => {
          await AsyncStorage.multiGet(keys, async (err, stores) => {
            stores.map(async (result, i, store) => {
              let key = store[i][0];
              let value = store[i][1];
              let prodObj = JSON.parse(value)
              if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
                await AsyncStorage.setItem(key, JSON.stringify({"": ""}))
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

    retrieveLocalData = async (key) => {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          // We have data!!
          console.log(value);
        }
        else{
          console.log('empty')
        }
      } catch (error) {
        console.warn(error)
        alert('Error: please try again or restart')
      }
      return value
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
    
    
    getGeolocation = async (address) =>{
        console.log('getting order geolocation')
        if (address === ''){
          console.log('no address entered')
          return
        }
        try{
          Geocoder.init('AIzaSyAitgbYx6XMFSzLbwMccZxQ6lQg32hFkPc')
          json = await Geocoder.from(address+" Victoria Garden City, Ajah, Lagos, Nigeria")
          let location = json.results[0].geometry.location
          this.setState({latitude: location.lat, longitude: location.lng, address: address})
          
          jsonLagos = await Geocoder.from(" Victoria Garden City, Ajah, Lagos, Nigeria")
          let locationLagos = jsonLagos.results[0].geometry.location
          if (location.lat === locationLagos.lat && location.lng == locationLagos.lng){
              console.log('irreconcilable address')
              return
          }
          else{
              this.setState({latitude: location.lat, longitude: location.lng, address: address})
          }
        } catch (error) {
            console.warn(error)
            alert('Error: please try again or restart')
        }
    }
    getAddress = async (lat, long) => {
      Geocoder.init('AIzaSyAitgbYx6XMFSzLbwMccZxQ6lQg32hFkPc')
      try{
          let json = await Geocoder.from(lat, long)
          let addressComponent = json.results[0].address_components[0]['short_name']+',' +json.results[0].address_components[1]['short_name'] + ','+json.results[0].address_components[2]['short_name'];
          this.setState({geoAddress: addressComponent})
          console.log(addressComponent)
          return addressComponent
      } catch (error) {
          console.warn(error)
          alert('Error: please try again or restart')
      }
    }




    
    updateLocation = async (address) => {
      await this.getGeolocation(address)
      await this.getAddress(this.state.latitude, this.state.longitude)
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
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
      }
      try{
        sendPushNotification("ExponentPushToken[qY0HHeKM_FS_EwLWGjf0PI]") 
      } catch (error) {
        console.warn(error)
        alert('Error: please try again or restart')
      }
    console.log('new order alert complete')
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
          dbItem = await getSelectProduct(basketItem.info, this.onRetrieved)   
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
      fail = true
      try{
         await this.checkOutCheck().then( async (fail)=>{
          console.log('fail on submit i.e 2 '+ fail)
          if (fail === false){
            //await this.sendAlert(this.state) //comment only in test
            await addOrder(this.state, this.onOrderUploaded)
            await this.clearAllLocalData()
            this.setState({modalVisible: true})
            let prods =  this.basket
            prods.forEach( async (prod)=>{
              dbItem = await getSelectProduct(prod.info)
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
    }

    onCloseModal = () => {
      const { navigation } = this.props
      navigation.navigate('Find a Product')
    }
    


    checkValidity = () => {
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

      
      if (this.state.invalidAddress || this.state.invalidPhone || this.state.invalidName){
        this.state.disableSubmit = true
      }
      else if (this.state.invalidAddress && this.state.invalidPhone && this.state.invalidName){
        this.state.disableSubmit = false
      }

      console.log(this.state.invalidAddress)
      console.log(this.state.invalidPhone)
      console.log(this.state.invalidName)
      console.log(this.state.disableSubmit)
      
      try{
        this.storeLocalData("deafultCheckoutName", JSON.stringify(this.state.name))
        this.storeLocalData("deafultCheckoutPhoneNumber", JSON.stringify(this.state.phoneNumber))
        this.storeLocalData("deafultCheckoutAddress", JSON.stringify(this.state.address))
        this.storeLocalData("deafultCheckoutHouse", JSON.stringify(this.state.house))
      } catch(error){
        console.warn(error)
      }

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

               {/* <TouchableOpacity style = {orderFormStyles.loadButton} onPress = {() => this.updateLocation(this.state.address)}>
                <Text style = {orderFormStyles.buttonText}>FIND CLOSE BY</Text>
                    </TouchableOpacity> 
                {<Text style = {orderFormStyles.subHeader} >nearby: {this.state.geoAddress} </Text>  
                */}
                
                {/*
                <Text style = {orderFormStyles.subHeader} >longitude</Text>  
                <TextInput style = {orderFormStyles.textInput}
                  placeholderTextColor = {'grey'}
                  placeholder = {"This will load automatically"}
                  underlineColorAndroid= {'transparent'}
                  value={String(this.state.longitude)}
                  onChangeText={(text) => this.setState({ longitude: text})}/>
                
                <Text style = {orderFormStyles.subHeader} >latitude</Text>  
                <TextInput style = {orderFormStyles.textInput}
                  placeholderTextColor = {'grey'}
                  placeholder = {"This will load automatically"}
                  underlineColorAndroid= {'transparent'}
                  value={String(this.state.latitude)}
                  onChangeText={(text) => this.setState({ latitude: text})}/> 
                */}


                <TouchableOpacity 
                  disabled = {this.state.disableSubmit}
                  style = {this.state.disableSubmit === false? orderFormStyles.loadButton: orderFormStyles.modalDisabledButton} 
                  onPress = {this.onClickSubmit}>
                  <Text style = {orderFormStyles.buttonText}>SUBMIT</Text>
                </TouchableOpacity>

                <Text style={orderFormStyles.modalText}>your total is: N {this.state.total} </Text> 
                <Text style={orderFormStyles.titleText}>We accept cash, card, and bank transfers </Text> 

                </View>

                <Modal visible={this.state.modalVisible} transparent={false}>
                  <ScrollView>
                  <Image source = {{uri:'./logo.png'}} style={orderFormStyles.modalPic}/>
                      <View style={orderFormStyles.modal}>
                      <Text style = {orderFormStyles.modalText}>We're on our way!</Text>
                      <Text style = {orderFormStyles.modalText}>your order has been submitted! {"\n"}</Text>
                      <Text style = {orderFormStyles.modalSmallText}>phone number:{this.state.phoneNumber}</Text>
                      <Text style = {orderFormStyles.modalSmallText}>address {this.state.address + " " + this.state.address}</Text>
                      <Text style = {orderFormStyles.modalText}>{"\n"} Expect our call in 1 minute </Text>
                      <Text style = {orderFormStyles.modalText}>Expect delivery in 15 minutes </Text>
                      <Text style = {orderFormStyles.modalText}>Thank you for shopping with us! </Text>
                     
                      <TouchableOpacity 
                        disabled = {this.state.disableSubmit }
                        style = {orderFormStyles.loadButton} 
                        onPress = {() => this.onCloseModal() }>
                        <Text style = {orderFormStyles.buttonText}>CLOSE</Text>
                      </TouchableOpacity>
                      </View>
                  </ScrollView>
                </Modal>
            </ScrollView>
      
        )
    }

}


orderFormStyles = StyleSheet.create({
  modalPic:{
    width: wp(percWidth(250)),
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
      alignSelf : 'stretch',
      flex: 1,
      paddingTop:  hp(percHeight(50)),
      backgroundColor: 'white',
      paddingLeft:  hp(percHeight(60)),
      paddingRight:  hp(percHeight(60)),
      
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
    







    




