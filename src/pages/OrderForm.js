import React, {Component} from 'react'
import {addOrder, updateProduct} from '../api/ShopsApi'
import {StyleSheet, Modal, Image, TextInput, TouchableOpacity, View, ScrollView} from 'react-native'
import {Button, Text} from 'react-native-elements'
import { Dropdown } from 'react-native-material-dropdown';
import Geocoder from 'react-native-geocoding'; 
import { AsyncStorage } from 'react-native';
//import { fetch } from 'node-fetch';// not used-- only useful if outside node environment e.g firebase else: error


export default class OrderForm extends Component{
    constructor(props){
        super(props)
        this.basket = []
        this.state = {
            id: null,
            status: null,
            customer: null,
            address: null,
            longitude: null, 
            latitude: null,
            long2dp: null,
            lat2dp: null,  
            geoAddress: null,
            phoneNumber: null,
            style: null,
            basket: [],
            timeOpened: null,
            timeClosed: null,
            total: 0,
            modalVisible: false,
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
    console.log(this.state)
  }

    getAllLocalData = async () =>{
      console.log('in async get')
      await AsyncStorage.getAllKeys( async (err, keys) => {
        await AsyncStorage.multiGet(keys, async (err, stores) => {
          stores.map((result, i, store) => {
            let key = store[i][0];
            let value = store[i][1];
            let prodObj = JSON.parse(value)
            console.log(prodObj.qty)
            if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
              this.basket.push(prodObj)
              console.log('hahaha'+this.basket)
            }
          });
        });
        this.setState({basket : this.basket})
        console.log('1',this.state.basket)
        console.log('done')   
      });
      console.log('out async get')
    }

    clearAllLocalData = async () =>{
      console.log('in async get')
      await AsyncStorage.getAllKeys( async (err, keys) => {
        await AsyncStorage.multiGet(keys, async (err, stores) => {
          stores.map(async (result, i, store) => {
            let key = store[i][0];
            let value = store[i][1];
            let prodObj = JSON.parse(value)
            console.log(prodObj.qty)
            if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
              await AsyncStorage.setItem(key, JSON.stringify({"null": "null"}))
            }
          });
        });
        console.log('done')   
      });
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      console.log('out async get') 
    }

    storeLocalData = async (key, val) => {
      try {
        await AsyncStorage.setItem(key, val)
      } catch (error) {
        console.log(error)
        // Error saving data
      }
    }

    getGeolocation = async (address) =>{
        console.log('getting order geolocation')
        if (address === ''){
            console.log('no address entered')
            return
        }
        try{
            Geocoder.init('AIzaSyBLElYt7l1VCCCHI5l8nAlsWwYK6xe1KRk')
            json = await Geocoder.from(address+", Lagos, Nigeria")
            jsonLagos = await Geocoder.from("Lagos, Nigeria")
            let location = json.results[0].geometry.location
            let locationLagos = jsonLagos.results[0].geometry.location
            if (location.lat === locationLagos.lat && location.lng == locationLagos.lng){
                console.log('irreconcilable address')
                return
            }
            else{
                this.setState({latitude: location.lat, longitude: location.lng, address: address})
            }
        }
        catch(error){
            console.warn(error)
        }
    }


    getAddress = async (lat, long) => {
        Geocoder.init('AIzaSyBLElYt7l1VCCCHI5l8nAlsWwYK6xe1KRk')
        try{
            let json = await Geocoder.from(lat, long)
            let addressComponent = json.results[0].address_components[0]['short_name']+',' +json.results[0].address_components[1]['short_name'] + ','+json.results[0].address_components[2]['short_name'];
            console.log(addressComponent);
            this.setState({geoAddress: addressComponent})
            return addressComponent
        }
        catch(error){
            console.warn(error)
        }
    }

    updateLocation = async (address) => {
      console.log(this.state)
        //await this.getGeolocation(address)
        //await this.getAddress(this.state.latitude, this.state.longitude)
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
    sendPushNotification("ExponentPushToken[qY0HHeKM_FS_EwLWGjf0PI]") 
    console.log('new order alert complete')
    }

    onClickSubmit = async () => {
      console.log('order details ' + this.state)
      if(this.state.name !== null){
        await this.sendAlert(this.state)
        await addOrder(this.state, this.onOrderUploaded)
        this.clearAllLocalData()
        this.setState({modalVisible: true})
        let prods =  this.basket
        prods.forEach( async (prod)=>{
          prod.info.stock = prod.info.stock - prod.qty
          await updateProduct(prod.info, this.onProductUploaded)
        })
      }
    }

    onCloseModal = () => {
      const { navigation } = this.props
      navigation.navigate('Browse')
    }

    


    render(){
        return(
         
            
            <ScrollView style = {orderFormStyles.regForm}>
                <View style = {{marginBottom: 300}}>
                <Text style = {orderFormStyles.header} >delivery details</Text>

                <Text style = {orderFormStyles.subHeader}>your name</Text>
                <TextInput style = {orderFormStyles.textInput}
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g. Gbenga"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.name}
                  onChangeText={(text) => this.setState({ name: text })}/>

                <Text style = {orderFormStyles.subHeader} >your contact number</Text>  
                <TextInput style = {orderFormStyles.textInput}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g 0801 234 5678"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.phoneNumber}
                  onChangeText={(text) => this.setState({ phoneNumber: text})}/>
              

                <Text style = {orderFormStyles.subHeader} >delivery address</Text>  
                <TextInput style = {orderFormStyles.textInput}
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g A123, road 2, VGC"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.address}
                  onChangeText={(text) => this.setState({ address: text})}/>

                <TouchableOpacity style = {orderFormStyles.loadButton} onPress = {() => this.updateLocation(this.state.address)}>
                <Text style = {orderFormStyles.buttonText}>FIND ADDRESS</Text>
                </TouchableOpacity>


                <Text style = {orderFormStyles.subHeader} >nearby: {this.state.geoAddress} </Text>  
                
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


                <TouchableOpacity style = {orderFormStyles.loadButton} onPress = {this.onClickSubmit}>
                <Text style = {orderFormStyles.buttonText}>SUBMIT</Text>
                </TouchableOpacity>

                <Text style={listStyles.modalText}>your total is: N {this.state.total} </Text> 
                <Text style={listStyles.titleText}>We accept cash, card, and bank transfers </Text> 

                </View>

                <Modal visible={this.state.modalVisible} transparent={false}>
                  <ScrollView>
                      <View style={listStyles.modal}>
                      <Text style = {orderFormStyles.topText}> your order has been submitted </Text>
                      <Text style = {listStyles.modalText}> Expect our call in 1 minute </Text>
                      <Text style = {listStyles.modalText}> Expect your items in 15 minutes </Text>
                      <Text style = {listStyles.modalText}> Thank you for shopping with us! </Text>
                     
                      <TouchableOpacity 
                        style = {listStyles.modalButton} 
                        onPress = {() => this.onCloseModal() }>
                        <Text style = {listStyles.buttonText}>CLOSE</Text>
                      </TouchableOpacity>
                      </View>
                  </ScrollView>
                </Modal>
            </ScrollView>
      
        )
    }

}


orderFormStyles = StyleSheet.create({
  topText: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 100,
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
    regForm: {
      alignSelf : 'stretch',
      flex: 1,
      paddingTop: 50,
      backgroundColor: 'white',
      paddingLeft: 60,
      paddingRight: 60,
      
    },
    header: {
      fontSize: 24,
      color: 'black',
      paddingBottom: 10,
      marginBottom: 40,
      borderBottomColor: 'black' ,
      borderBottomWidth: 1,
      fontWeight: 'bold',
    },
    subHeader:{
      fontSize: 14,
      color: 'black',
      borderBottomColor: 'black' ,
      borderBottomWidth: 1,
      fontWeight: 'bold',
      marginBottom: 50,
    },
    textInput:{
      alignSelf: 'stretch',
      height: 40,
      marginBottom: 30,
      color: 'black',
      borderBottomColor: 'black' ,
      borderBottomWidth: 1,
    },
    description:{
      alignSelf: 'stretch',
      height: 40,
      margin: -5,
      padding: 5,
      marginBottom: 30, 
      color: 'black',
      borderBottomColor: 'black' ,
      borderBottomWidth: 1,
  },
  loadButton: {
    margin: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'black',
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#eee',
    width: '80%',
    height: 150
  },
  
})
    







    





