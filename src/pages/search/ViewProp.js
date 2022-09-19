import React from 'react'
import {View, ScrollView, RefreshControl, TextInput, Image, StyleSheet, Linking} from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'
import { Text } from "react-native-elements"
import { TouchableOpacity } from '../../web/react-native-web';//'react-native' //
import * as Analytics from 'expo-firebase-analytics';




export default class ViewProperty extends React.Component{
  constructor(props){
      super(props)
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
    itemObj.qty = current.start_bid
    this.setState({ current: current, itemObj: itemObj}, ()=>{
      this.onChangeQty(this.state.current,this.state.current.name, current.start_bid)
      Analytics.logEvent('openItem', {
        item: this.state.current,
      })
    })
    //console.log(this.state.itemObj.qty)
    this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
  }
  

  //quantity => bid amount
  onChangeQty = (info, name, qty) =>{
    //updated bid amount
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
    if ((qty == "") || (parseInt(qty) <= 0) || (!this.state.current.shop) && ( (parseInt(qty) > parseInt(this.state.current.stock))) ){
      this.setState({disableAddButton: true})
    }
    else{
      this.setState({disableAddButton: false})
    }
    console.log('onChangeQty', this.state.itemObj)
  }



  onCancel = () => {
    let obj = {name: "", qty: "1"}
    this.setState({itemObj: obj})
    this.setState({disableAddButton: true})
    const { navigation } = this.props;
    navigation.navigate(
        'Search Properties',{
        scrollPos : this.state.scrollPos,
        }
    )
    console.log('onCancel', this.state.obj)
  }

  onMoreInfo = (item) =>{
    let msg = `More Information Request%0A %0AItem: ${item.name} %0A %0AMessage:`
    let chat = `http://api.whatsapp.com/send?text=${msg}&phone=+2348097908824`
    Linking.openURL(chat)
  }

  
  render(){
    return (
      <View style = {{backgroundColor: 'white', height: '110%'}}>
          <View style={addItemStyles.allContainer}>
            <ScrollView >
                <View style={addItemStyles.modal}>
                <Text style = {addItemStyles.modalText}>{this.state.current.name} </Text>
                <Text style = {addItemStyles.goodCenterText}>{this.state.current.region} </Text>
                <Text style = {addItemStyles.goodCenterText} >{this.state.current.city}</Text> 
                <Image source = {{uri:this.state.current.image}} style = {addItemStyles.modalPic} />
                <Text style = {addItemStyles.modalText} >{this.state.current.prop_type}</Text>  
                <Text style = {addItemStyles.purpModalText}> Starting bid:</Text>
                <Text style = {addItemStyles.purpModalText}> €{this.state.current.start_bid}k</Text>
                <Text style = {addItemStyles.modalText} >{this.state.current.sale_type}</Text>  
                {!this.state.current.shop &&
                <View>
                  <Text style = {addItemStyles.modalText} >Close date:</Text>  
                <Text style = {addItemStyles.modalText}>{this.state.current.close_date}</Text>
                </View>
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
                
                <Text style = {addItemStyles.modalText}> Your bid: €{this.state.itemObj.qty}k</Text>
                <TouchableOpacity 
                  disabled = {this.state.disableAddButton}
                  style = {this.state.disableAddButton === false? addItemStyles.modalButton: addItemStyles.modalDisabledButton} 
                  onPress = {() => {
                    if (!this.state.disableAddButton){
                      //this.onAddItem() 
                      alert("bid placed")
                    }} }>
                  <Text style = {addItemStyles.buttonText}>PLACE BID</Text>
                </TouchableOpacity>

                <TouchableOpacity style = {addItemStyles.modalButton} onPress = {() => this.onCancel() }>
                  <Text style = {addItemStyles.buttonText}>CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity style = {addItemStyles.purpModalButton} onPress = {() => this.onMoreInfo(this.state.current) }>
                  <Text style = {addItemStyles.buttonText}>CHAT WITH US (WHATSAPP)</Text>
                </TouchableOpacity>


                </View>
              </ScrollView>
            </View>

            </View>
  );
}
}


const addItemStyles = StyleSheet.create({
  
  goodLeftText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    alignSelf: 'flex-start',
  },

  goodCenterText: {
    color: 'purple',
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
    textAlign: 'center'
  },

  purpModalText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(20*1.25)),
    alignSelf: 'center',
    padding: hp(percHeight(5)),
    textAlign: 'center',
    color: 'green'
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

  purpModalButton: {
    margin: hp(percHeight(10)),
    marginTop: hp(percHeight(10)),
    marginBottom: hp(percHeight(10)),
    alignItems: 'stretch',
    paddingTop: hp(percHeight(10)),
    paddingBottom: hp(percHeight(10)),
    backgroundColor: 'purple',
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
