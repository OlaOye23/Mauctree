import React from 'react'
import {View, ScrollView, Modal, TextInput, Text, Image, StyleSheet} from 'react-native'
//import {BaseButton} from 'react-native-gesture-handler'
import {getSelectProduct, getSelectStore}from '../../api/ShopsApi'
//import Modal from 'react-native-modal';
//import Fuse from 'fuse.js'
import { RefreshControl } from 'react-native';

import { AsyncStorage} from 'react-native'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'

import { TouchableOpacity } from '../../web/react-native-web';//'react-native' //
//import { TouchableOpacity } from 'react-native' //






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
    const { navigation } = this.props;
    this._unsubscribe = navigation.addListener('focus', async () => {
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
    });
  }


  componentWillUnmount() {
    this._unsubscribe();
  }
    

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    logErrorToMyService(error, errorInfo);
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
          try{
            
              let prodObj = JSON.parse(value)
           
            console.log(prodObj.qty)
            if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
              this.total += parseInt(prodObj.qty) * parseInt(prodObj.info.price)
              this.basket.push(prodObj)
              console.log('hahaha'+this.basket)
            }
          }catch(error){
            console.warn(error)
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
        const { navigation } = this.props;
        navigation.navigate(
          'Search Products'
        )
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


  clearAllLocalData = async () =>{
    console.log('in async get')
    try{
      await AsyncStorage.getAllKeys( async (err, keys) => {
        await AsyncStorage.multiGet(keys, async (err, stores) => {
          try{
            stores.map(async (result, i, store) => {
              let key = store[i][0];
              let value = store[i][1];
              let prodObj = JSON.parse(value)
              console.log(prodObj.qty)
              if ((prodObj.qty !== undefined) && (prodObj.qty > 0) && (prodObj.qty !== null)){
                await AsyncStorage.setItem(key, JSON.stringify({"": ""}))
              }
          });
        }catch (error) {
          console.warn(error)
        }
        });
        this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
        console.log('done')   
      });
    } catch (error) {
      console.warn(error)
    }
    console.log('out async get')  
  }


  onOpenItem =(product) => {
    console.log("Item pressed")
    /*let obj = this.state.itemObj
    obj.qty = 1 
    this.setState({itemObj : obj})*/
    const { navigation } = this.props;
    navigation.navigate(
      'Update Item',
      {current: product,
      itemObj: this.state.itemObj}
    )
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
        
        let dbItem = await getSelectProduct(basketItem.info, this.onRetrieved)   
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
      <View style = {basketStyles.allContainer} >
      <View  >
      <Text style={basketStyles.modalText}>Total : N {this.total} </Text> 
          {this.state.store.open == "yes" ?
             <Text style = {basketStyles.goodCenterText}>store is open! closes at 11pm</Text> : 
             this.state.store.open == "no" ? <Text style = {basketStyles.badCenterText}>store is closed! opens at 8am</Text>:
             <Text style = {basketStyles.neutralCenterText}>checking store...</Text>}

            <TouchableOpacity style = {basketStyles.modalButton} onPress = {() =>this.onClearBasket()}>
                <Text style = {basketStyles.buttonText}>CLEAR BASKET</Text>
            </TouchableOpacity>


            <TouchableOpacity 
              disabled = {this.state.disableCheckout}
              style = {this.state.disableCheckout === false? basketStyles.modalButton: basketStyles.modalDisabledButton}
              onPress = {() => {
                if (!this.state.disableCheckout){
                  this.onCheckOut() 
                }} }>
              <Text style = {basketStyles.buttonText}>CHECKOUT</Text>
            </TouchableOpacity>

            
            
      </View>
      <ScrollView 
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this._onRefresh.bind(this)}/>}
            >     
          {this.state.products.map((product,i) =>(
            product.name && 
            <TouchableOpacity key ={i} onPress = {()=> this.onOpenItem(product.info)}>
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
            <Image source = {{uri:"../../../assets/white.png"}} style = {basketStyles.modalPic} />
          </View>
          </ScrollView>
        </View>
  );
}
}


const basketStyles = StyleSheet.create({
  

  

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

  
  
  modalButton: {
    margin: hp(percHeight(5)),
    alignItems: 'stretch',
    paddingTop: hp(percHeight(10)),
    paddingBottom: hp(percHeight(10)),
    backgroundColor: 'black',
  },

  modalDisabledButton: {
    margin: hp(percHeight(5)),
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
    alignSelf : 'center',
    width: wp("100%") < hp(percHeight(450))? wp("100%") : hp(percHeight(450)),//hp(percHeight(450)),
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
    width: "75%",//hp(percWidth(350)),
    margin : hp(percHeight(5)),
  },
  
  titleText: {
    fontWeight: 'bold',
    fontSize: 12,
    alignSelf: 'center',
  },
  
  
  
  productPic:{
    width: "20%",
    height: wp("20%") < hp(percHeight(80))? wp("20%") : hp(percHeight(80)),//used width to maintain ratio- very slight difference
    margin: hp(percWidth(5)),
  },
  
     


})

