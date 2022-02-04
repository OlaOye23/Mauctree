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
import logo from '../../../assets/logo.png'

//import { Expo } from 'expo-server-sdk';

//import uuid from 'react-native-uuid'



export default class OrderForm extends Component{
    constructor(props){
        super(props)
        this.basket = []
        this.state = {
            
            location: "Ikota Complex",
            
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

  
  
    


    render(){
        return(
          <View style = {{backgroundColor: 'white', height: '110%'}}>
            <ScrollView style = {locationStyles.regForm}>
                <View style = {{marginBottom: 300}}>
                <Image source = {logo} style = {locationStyles.modalPic} />
                <Text style = {locationStyles.header} >select your location</Text>

                {/*<Text style = {orderFormStyles.subHeader} >select location {"\n"}(currently only available in VGC):</Text> */}
                <Picker
                  selectedValue={this.state.location}
                  style = {this.state.location !== ""? locationStyles.textInput: locationStyles.textInputBad}
                  onValueChange={(itemValue, itemIndex) => {
                    this.setState({ location: itemValue })
                  }}>
                  <Picker.Item label="Ikota Complex" value="Ikota Complex" />
                  <Picker.Item label="VGC and nearby" value="VGC" />
                  <Picker.Item label="Chevron and nearby" value="Chevron" />
                  <Picker.Item label="Abraham Ades. and nearby" value="Abraham Ades" />
                  <Picker.Item label="Ikota Villa and nearby" value="Ikota Villa" />
                  <Picker.Item label="Eleganza and nearby" value="Eleganza" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>


                <Text style = {locationStyles.header} >enter your phone number: </Text>
                <TextInput style = {this.state.invalidPhone2 === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g 0809 790 8824"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.phoneNumber2}
                  onChangeText={(text) =>{
                    this.setState({ phoneNumber2: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>


                <TouchableOpacity 
                  disabled = {(this.state.location == "")}
                  style = {(this.state.location == "") === false? locationStyles.loadButton: locationStyles.modalDisabledButton} 
                  onPress = {() => {
                    if (!(this.state.location == "")){
                      this.onClickSubmit() 
                    }} }>
                  <Text style = {locationStyles.buttonText}>CONTINUE</Text>
                </TouchableOpacity>

                </View>
                
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
      paddingTop:  hp(percHeight(50)),
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
      alignSelf:'center'
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
    margin:  hp(percHeight(10)),
    marginTop:  hp(percHeight(10)),
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
    







    





