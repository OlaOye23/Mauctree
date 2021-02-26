import React, {Component} from 'react'
import {StyleSheet, Image, TextInput, TouchableOpacity, View, ScrollView} from 'react-native'
import {Button, Text} from 'react-native-elements'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'
import logo from '../../../assets/logo.png'



export default class OrderComplete extends Component{
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
            total: 0,
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
    this.setState({total : order.total,
                   phoneNumber: order.phoneNumber,
                  address: order.address,
                  house: order.house,
                  name: order.name})
  }



  onClosePage = () => {
    const { navigation } = this.props
    navigation.navigate('More Apps')
  }
    


   
    


    render(){
        return(
         
            
            <ScrollView style = {orderCompleteStyles.regForm}>
              <View style = {{marginBottom: 300}}>
                  <Image source = {logo} style = {orderCompleteStyles.modalPic} />
                      <View style={orderCompleteStyles.modal}>
                        <Text style = {orderCompleteStyles.modalText}>your order has been submitted! </Text>
                        <Text style = {orderCompleteStyles.modalText}>we're on our way!</Text>
                        <Text style = {orderCompleteStyles.modalText}>thank you for shopping with us! </Text>
                          
                        <Text style = {orderCompleteStyles.modalSmallText}>{"\n"} expect our call in 1 minute </Text>
                        <Text style = {orderCompleteStyles.modalSmallText}>expect delivery in between 30 minutes and 2 hours</Text>
                        
                        <Text style = {orderCompleteStyles.modalSmallText}>{"\n"} name: {this.state.name}</Text>
                        <Text style = {orderCompleteStyles.modalSmallText}>amount due: N{this.state.total}</Text>
                        <Text style = {orderCompleteStyles.modalSmallText}>phone number: {this.state.phoneNumber}</Text>
                        <Text style = {orderCompleteStyles.modalSmallText}>address {this.state.house + " " + this.state.address}</Text>

                        <TouchableOpacity 
                          style = {orderCompleteStyles.loadButton} 
                          onPress = {() => this.onClosePage() }>
                          <Text style = {orderCompleteStyles.buttonText}>CLOSE</Text>
                        </TouchableOpacity>

                      </View>
                    </View>
                  </ScrollView>
      
        )
    }

}


const orderCompleteStyles = StyleSheet.create({
  modalPic:{
    marginTop: wp(percWidth(25)),
    width: hp(percHeight(250)),
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
      marginBottom:  hp(percHeight(40)),
      borderBottomColor: 'white',
      borderBottomWidth: 1,
      fontWeight: 'bold',
    },
    subHeader:{
      fontSize: hp(percHeight(14*1.25)),
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
    







    





