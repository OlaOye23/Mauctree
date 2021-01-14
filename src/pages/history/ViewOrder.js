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
//import { TouchableOpacity } from 'react-native' 




export default class ViewOrder extends React.Component{
  constructor(props){
      super(props)
      this.current = undefined
      this.state = {
          orders: [],
          modalVisible : false,
          forceRefresh: Math.floor(Math.random() * 100000000),//to force a re-render
          //current: undefined,
          refreshing: false,
          stock: 0,
          token: "",  
      }
  }

 
  

  componentDidMount = async () =>{
    const { route } = this.props;
    const { current } = route.params;


    this.setState({ current: current})
    

  }





  onCloseModal= () => {
    //set modalVisible to false
    const { navigation } = this.props;
    navigation.navigate(
      'My Orders'
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

    //this.componentDidMount()
    
  return (
      
      <View style = {orderHistoryStyles.allContainer}>


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

        </View>
  );
}
}


const orderHistoryStyles = StyleSheet.create({
  
  productPic:{
    width: hp(percWidth(80)),
    height: hp(percWidth(80)),
    margin: hp(percWidth(5)),

  },

  modal: { 
    marginTop: hp(percWidth(50)),
    alignContent: 'center',
   },

  

  modalTextFirst: {
    marginTop: hp(percWidth(50)),
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding: hp(percWidth(5)),
    textAlign: 'center',
  },

  modalText: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding: hp(percWidth(5)),
    textAlign: 'center',
  },
 
  
  modalButton: {
    margin: hp(percWidth(5)),
    marginTop: hp(percWidth(5)),
    marginBottom: hp(percWidth(5)),
    alignItems: 'stretch',
    paddingTop: hp(percWidth(10)),
    paddingBottom: hp(percWidth(10)),
    backgroundColor: 'black',
  },

  
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
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
  
  titleText: {
    fontWeight: 'bold',
    fontSize: 12,
    alignSelf: 'center',
  },
  
  
  
  orderPic:{
    width: "20%",//hp(percWidth(80)),
    height: wp("20%") < hp(percHeight(80))? wp("20%") : hp(percHeight(80)),
    margin: hp(percWidth(5)),

  },
  
  


})

