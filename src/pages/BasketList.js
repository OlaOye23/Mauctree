import React from 'react'
import {View, ScrollView, Modal, TextInput, Text, TouchableOpacity, Image, StyleSheet} from 'react-native'
//import {BaseButton} from 'react-native-gesture-handler'
import {getSelectProduct, getSelectStore}from '../api/ShopsApi'
//import Modal from 'react-native-modal';
//import Fuse from 'fuse.js'
import { RefreshControl } from 'react-native';
import { AsyncStorage} from 'react-native'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../api/StyleFuncs'





export default class BasketList extends React.Component{
  constructor(props){
      super(props)
      this.basket = []
      this.total = 0
      this.state = {
          products: [],
          modalVisible : false,
          forceRefresh: Math.floor(Math.random() * 100000000),//to force a re-render
          itemObj:{
            name: null, 
            qty: "",
          },
          current: {},
          searchQuery: "",
          refreshing: false,
          itemAdded: false,
          disableAddButton: true,
          disableCheckout: true,
          store:{
            id: "bvUlmrcHZsUi6SpECE8y",//VGC STORE HARD CODE
            name: "VGC",
            open: ""
          }
      }
  }

   
  

  componentDidMount = async () =>{
    this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
    try{
      await this.getAllLocalData()
      let store = await getSelectStore(this.state.store)
      this.setState({store: store})  
    } catch (error) {
      console.warn(error)
      alert('Error: please try again or restart')
    }
    setTimeout(()=>{
      let items = this.state.products
      console.log(items.length)
      if ((items.length) > 0){
        this.setState({disableCheckout: false})
      }
      else{
        this.setState({disableCheckout: true})
      }
      if (this.state.store.open === "no"){
        this.setState({disableCheckout: true})
      }
    },100)
  }

  getAllLocalData = async () =>{
    console.log('in async get')
    this.total = 0
    try{
    await AsyncStorage.getAllKeys( async (err, keys) => {
      await AsyncStorage.multiGet(keys, async (err, stores) => {
        stores.map( async (result, i, store) => {
          let key = store[i][0];
          let value = store[i][1];
          let prodObj = JSON.parse(value)
          console.log(prodObj.qty)
          if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
            this.total += parseInt(prodObj.qty) * parseInt(prodObj.info.price)
            this.basket.push(prodObj)
            console.log('hahaha'+this.basket)
          }
        });
      });
      this.setState({products : this.basket})
      this.basket = []
      console.log('1',this.state.products)
      console.log('done')   
    });
    } catch (error) {
      console.warn(error)
      alert('Error: please try again or restart')
    }
    console.log('out async get')
  }

  
  

  onClearBasket = async () =>{
    try{
      await this.clearAllLocalData().then(()=>{
        this.setState({disableCheckout: false})
        this.componentDidMount()
      })
    } catch (error) {
      console.warn(error)
      alert('Error: please try again or restart')
    }
  }


  storeLocalData = async (key, val) => {
    try {
      await AsyncStorage.setItem(key, val)
    } catch (error) {
      console.warn(error)
      alert('Error: please try again or restart')
    }
  }

  retrieveLocalData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // We have data!!
        console.log(value);
      }
      else{
        console.log('empty')
      }
    } catch (error) {
      console.warn(error)
      alert('Error: please try again or restart')
    }
    return value
  }

  clearAllLocalData = async () =>{
    console.log('in async get')
    try{
      await AsyncStorage.getAllKeys( async (err, keys) => {
        await AsyncStorage.multiGet(keys, async (err, stores) => {
          stores.map(async (result, i, store) => {
            let key = store[i][0];
            let value = store[i][1];
            let prodObj = JSON.parse(value)
            console.log(prodObj.qty)
            if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
              await AsyncStorage.setItem(key, JSON.stringify({"": ""}))
            }
          });
        });
        this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
        console.log('done')   
      });
    } catch (error) {
      console.warn(error)
      alert('Error: please try again or restart')
    }
    console.log('out async get')  
  }

  

  onChangeQty = (info, name, qty) =>{
    this.setState({disableAddButton: true})
    if (parseInt(qty) < 0 || isNaN(parseInt(qty)) || qty == "" ){
      qty = 0
    }
    let obj = {info : info, name : name, qty : parseInt(qty)}
    this.setState({itemObj : obj})
    console.log(qty)
    console.log(this.state.itemObj.qty)
    console.log(this.state.current.stock)
    if ((qty == "") || (parseInt(qty) > parseInt(this.state.current.stock) ) ){//different from search page
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
    this.setState({modalVisible: false})
    this.setState({itemAdded: true})
    this.setState({disableAddButton: true})
    this.componentDidMount()
    console.log('onAddItem', this.state.itemObj)
  }

  onContinueShopping = () =>{
    this.setState({itemAdded: false})
  }

  onCancelAdd = () => {
    obj = {name: "", qty: ""}
    this.setState({itemObj: obj})
    this.setState({modalVisible: false})
    this.setState({disableAddButton: true})
    this.componentDidMount()
    console.log('onCancelAdd', this.state.obj)
  }


  onPressItem =(product) => {
    console.log("Item pressed")
    this.setState({current : product})
    if (this.state.modalVisible === false){
      this.setState({modalVisible: true})
    }
    else{
      this.setState({modalVisible: false})
    }
  }

  onSearchProducts = () => {
    console.log(this.state.products)
  }

  asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  } 

  onCheckOut = async () =>{
    console.log('checking out')
    console.log(this.state.disableCheckout)
    let items = this.state.products
    let fail = false
    console.log(items.length)

    if (items.length < 1){
      alert("There are no items in your basket")
      fail = true
      return
    }

    if (this.total < 2000){
      alert("You need to spend a minimum of N2000 for our delivery service")
      fail = true
      const { navigation } = this.props;
        navigation.navigate(
          'Basket',
        )
      return fail
    }

    try{
      let store = await getSelectStore(this.state.store)
      this.setState({store: store}) 
      if (this.state.store.open === "no"){
        alert('shop closed! opens at 8am')
        fail = true
        return
      }
      await this.asyncForEach(items, async (basketItem) => { 
        console.log(basketItem)
        
        dbItem = await getSelectProduct(basketItem.info, this.onRetrieved)   
        console.log('database + '+ dbItem)
        console.log(dbItem)
        if (parseInt(dbItem.price) == parseInt(basketItem.info.price)){
          console.log('price equal')
        }
        else{
          console.log('price not equal')
          basketItem.info.price = dbItem.price
          this.storeLocalData(basketItem.name, JSON.stringify(basketItem.info))
          alert(basketItem.name + "'s price has changed since you added it to your basket.\nPlease review the updated price and checkout agian")
        }
        if (parseInt(dbItem.stock) >= parseInt(basketItem.qty)){//need to test
          console.log('product still in stock')
          //fail = false
        }
        else{
          console.log('product not in stock')
          fail = true
          alert(basketItem.name + ' is no longer in stock.\nThe item has been removed from your basket')
          await AsyncStorage.setItem(basketItem.name, JSON.stringify({"": ""}))
        }
      
      if (fail === false){
        const { navigation } = this.props;
        navigation.navigate(
          'Order Details',
          {total: this.total}
        )
      }else{
        console.log('fail condition reached')
        this.componentDidMount()
      }
      })
      } catch (error) {
        console.warn(error)
        alert('Error: please try again or restart')
      }
    
  }
  

  onRetrieved = (itemInfo) =>{//useless for now...dont delete naively look for dependants
    return itemInfo
  }
  

  _onRefresh= () => {
    this.setState({refreshing: true});
    this.componentDidMount().then(() => {
      this.setState({refreshing: false});
    });
  }



  
  render(){
    
    
  return (
      
      <View >

      
      <View style = {basketStyles.totalContainer}  >
      <Text style={basketStyles.modalText}>Total : N {this.total} </Text> 
          {this.state.store.open == "yes" ?
             <Text style = {basketStyles.goodCenterText}>store is open! closes at 11pm</Text> : 
             this.state.store.open == "yes" ? <Text style = {basketStyles.badCenterText}>store is closed! opens at 8am</Text>:
             <Text style = {basketStyles.neutralCenterText}>checking store...</Text>}
            <TouchableOpacity 
              disabled = {this.state.disableCheckout}
              style = {this.state.disableCheckout === false? basketStyles.modalButton: basketStyles.modalDisabledButton}
              onPress = {() => this.onCheckOut()}
              >
              <Text style = {basketStyles.buttonText}>CHECKOUT</Text>
            </TouchableOpacity>

            <TouchableOpacity style = {basketStyles.modalButton} onPress = {() =>this.onClearBasket()}>
                <Text style = {basketStyles.buttonText}>CLEAR BASKET</Text>
            </TouchableOpacity>
            <Text style={basketStyles.refreshText}>pull down your screen to refresh stock</Text>
      </View>
      <ScrollView styles = {basketStyles.allContainer}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh.bind(this)}/>}
            >     
          {this.state.products.map((product,i) =>(
            product.name && 
            <TouchableOpacity key ={i} onPress = {()=> this.onPressItem(product.info)}>
              <View style = {basketStyles.superContainer}>
              <Image source = {{uri:product.info.imgURL}} style = {basketStyles.productPic} />
              <View style = {basketStyles.mainContainer}>
                  <View style = {basketStyles.titleContainer}>
                      <Text style = {basketStyles.titleText}>{product.info.name} </Text>
                      <Text style = {basketStyles.titleText}> N{product.info.price}</Text>
                  </View>
                  <Text style = {basketStyles.neutralText} >
                      {product.qty+ " in basket"}
                  </Text>
                  <Text style = {basketStyles.neutralText}>
                      {"Total: N"+ product.qty* product.info.price } 
                  </Text>
              </View>
            </View>

        
            </TouchableOpacity>
          ))}

          <View style = {basketStyles.superContainer}>
            <Image source = {{uri:"../../assets/white.png"}} style = {basketStyles.modalPic} />
          </View>

          <Modal visible={this.state.modalVisible} transparent={false}>
            <ScrollView>
                <View style={basketStyles.modal}>
                <Text style = {basketStyles.modalText}>{this.state.current.name} </Text>
                <Image source = {{uri:this.state.current.imgURL}} style = {basketStyles.modalPic} />
                <Text style = {basketStyles.modalText}> N{this.state.current.price}</Text>
                <Text style = {basketStyles.modalText} >enter quantity:</Text>  
                <Text style = {parseInt(this.state.current.stock) > 0? basketStyles.goodCenterText: basketStyles.badCenterText} >
                    {this.state.current.stock} units available 
                </Text>  
                  <TextInput 
                    keyboardType="numeric"
                    style = {basketStyles.textInput}
                    placeholderTextColor = {'grey'}
                    placeholder = {String(0)}
                    underlineColorAndroid= {'transparent'}
                    value={String(this.state.itemObj.qty)}
                    onChangeText={(text) => this.onChangeQty(this.state.current,this.state.current.name, text)}
                  />
                <Text style = {basketStyles.badCenterText} >
                  {parseInt(this.state.itemObj.qty) > parseInt(this.state.current.stock)? "Not enough items in stock" : "" }
                </Text> 
                <Text style = {basketStyles.modalText}> Total: N{this.state.current.price * this.state.itemObj.qty}</Text>
                <TouchableOpacity 
                  disabled = {this.state.disableAddButton}
                  style = {this.state.disableAddButton === false? basketStyles.modalButton: basketStyles.modalDisabledButton} 
                  onPress = {() => this.onAddItem() }>
                  <Text style = {basketStyles.buttonText}>UPDATE QUANTITY</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {basketStyles.modalButton} onPress = {() => this.onCancelAdd() }>
                  <Text style = {basketStyles.buttonText}>CANCEL</Text>
                </TouchableOpacity>
                </View>
              </ScrollView>
            </Modal>

            <Modal visible={this.state.itemAdded} transparent={false}>
            <ScrollView>
                <View style={basketStyles.modal}>
                  <Text style = {basketStyles.addConfirmText}>Quantity Updated!</Text>
                </View>
                <TouchableOpacity style = {basketStyles.modalButton} onPress = {() => this.onContinueShopping() }>
                  <Text style = {basketStyles.buttonText}>GO TO BASKET</Text>
                </TouchableOpacity>
              </ScrollView>
            </Modal>

           
      
          </ScrollView>

      
        </View>
  );
}
}


const basketStyles = StyleSheet.create({
  refreshText: {
    color: 'black',
    //fontWeight: 'bold',
    fontSize: 9,
    marginLeft: wp(percWidth(5)),
    alignSelf: 'center',
  },

  totalContainer:{
    marginBottom:hp(percHeight(10))
  },

  neutralCenterText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: hp(percHeight(5)),
    alignSelf: 'center',
  },
  neutralText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  goodCenterText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: hp(percHeight(5)),
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
    marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  goodText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: hp(percHeight(5)),
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
    marginTop: hp(percHeight(50)),
    alignContent: 'center',
   },

  modalPic:{
    width: hp(percHeight(250)),
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
    padding: 5,
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
    width: hp(percHeight(60)),
    marginLeft: hp(percHeight(10)),
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
    marginTop: hp(percHeight(100)),  // doesnt do anything
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  superContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  mainContainer: {
    width: hp(percHeight(260)),
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
    width: hp(percHeight(80)),
    height: hp(percHeight(80)),
    margin: hp(percHeight(5)),

  },
  productTitle:{
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: hp(percHeight(5)),
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

