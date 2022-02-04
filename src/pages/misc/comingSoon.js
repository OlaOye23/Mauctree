import React, {Component} from 'react'
import {addOrder, updateProduct, getSelectStore, getSelectProduct} from '../../api/ShopsApi'
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

//import uuid4 from "uuid4"
import { TouchableOpacity } from '../../web/react-native-web';//'react-native' //
//import logo from '../../../assets/ad2.png'

//import { Expo } from 'expo-server-sdk';

//import uuid from 'react-native-uuid'



export default class OrderForm extends Component{
    constructor(props){
        super(props)
        this.basket = []
        this.state = {
            
            location: "VGC",
            
        }
    }


  


  componentDidMount = async () =>{
    
  }

  onClickSubmit = () =>{
    const { navigation } = this.props;
    navigation.navigate(
      'Search Products'
    )
  }

  onMoreInfo = () =>{
    let msg = `Hello, I want these items: %0A %0A`
    let chat = `http://api.whatsapp.com/send?text=${msg}&phone=+2348097908824`
    Linking.openURL(chat)
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
        return(
          <View style = {{backgroundColor: 'white', height: '110%'}}>
            <ScrollView style = {locationStyles.regForm}>
                <View style = {{marginBottom: 10}}>
                <Image source = {logo} style = {locationStyles.modalPicBig} />
                </View>
                <TouchableOpacity 
                  style = {locationStyles.loadButton} 
                  onPress = {() => {
                    this.openGps(6.464037,3.555225)
                    } }>
                  <Text style = {locationStyles.buttonText}>LOCATE STORE</Text>
                </TouchableOpacity>
                {/*<TouchableOpacity 
                  style = {locationStyles.loadButton} 
                  onPress = {() => {
                     this.onMoreInfo()
                    } }>
                  <Text style = {locationStyles.buttonText}>WHATSAPP</Text>
                </TouchableOpacity>*/}
                <TouchableOpacity 
                  style = {locationStyles.loadButton} 
                  onPress = {() => {
                    this.makeCall(+2348097908824)
                    } }>
                  <Text style = {locationStyles.buttonText}>CALL US</Text>
                </TouchableOpacity>
                
                
            </ScrollView>
            </View>
      
        )
    }

}


const locationStyles = StyleSheet.create({
  modalPic:{
    marginTop: hp(percWidth(5)),
    width: hp(percHeight(250)),
    height: hp(percHeight(250)),
    alignSelf:'center',
    marginBottom:  hp(percHeight(20)),
  },
  modalPicBig:{
    //marginTop: hp(percWidth(5)),
    width: hp(percHeight(500)),
    height: hp(percHeight(500)),
    alignSelf:'center',
    //marginBottom:  hp(percHeight(20)),
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
      alignSelf : 'center',
      flex: 1,
      paddingTop:  hp(percHeight(0)),//hp(percHeight(50)),
      backgroundColor: 'white',
      paddingLeft:  hp(percHeight(60)),
      paddingRight:  hp(percHeight(60)),
      width: wp("100%") < hp(percHeight(450))? wp("100%") : hp(percHeight(450)),
      
    },
    header: {
      fontSize: hp(percHeight(24*1.25)),
      color: 'black',
      paddingBottom:  hp(percHeight(10)),
      marginBottom:  hp(percHeight(20)),
      //borderBottomColor: 'white',
      //borderBottomWidth: 1,
      fontWeight: 'bold',
      alignSelf:'center',
      justifyContent: 'center',
    },
    subHeader:{
      fontSize: hp(percHeight(14*1.25)),
      color: 'black',
      //borderBottomColor: 'white' ,
      //borderBottomWidth: 1,
      fontWeight: 'bold',
      marginBottom:  hp(percHeight(20)),
      alignSelf:'center'
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
    //margin:  hp(percHeight(10)),
    //marginTop:  hp(percHeight(10)),
    marginBottom:  hp(percHeight(20)),
    alignItems: 'stretch',
    paddingTop:  hp(percHeight(10)),
    paddingBottom:  hp(percHeight(10)),
    backgroundColor: 'black',
  },
  buttonText: {
    marginTop: hp(percHeight(0)),
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

  
})
    







    





