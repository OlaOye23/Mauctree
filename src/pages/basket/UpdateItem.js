import React from 'react'
import {View, ScrollView, TextInput, Text, Image, StyleSheet} from 'react-native'
import {getSelectProduct, getSelectStore}from '../../api/ShopsApi'
import { AsyncStorage} from 'react-native'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'

import { TouchableOpacity } from '../../web/react-native-web'; //'react-native' //

import * as Analytics from 'expo-firebase-analytics';





export default class UpdateItem extends React.Component{
  constructor(props){
      super(props)
      this.basket = []
      this.total = 0
      this.state = {
          forceRefresh: Math.floor(Math.random() * 100000000),//to force a re-render
          itemObj:{
            name: null, 
            qty: "",
          },
          current: {},
          disableUpdateButton: false, 
      }
  }

   
  componentDidMount = async () =>{
    const { route } = this.props;
    const { current } = route.params;
    const { itemObj } = route.params;
    let item = JSON.parse(await AsyncStorage.getItem(current.name))
    itemObj.qty = item.qty
    this.setState({ current: current, itemObj: itemObj}, ()=>{
      this.onChangeQty(this.state.current,this.state.current.name, itemObj.qty)
      Analytics.logEvent('editItem', {
        item: this.state.current,
      })
    })
    this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    logErrorToMyService(error, errorInfo);
  }

  
  storeLocalData = async (key, val) => {
    try {
      await AsyncStorage.setItem(key, val)
    } catch (error) {
      console.warn(error)
      alert('Error: please try again or restart')
    }
  }

  
  onChangeQty = (info, name, qty) =>{
    this.setState({disableUpdateButton: true})
    if (parseInt(qty) < 0 || isNaN(parseInt(qty)) || qty == "" ){
      qty = 0
    }
    let obj = {info : info, name : name, qty : parseInt(qty)}
    this.setState({itemObj : obj})
    console.log(qty)
    console.log(this.state.itemObj.qty)
    console.log(this.state.current.stock)
    if ((qty == "") || (parseInt(qty) > parseInt(this.state.current.stock) ) ){//different from search page
      this.setState({disableUpdateButton: true})
    }
    else{
      this.setState({disableUpdateButton: false})
    }
    console.log('onChangeQty', this.state.itemObj)
  }

  onUpdateItem = () =>{
    //COPY TO ASYNCSTORAGE .....
    console.log(this.state.itemObj)
    if (this.state.itemObj.name){
      this.storeLocalData(this.state.itemObj.name, JSON.stringify(this.state.itemObj))
      let obj = {name: "", qty: ""}
      this.setState({itemObj: obj})
    }
    this.setState({disableUpdateButton: true})
    const { navigation } = this.props;
    navigation.navigate(
        'Basket',
        //{state: this.state}
    )
    alert("Item Added")
    console.log('onUpdateItem', this.state.itemObj)
  }


  onCancelUpdate = () => {
    let obj = {name: "", qty: ""}
    this.setState({itemObj: obj})
    this.setState({disableUpdateButton: true})
    const { navigation } = this.props;
    navigation.navigate(
        'Basket',
        //{state: this.state}
    )
    console.log('onCancelUpdate', this.state.obj)
  }


  render(){
    return (
      <View style = {{backgroundColor: 'white', height: '110%'}}>
          <View style={UpdateItemStyles.allContainer}>
            <ScrollView>
                <View style={UpdateItemStyles.modal}>
                <Text style = {UpdateItemStyles.modalText}>{this.state.current.name} </Text>
                <Image source = {{uri:this.state.current.imgURL}} style = {UpdateItemStyles.modalPic} />
                <Text style = {UpdateItemStyles.modalText}> N{this.state.current.price}</Text>
                {this.state.current.shop?
                <View>
                <Text style = {UpdateItemStyles.goodCenterTextBig}>(N{parseInt(parseInt(this.state.current.price*.90)/10)*10})</Text>
                <Text style = {UpdateItemStyles.goodCenterText}>select next day at checkout for 10% off</Text>
                </View>
                :
                <View>
                <Text style = {UpdateItemStyles.goodCenterText}>select immediate at checkout for 19m delivery</Text>
                </View>
                }

                
                <Text style = {UpdateItemStyles.modalText} >enter quantity:</Text>  
                {/*!this.state.current.shop &&
                <Text style = {parseInt(this.state.current.stock) > 0? UpdateItemStyles.goodCenterText: UpdateItemStyles.badCenterText} >
                    {this.state.current.stock} units available 
                </Text>  
                */}
                  <TextInput 
                    keyboardType="numeric"
                    style = {UpdateItemStyles.textInput}
                    placeholderTextColor = {'grey'}
                    placeholder = {String(0)}
                    underlineColorAndroid= {'transparent'}
                    value={String(this.state.itemObj.qty)}
                    onChangeText={(text) => this.onChangeQty(this.state.current,this.state.current.name, text)}
                  />
                <Text style = {UpdateItemStyles.badCenterText} >
                  {parseInt(this.state.itemObj.qty) > parseInt(this.state.current.stock)? "Not enough items in stock" : "" }
                </Text> 
                <Text style = {UpdateItemStyles.modalText}> Total: N{this.state.current.price * this.state.itemObj.qty}</Text>
                <TouchableOpacity 
                  disabled = {this.state.disableUpdateButton}
                  style = {this.state.disableUpdateButton === false? UpdateItemStyles.modalButton: UpdateItemStyles.modalDisabledButton} 
                  onPress = {() => this.onUpdateItem() }>
                  <Text style = {UpdateItemStyles.buttonText}>UPDATE QUANTITY</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {UpdateItemStyles.modalButton} onPress = {() => this.onCancelUpdate() }>
                  <Text style = {UpdateItemStyles.buttonText}>CANCEL</Text>
                </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
            </View>
  );
}
}


const UpdateItemStyles = StyleSheet.create({

  goodLeftText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    alignSelf: 'flex-start',
  },

  goodCenterText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: wp("100%") < hp(percHeight(450))? wp(percWidth(12*1.25)) : hp(percHeight(12*1.25)),
    marginLeft: hp(percWidth(5)),
    alignSelf: 'center',
  },


  goodCenterTextBig: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: wp("100%") < hp(percHeight(450))? wp(percWidth(20*1.25)) : hp(percHeight(20*1.25)),
    marginLeft: hp(percWidth(5)),
    alignSelf: 'center',
  },



  badCenterText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
  },

 
  
  

  modal: { 
    marginTop: hp(percHeight(25)),
    alignContent: 'center',
   },

  modalPic:{
    width: hp(percHeight(250)),
    height: hp(percHeight(250)),
    alignSelf:'center'
  },

  modalText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(20*1.25)),
    alignSelf: 'center',
    padding: hp(percHeight(5)),
    textAlign: 'center',
  },

  
  
  modalButton: {
    margin: hp(percHeight(10)),
    marginTop: hp(percHeight(10)),
    marginBottom: hp(percHeight(10)),
    alignItems: 'stretch',
    paddingTop: hp(percHeight(10)),
    paddingBottom: hp(percHeight(10)),
    backgroundColor: 'black',
  },

  modalDisabledButton: {
    margin: hp(percHeight(10)),
    marginTop: hp(percHeight(10)),
    marginBottom: hp(percHeight(10)),
    alignItems: 'stretch',
    paddingTop: hp(percHeight(10)),
    paddingBottom: hp(percHeight(10)),
    backgroundColor: 'grey',
  },

  
  buttonText: {
    fontSize: hp(percHeight(12*1.25)),
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  
  allContainer:{
    backgroundColor: 'white',
    alignSelf : 'center',
    width: wp("100%") < hp(percHeight(450))? wp("100%") : hp(percHeight(450)),//hp(percHeight(450)),
  },  

  textInput:{
    alignSelf: 'center',
    textAlign: 'center',
    height: hp(percHeight(40)),
    width: hp(percHeight(60)),
    marginLeft: hp(percHeight(10)),
    marginBottom: hp(percHeight(10)),
    color: 'black',
    borderBottomColor: 'black' ,
    borderBottomWidth: 1,
  },


})

