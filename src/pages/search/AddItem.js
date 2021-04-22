import React from 'react'
import {View, ScrollView, TextInput, Text, Image, StyleSheet, Linking} from 'react-native'
import { AsyncStorage, RefreshControl } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'

import { TouchableOpacity } from '../../web/react-native-web';//'react-native' //

import * as Analytics from 'expo-firebase-analytics';




export default class AddItem extends React.Component{
  constructor(props){
      super(props)
      this.prodList = []
      this.state = {
          forceRefresh: Math.floor(Math.random() * 100000000),//to force a re-render
          itemObj:{
            name: "", 
            qty: "",
          },
          current: {
            name : "",
            price: "",
            imgURL: "",
            stock: "",
          },
          disableAddButton: false,
          scrollPos: 0,
          
      }
  }

  static navigationOptions = {
    title: "Add Item",
  };  


  componentDidMount = async () =>{
    const { route } = this.props;
    const { current } = route.params;
    const { itemObj } = route.params;
    const { scrollPos } = route.params;
    this.setState({scrollPos : scrollPos})
    console.log(scrollPos)
    itemObj.qty = 1
    this.setState({ current: current, itemObj: itemObj}, ()=>{
      this.onChangeQty(this.state.current,this.state.current.name, 1)
      Analytics.logEvent('openItem', {
        item: this.state.current,
      })
    })
    //console.log(this.state.itemObj.qty)
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
    this.setState({disableAddButton: false})
    if (qty <= 0 || isNaN(parseInt(qty)) || qty == "" ){
      qty = 0
    }
    let obj = {info : info, name : name, qty : parseInt(qty)}
    obj.info.qty = 1
    this.setState({itemObj : obj})
    console.log(qty)
    console.log(this.state.itemObj.qty)
    console.log(this.state.current.stock)
    if ((qty == "") || (parseInt(qty) <= 0) || (parseInt(qty) > parseInt(this.state.current.stock) ) ){
      this.setState({disableAddButton: true})
    }
    else{
      this.setState({disableAddButton: false})
    }
    console.log('onChangeQty', this.state.itemObj)
  }

  onAddItem = () =>{
    Analytics.logEvent('addToBasket', {
      item: this.state.current,
    })
    //COPY TO ASYNCSTORAGE .....
    console.log(this.state.itemObj)
    if (this.state.itemObj.name){
      this.storeLocalData(this.state.itemObj.name, JSON.stringify(this.state.itemObj))
      let obj = {name: "", qty: "1"}
      this.setState({itemObj: obj})
    }
    this.setState({disableUpdateButton: true})
    const { navigation } = this.props;
    navigation.navigate(
      'Search Products',{
      scrollPos : this.state.scrollPos,
      }
  )
    alert("Item Added")
    console.log('onAddItem', this.state.itemObj)
  }


  onCancelAdd = () => {
    let obj = {name: "", qty: "1"}
    this.setState({itemObj: obj})
    this.setState({disableAddButton: true})
    const { navigation } = this.props;
    navigation.navigate(
        'Search Products',{
        scrollPos : this.state.scrollPos,
        }
    )
    console.log('onCancelAdd', this.state.obj)
  }

  onMoreInfo = (item) =>{
    let msg = `More Information Request%0A %0AItem: ${item.name} %0A %0AMessage:`
    let chat = `http://api.whatsapp.com/send?text=${msg}&phone=+2348110233359`
    Linking.openURL(chat)
  }

  
  render(){
    return (
      
          <View style={addItemStyles.allContainer}>
            <ScrollView >
                <View style={addItemStyles.modal}>
                <Text style = {addItemStyles.modalText}>{this.state.current.name} </Text>
                <Text style = {addItemStyles.modalText}>{this.state.current.size} </Text>
                <Image source = {{uri:this.state.current.imgURL}} style = {addItemStyles.modalPic} />
                
                {this.state.current.shop?
                <View><Text style = {addItemStyles.modalText}> N{this.state.current.price}</Text> 
                <Text style = {addItemStyles.goodCenterTextBig}>(N{parseInt(parseInt(this.state.current.price*.85)/10)*10})</Text>
                <Text style = {addItemStyles.goodCenterText}>select next day at checkout for 15% off</Text></View>
                :
                <View><Text style = {addItemStyles.modalText}> N{this.state.current.price}</Text>
                <Text style = {addItemStyles.goodCenterText}>select immediate at checkout for 19m delivery</Text>
                </View>
                }
                <Text style = {addItemStyles.modalText} >enter quantity:</Text>  
                {!this.state.current.shop &&
                <Text style = {parseInt(this.state.current.stock) > 0? addItemStyles.goodCenterText: addItemStyles.badCenterText} >
                    {this.state.current.stock} units available 
                </Text>  
                }
                  <TextInput 
                    keyboardType="numeric"
                    style = {addItemStyles.textInput}
                    placeholderTextColor = {'grey'}
                    placeholder = {String(0)}
                    underlineColorAndroid= {'transparent'}
                    value={String(this.state.itemObj.qty)}
                    onChangeText={(text) => this.onChangeQty(this.state.current,this.state.current.name, text)}
                  />
                <Text style = {addItemStyles.badCenterText} >
                  {parseInt(this.state.itemObj.qty) > parseInt(this.state.current.stock)? "Not enough items in stock" : "" }
                </Text> 
                <Text style = {addItemStyles.modalText}> Total: N{this.state.current.price * this.state.itemObj.qty}</Text>
                <TouchableOpacity 
                  disabled = {this.state.disableAddButton}
                  style = {this.state.disableAddButton === false? addItemStyles.modalButton: addItemStyles.modalDisabledButton} 
                  onPress = {() => {
                    if (!this.state.disableAddButton){
                      this.onAddItem() 
                    }} }>
                  <Text style = {addItemStyles.buttonText}>ADD TO BASKET</Text>
                </TouchableOpacity>

                <TouchableOpacity style = {addItemStyles.modalButton} onPress = {() => this.onCancelAdd() }>
                  <Text style = {addItemStyles.buttonText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity style = {addItemStyles.modalButton} onPress = {() => this.onMoreInfo(this.state.current) }>
                  <Text style = {addItemStyles.buttonText}>CHAT WITH US (WHATSAPP)</Text>
                </TouchableOpacity>


                </View>
              </ScrollView>
            </View>
  );
}
}


const addItemStyles = StyleSheet.create({
  
  
  goodCenterText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percWidth(5)),
    alignSelf: 'center',
  },

  goodCenterTextBig: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(20*1.25)),
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
