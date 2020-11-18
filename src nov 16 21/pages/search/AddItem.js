import React from 'react'
import {View, ScrollView, TextInput, Text, TouchableOpacity, Image, StyleSheet} from 'react-native'
import { AsyncStorage, RefreshControl } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'




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
          disableAddButton: true,
          
      }
  }

  static navigationOptions = {
    title: "Add Item",
  };  


  componentDidMount = async () =>{
    const { route } = this.props;
    const { current } = route.params;
    const { itemObj } = route.params;
    this.setState({ current: current, itemObj: itemObj })
    //this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
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
    this.setState({disableAddButton: true})
    if (qty <= 0 || isNaN(parseInt(qty)) || qty == "" ){
      qty = 0
    }
    let obj = {info : info, name : name, qty : parseInt(qty)}
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
        'Search Products',
        //{state: this.state}
    )
    alert("Item Added")
    console.log('onAddItem', this.state.itemObj)
  }


  onCancelAdd = () => {
    let obj = {name: "", qty: ""}
    this.setState({itemObj: obj})
    this.setState({disableAddButton: true})
    const { navigation } = this.props;
    navigation.navigate(
        'Search Products',
        //{state: this.state}
    )
    console.log('onCancelAdd', this.state.obj)
  }

  
  render(){
    return (
      
          <View >
            <ScrollView style={addItemStyles.allContainer}>
                <View style={addItemStyles.modal}>
                <Text style = {addItemStyles.modalText}>{this.state.current.name} </Text>
                <Text style = {addItemStyles.modalText}>{this.state.current.size} </Text>
                <Image source = {{uri:this.state.current.imgURL}} style = {addItemStyles.modalPic} />
                <Text style = {addItemStyles.modalText}> N{this.state.current.price}</Text>
                <Text style = {addItemStyles.modalText} >enter quantity:</Text>  
                <Text style = {parseInt(this.state.current.stock) > 0? addItemStyles.goodCenterText: addItemStyles.badCenterText} >
                    {this.state.current.stock} units available 
                </Text>  
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
                  onPress = {() => this.onAddItem() }>
                  <Text style = {addItemStyles.buttonText}>ADD TO BASKET</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {addItemStyles.modalButton} onPress = {() => this.onCancelAdd() }>
                  <Text style = {addItemStyles.buttonText}>CANCEL</Text>
                </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
  );
}
}


const addItemStyles = StyleSheet.create({
  refreshText: {
    color: 'black',
    //fontWeight: 'bold',
    fontSize: 9,
    marginLeft: wp(percWidth(5)),
    alignSelf: 'center',
  },
  neutralCenterText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: wp(percWidth(5)),
    alignSelf: 'center',
  },
  goodCenterText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: wp(percWidth(5)),
    alignSelf: 'center',
  },
  badCenterText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12,
    alignSelf: 'center',
  },
  badText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: wp(percWidth(5)),
    //alignSelf: 'center',
  },
  goodText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: wp(percWidth(5)),
    //alignSelf: 'center',
  },
  searchBox: {
    height: hp(percHeight(50)),
    marginTop: 0,
    marginBottom: 0,
    paddingLeft: 0,
    textAlign: 'center',
    fontSize: 18,
    color: '#707070',
    borderColor: '#c0c0c0',
    borderWidth: 1,
  },

  modal: { 
    marginTop: hp(percHeight(25)),
    alignContent: 'center',
   },

  modalPic:{
    width: wp(percWidth(250)),
    height: hp(percHeight(250)),
    alignSelf:'center'
  },

  modalText: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding: hp(percHeight(5)),
    textAlign: 'center',
  },

  addConfirmText: {
    marginTop: hp(percHeight(200)),
    fontWeight: 'bold',
    fontSize: 20,
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

  textInput:{
    alignSelf: 'center',
    textAlign: 'center',
    height: hp(percHeight(40)),
    width: wp(percWidth(60)),
    marginLeft: wp(percWidth(10)),
    marginBottom: hp(percHeight(10)),
    color: 'black',
    borderBottomColor: 'black' ,
    borderBottomWidth: 1,
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  
  allContainer:{
    alignSelf : 'center',
    width: hp(percWidth(375)),
    flex: 1,
    paddingTop:  hp(percHeight(50)),
    backgroundColor: 'white',
    //paddingLeft:  hp(percHeight(60)),
    //paddingRight:  hp(percHeight(60)),
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 0,
    marginLeft: wp(percWidth(5)),

  },
  superContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  mainContainer: {
    width: wp(percWidth(260)),
    margin : hp(percHeight(5)),

  },
  description: {
    margin: hp(percHeight(5)),
    fontSize: 12,

  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 12,
    alignSelf: 'center',
  },
  
  newItemText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  productPic:{
    width: wp(percWidth(80)),
    height: wp(percWidth(80)),//used width to maintain ratio- very slight difference
    margin: wp(percWidth(5)),

  },
  productTitle:{
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: wp(percWidth(5)),
  },
  location2: {
    height: hp(percHeight(45)),
    marginTop: 0,
    marginBottom: hp(percHeight(5)),
    textAlign: 'center',
    fontSize: 16,
    color: 'grey',
    borderColor: 'grey',
    borderWidth: 1,
  },    


})
