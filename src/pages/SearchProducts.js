import React from 'react'
import {View, ScrollView, Modal, TextInput, Text, TouchableOpacity, Image, StyleSheet} from 'react-native'
//import {BaseButton} from 'react-native-gesture-handler'
import {getProducts}from '../api/ShopsApi'
//import Modal from 'react-native-modal';
import Fuse from 'fuse.js'
import { AsyncStorage, RefreshControl } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../api/StyleFuncs'




export default class searchProducts extends React.Component{
  constructor(props){
      super(props)
      this.prodList = []
      this.backCount = 0
      this.state = {
          products: [],
          modalVisible : false,
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
          searchUsed: false,
          refreshing: false,
          searchQuery: "",
          itemAdded: false,
          disableAddButton: true,
      }
  }

  static navigationOptions = {
    title: "Products",
  };  

  
  

  componentDidMount = async () =>{
    //get product and put in list
    try{
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      await getProducts(this.productsRetrieved)
    }
    catch (error){
      console.warn(error)
      alert("Timeout: Please check your internet connection and try again ")
    }
    
  }

  onClickCheckOut = () =>{
    //navigate to orderForm
  }

  productsRetrieved = (productList) =>{
    console.log('retrieved')
    this.prodList = productList
    console.log(productList)
    this.setState({products: productList})
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

  getAllLocalData = async () =>{
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {
        stores.map((result, i, store) => {
          let key = store[i][0];
          let value = store[i][1];
          console.log(key, value)
        });
      });
    });
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
    this.setState({modalVisible: false})
    this.setState({itemAdded: true})
    this.setState({disableAddButton: true})
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
  const options = {
    includeScore: true,
    keys: [
      {name: 'name', weight: 0.9},
      {name: 'tags', weight: 0.1},
    ]
  }
  
  const fuse = new Fuse(this.prodList, options)
  if (this.state.searchQuery !== ""){
    this.setState({searchUsed: true})
    const result = fuse.search(this.state.searchQuery)
    console.log(result)
    this.setState({products :[]})
    this.setState({products :result})
    console.log(this.state.products)
  }
  else{
    this.setState({searchUsed: false})
    this.componentDidMount()
  }
}

_onRefresh= () => {
  this.setState({searchUsed: false});
  this.setState({refreshing: true});
  this.setState({searchQuery: ""})
  this.componentDidMount().then(() => {
    this.setState({refreshing: false});
  });
}

onViewBasket = () =>{
  const { navigation } = this.props;
  navigation.navigate('Basket')
}

static getDerivedStateFromError(error) {
  // Update state so the next render will show the fallback UI.
  return { hasError: true };
}

componentDidCatch(error, errorInfo) {
  // You can also log the error to an error reporting service
  logErrorToMyService(error, errorInfo);
}

  
  render(){
  return (
      
      <View >
     <View style = {{margin: 10}}
       refreshControl={
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={this._onRefresh.bind(this)}/>}
      >
        <TextInput 
            placeholder= "search for a product"  
            style={listStyles.searchBox} 
            onChangeText={(text) => this.setState({searchQuery: text})} 
            value={this.state.searchQuery} 
            onSubmitEditing = {() => this.onSearchProducts(this.state.searchQuery)}
        /> 
        <TouchableOpacity style = {listStyles.modalButton} onPress = {() => this.onViewBasket() }>
          <Text style = {listStyles.buttonText}>VIEW BASKET</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView styles = {listStyles.allContainer}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}/>}
          >
          {this.state.searchUsed == true &&
            this.state.products.map((product,i) =>(
            product.item.name && product.item.price && product.item.imgURL && 
            <TouchableOpacity key ={i} onPress = {()=> this.onPressItem(product.item)}>
              <View style = {listStyles.superContainer}>
              <Image source = {{uri:product.item.imgURL}} style = {listStyles.productPic} />
              <View style = {listStyles.mainContainer}>
                  <View style = {listStyles.titleContainer}>
                      <Text style = {listStyles.titleText}>{product.item.name} </Text>
                      <Text style = {listStyles.titleText}> N{product.item.price}</Text>
                  </View>
                  <View style = {listStyles.sizeContainer}>
                      <Text style = {listStyles.titleText}>{product.item.size} </Text>
                  </View>
                  <Text style = {product.item.stock > 0? listStyles.goodText: listStyles.badText} >
                      {product.item.stock > 0? "available": "out of Stock"}
                  </Text>
                  <Text style = {listStyles.description}>
                      {product.item.stock + " in stock"} 
                  </Text>
              </View>
            </View>

            <View>
            
          </View>
            </TouchableOpacity>

          ))}

          {this.state.searchUsed == false &&
            this.state.products.map((product,i) =>(
              product.name && product.price && product.imgURL && 
              <TouchableOpacity key ={i} onPress = {()=> this.onPressItem(product)}>
                <View style = {listStyles.superContainer}>
                <Image source = {{uri:product.imgURL}} style = {listStyles.productPic} />
                <View style = {listStyles.mainContainer}>
                    <View style = {listStyles.titleContainer}>
                        <Text style = {listStyles.titleText}>{product.name} </Text>
                        <Text style = {listStyles.titleText}> N{product.price}</Text>
                    </View>
                    <View style = {listStyles.sizeContainer}>
                      <Text style = {listStyles.titleText}>{product.size} </Text>
                  </View>
                    <Text style = {product.stock > 0? listStyles.goodText: listStyles.badText} >
                        {product.stock > 0? "available": "out of Stock"}
                    </Text>
                    <Text style = {listStyles.description}>
                        {"x" + product.stock + " in stock"} 
                    </Text>
                </View>
              </View>
  
              <View>
              
            </View>
              </TouchableOpacity>  
          ))}

          <View style = {listStyles.superContainer}>
            <Image source = {{uri:"../../assets/white.png"}} style = {listStyles.modalPic} />
          </View>

          
          <Modal visible={this.state.modalVisible} transparent={false}>
            <ScrollView>
                <View style={listStyles.modal}>
                <Text style = {listStyles.modalText}>{this.state.current.name} </Text>
                <Text style = {listStyles.modalText}>{this.state.current.size} </Text>
                <Image source = {{uri:this.state.current.imgURL}} style = {listStyles.modalPic} />
                <Text style = {listStyles.modalText}> N{this.state.current.price}</Text>
                <Text style = {listStyles.modalText} >enter quantity:</Text>  
                <Text style = {parseInt(this.state.current.stock) > 0? listStyles.goodCenterText: listStyles.badCenterText} >
                    {this.state.current.stock} units available 
                </Text>  
                  <TextInput 
                    keyboardType="numeric"
                    style = {listStyles.textInput}
                    placeholderTextColor = {'grey'}
                    placeholder = {String(0)}
                    underlineColorAndroid= {'transparent'}
                    value={String(this.state.itemObj.qty)}
                    onChangeText={(text) => this.onChangeQty(this.state.current,this.state.current.name, text)}
                  />
                <Text style = {listStyles.badCenterText} >
                  {parseInt(this.state.itemObj.qty) > parseInt(this.state.current.stock)? "Not enough items in stock" : "" }
                </Text> 
                <Text style = {listStyles.modalText}> Total: N{this.state.current.price * this.state.itemObj.qty}</Text>
                <TouchableOpacity 
                  disabled = {this.state.disableAddButton}
                  style = {this.state.disableAddButton === false? listStyles.modalButton: listStyles.modalDisabledButton} 
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
          

        </ScrollView>
        </View>
  );
}
}


listStyles = StyleSheet.create({
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
    marginTop: hp(percHeight(100)),  // doesnt do anything
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
