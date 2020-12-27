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
            order: {},
            email: "",
            cardNumber: "",
            cvv: "",
            expiryMonth: "",
            expiryYear: "",
            invalidEmail: true,
            invalidCardNo: true,
            invalidCVV: true,
            invalidMonth: true,
            invalidYear: true,
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
    const { order } = route.params;
    this.setState({order : order })

  }

  

    onProductUploaded = () =>{
      console.log('product stock updated')
      
    }


    onRetrieved = () =>{
      console.log('in callback onretrieved')
    }

    asyncForEach = async (array, callback) => {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    } 

    

    onClickSubmit = async () => {

      alert("your order is being submitted \n please wait...")
      const { navigation } = this.props;
      navigation.navigate(
        'Welcome',
      )

      try{
         await this.checkOutCheck().then( async (fail)=>{
          console.log('fail on submit i.e 2 '+ fail)
          if (fail === false){

            //setTimeout(async ()=> {await this.sendAlert(this.state)}, 1000) //undo comment only in test
            await addOrder(this.state.order, this.onOrderUploaded)
            await this.clearAllLocalData()
            let prods =  this.state.order.basket
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
        {order: this.state.order}
      )
    }

 
    


    checkValidity = async () => {
      this.state.disableSubmit = false

      if (this.state.email.includes("@") == false){
        console.log('invalid email')
        this.state.invalidEmail = true
      }
      else{
        this.state.invalidEmail = false
      }
      
      if ((this.state.carNumber).length !== 16){
        console.log('invalid cardNo')
        this.state.invalidCardNo = true
      }
      else{
        this.state.invalidCardNo = false
      }
      
      if ((this.state.cvv).length !== 3){
        console.log('invalid phone')
        this.state.invalidCVV = true
      }
      else{
        this.state.invalidCVV = false
      }
      
      if ((this.state.expiryMonth).length !== 2){
        console.log('invalid month')
        this.state.invalidMonth = true
      }
      else{
        this.state.invalidMonth = false
      }
      
      if ((this.state.expiryYear).length !== 2){
        console.log('invalid year')
        this.state.invalidYear = true
      }
      else{
        this.state.invalidYear = false
      }

      
      if (this.state.invalidEmail || this.state.invalidCardNo || this.state.invalidCVV || this.state.invalidMonth || this.state.invalidYear ){
        this.state.disableSubmit = true
      }
      else if  (this.state.invalidEmail && this.state.invalidCardNo && this.state.invalidCVV && this.state.invalidMonth && this.state.invalidYear ){
        this.state.disableSubmit = false
      }

      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})

    }
    


    render(){
        return(
            <ScrollView style = {orderFormStyles.regForm}>
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

                <Text style = {orderFormStyles.subHeader} >CVV 3-digit number</Text>  
                <TextInput style = {this.state.invalidPhone === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g 234"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.cvv}
                  onChangeText={(text) =>{
                    this.setState({ cvv: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>

                  <Text style = {orderFormStyles.subHeader} >Expiry Month (MM)</Text>  
                  <TextInput style = {this.state.invalidPhone === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g 02"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.expiryMonth}
                  onChangeText={(text) =>{
                    this.setState({ expiryMonth: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>

                  <Text style = {orderFormStyles.subHeader} >Expiry Year (YY)</Text>  
                  <TextInput style = {this.state.invalidPhone === false? orderFormStyles.textInput: orderFormStyles.textInputBad}
                  keyboardType="numeric"
                  placeholderTextColor = {'grey'}
                  placeholder = {"e.g 23"}
                  underlineColorAndroid= {'transparent'}
                  value={this.state.expiryYear}
                  onChangeText={(text) =>{
                    this.setState({ expiryYear: text})
                    setTimeout(()=>this.checkValidity(),500)
                    }}/>
                    
             
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
    







    





