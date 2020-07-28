import React from 'react'
import {View, ScrollView, Modal, TextInput, Text, TouchableOpacity, Image, StyleSheet} from 'react-native'
//import {BaseButton} from 'react-native-gesture-handler'
import {getSelectProduct}from '../api/ShopsApi'
//import Modal from 'react-native-modal';
import Fuse from 'fuse.js'
import { AsyncStorage, RefreshControl } from 'react-native';





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
      }
  }

   
  

  componentDidMount = async () =>{
    this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
    this.getAllLocalData()
  }

  getAllLocalData = async () =>{
    console.log('in async get')
    this.total = 0
    await AsyncStorage.getAllKeys( async (err, keys) => {
      await AsyncStorage.multiGet(keys, async (err, stores) => {
        stores.map((result, i, store) => {
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
   
    console.log('out async get')
  }

  
  onClickCheckOut = () =>{
    //navigate to orderForm
  }

  onClearBasket = async () =>{
    await this.clearAllLocalData()
    this.componentDidMount()
  }


  storeLocalData = async (key, val) => {
    try {
      await AsyncStorage.setItem(key, val)
    } catch (error) {
      console.log(error)
      // Error saving data
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
      console.log(error)
      // Error retrieving data
    }
    return value
  }

  clearAllLocalData = async () =>{
    console.log('in async get')
    await AsyncStorage.getAllKeys( async (err, keys) => {
      await AsyncStorage.multiGet(keys, async (err, stores) => {
        stores.map(async (result, i, store) => {
          let key = store[i][0];
          let value = store[i][1];
          let prodObj = JSON.parse(value)
          console.log(prodObj.qty)
          if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
            await AsyncStorage.setItem(key, JSON.stringify({"null": "null"}))
          }
        });
      });
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      console.log('done')   
    });
    console.log('out async get') 
    
  }

  

  onChangeQty = (info, name, qty) =>{
    let obj = {info : info, name : name, qty : qty}
    this.setState({itemObj : obj})
    console.log('onChangeQty', this.state.itemObj)
  }

  onAddItem = () =>{
    //COPY TO ASYNCSTORAGE .....
    console.log(this.state.itemObj)
    if (this.state.itemObj.name){
      this.storeLocalData(this.state.itemObj.name, JSON.stringify(this.state.itemObj))
      let obj = {name: null, qty: null}
      this.setState({itemObj: obj})
    }
    this.setState({modalVisible: false})
    this.setState({itemAdded: true})
    
    console.log('onAddItem', this.state.itemObj)
  }

  onContinueShopping = () =>{
    this.setState({itemAdded: false})
  }

  onCancelAdd = () => {
    obj = {name: null, qty: null}
    this.setState({itemObj: obj})
    this.setState({modalVisible: false})
    console.log('onCancelAdd', this.state.itemObj)
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

  onCheckOut = async () =>{
    console.log('checking out')
    let items = this.state.products
    let fail = false
    console.log(items.length)
    if ((items.length) > 0){
      items.forEach(async (basketItem) => {
        console.log(basketItem)
        dbItem = await getSelectProduct(basketItem.info, this.onRetrieved)   
        console.log('database + '+ dbItem)
        console.log(dbItem)
        if (parseInt(dbItem.price) == parseInt(basketItem.info.price)){
          console.log('price equal')
        }
        else{
          console.log('price not equal')
          this.storeLocalData(basketItem.name, JSON.stringify(basketItem.info))
          basketItem.info.price = dbItem.price
        }
        if (parseInt(dbItem.stock) >= parseInt(basketItem.qty)){
          console.log('product still in stock')
          fail = false
        }
        else{
          console.log('product not in stock')
          fail = true
        }
    })
      if (fail === false){
        const { navigation } = this.props;
        navigation.navigate(
          'Order Details',
          {total: this.total}
        )
      }else{
        console.log('fail condition reached')
      }
    }
  }
  

  onRetrieved = (itemInfo) =>{//useless for now
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

      
      <ScrollView styles = {listStyles.allContainer}
       refreshControl={
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={this._onRefresh.bind(this)}/>}
       >
      <Text style={listStyles.modalText}>Total : N {this.total} </Text> 
          {this.state.products.map((product,i) =>(
            product.name && 
            <TouchableOpacity key ={i} onPress = {()=> this.onPressItem(product.info)}>
              <View style = {listStyles.superContainer}>
              <Image source = {{uri:product.info.imgURL}} style = {listStyles.productPic} />
              <View style = {listStyles.mainContainer}>
                  <View style = {listStyles.titleContainer}>
                      <Text style = {listStyles.titleText}>{product.info.name} </Text>
                      <Text style = {listStyles.titleText}> N{product.info.price}</Text>
                  </View>
                  <Text style = {listStyles.neutralText} >
                      {product.qty+ " in basket"}
                  </Text>
                  <Text style = {listStyles.neutralText}>
                      {"Total: N"+ product.qty* product.info.price } 
                  </Text>
              </View>
            </View>

        
            </TouchableOpacity>
          ))}

        <Modal visible={this.state.modalVisible} transparent={false}>
            <ScrollView>
                <View style={listStyles.modal}>
                <Text style = {listStyles.modalText}>{this.state.current.name} </Text>
                <Image source = {{uri:this.state.current.imgURL}} style = {listStyles.modalPic} />
                <Text style = {listStyles.modalText}> N{this.state.current.price}</Text>
                <Text style = {listStyles.modalText} >enter quantity: max = {this.state.current.stock}</Text>  
                  <TextInput 
                    keyboardType="numeric"
                    style = {listStyles.textInput}
                    placeholderTextColor = {'grey'}
                    placeholder = {String(0)}
                    underlineColorAndroid= {'transparent'}
                    value={String(this.state.itemObj.qty)}
                    onChangeText={(text) => this.onChangeQty(this.state.current,this.state.current.name, text)}
                  />
                <Text style = {listStyles.warnText} >
                  {parseInt(this.state.itemObj.qty) > this.state.current.stock? "Not enough items in stock" : "" }
                </Text> 
                <Text style = {listStyles.modalText}> Total: N{this.state.current.price * this.state.itemObj.qty}</Text>
                <TouchableOpacity 
                  disabled = {parseInt(this.state.itemObj.qty) > this.state.current.stock}
                  style = {listStyles.modalButton} 
                  onPress = {() => this.onAddItem() }>
                  <Text style = {listStyles.buttonText}>ADD TO BASKET</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {listStyles.modalButton} onPress = {() => this.onCancelAdd() }>
                  <Text style = {listStyles.buttonText}>CANCEL</Text>
                </TouchableOpacity>
                </View>
              </ScrollView>
            </Modal>

            <Modal visible={this.state.itemAdded} transparent={false}>
            <ScrollView>
                <View style={listStyles.modal}>
                  <Text style = {listStyles.addConfirmText}>Item Added!</Text>
                </View>
                <TouchableOpacity style = {listStyles.modalButton} onPress = {() => this.onContinueShopping() }>
                  <Text style = {listStyles.buttonText}>CONTINUE SHOPPING</Text>
                </TouchableOpacity>
              </ScrollView>
            </Modal>

            <TouchableOpacity style = {listStyles.modalButton} onPress = {this.onCheckOut}>
                <Text style = {listStyles.buttonText}>CHECKOUT</Text>
            </TouchableOpacity>

            <TouchableOpacity style = {listStyles.modalButton} onPress = {this.onClearBasket}>
                <Text style = {listStyles.buttonText}>CLEAR BASKET</Text>
            </TouchableOpacity>
      
          </ScrollView>

      
        </View>
  );
}
}


listStyles = StyleSheet.create({

  neutralText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 10,
    marginLeft: 5,
    //alignSelf: 'center',
  },
  warnText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 10,
    alignSelf: 'center',
  },
  badText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 10,
    marginLeft: 5,
    //alignSelf: 'center',
  },
  goodText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 10,
    marginLeft: 5,
    //alignSelf: 'center',
  },
  searchBox: {
    height: 50,
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
    marginTop: 50,
    alignContent: 'center',
   },

  modalPic:{
    width: 250,
    height: 250,
    alignSelf:'center'
  },

  modalText: {
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding: 5,
    textAlign: 'center',
  },

  addConfirmText: {
    marginTop: 200,
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'center',
    padding: 5,
    textAlign: 'center',
  },
  
  modalButton: {
    margin: 10,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'black',
  },

  textInput:{
    alignSelf: 'center',
    textAlign: 'center',
    height: 40,
    width: 60,
    marginLeft: 10,
    marginBottom: 10,
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
    marginTop: 100,  // doesnt do anything
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 5,

  },
  superContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 5,

  },
  mainContainer: {
    width: 260,
    margin : 5,

  },
  description: {
    margin: 5,
    fontSize: 10,

  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 10,
    alignSelf: 'center',
  },
  
  newItemText: {
    fontWeight: 'bold',
    fontSize: 10,

  },
  
  productPic:{
    width: 80,
    height: 80,
    margin: 5,

  },
  productTitle:{
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  location2: {
    height: 45,
    marginTop: 0,
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 16,
    color: 'grey',
    borderColor: 'grey',
    borderWidth: 1,
  },    


})

productOtherStyles = StyleSheet.create({
  button: {
      marginTop: 5,
      marginBottom: 5,
      width: 350,
      height: 40,
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: '#000000'
    },

    buttonText: {
      textAlign: 'center',
      margin: 14,
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
    },
})