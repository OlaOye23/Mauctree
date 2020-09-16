import React from 'react'
import {View, ScrollView, TextInput, Text, TouchableOpacity, Image, StyleSheet} from 'react-native'
//import {BaseButton} from 'react-native-gesture-handler'
import {getProducts}from '../../api/ShopsApi'
//import Modal from 'react-native-modal';
import Fuse from 'fuse.js'
import { RefreshControl } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'
import * as myEPT from '../../../assets/myEPT.json'




export default class SearchProducts extends React.Component{
  constructor(props){
      super(props)
      this.prodList = []
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
    title: "Search Products",
  };  

  componentDidMount = async () =>{
    if (this.props.params){
      const { route } = this.props;
      const { state } = route.params;
      this.setState({ state })
    }
    try{
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      await getProducts(this.productsRetrieved)
    }
    catch (error){
      console.warn(error)
      alert("Timeout: Please check your internet connection and try again ")
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    logErrorToMyService(error, errorInfo);
  }

  
  productsRetrieved = (productList) =>{
    console.log('retrieved')
    this.prodList = productList
    console.log(productList)
    this.setState({products: productList})
  }


  onOpenItem =(product) => {
    console.log("Item pressed")
    //this.setState({current : product})
    const { navigation } = this.props;
    navigation.navigate(
      'Add Item',
      {current: product,
      itemObj: this.state.itemObj}
    )
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

onViewOrders = () =>{
  console.warn(myEPT.ept)
  const { navigation } = this.props;
  navigation.navigate('My Orders')
}


render(){
  return (
      <View >
     <View style = {{margin: 10}}>
        <TextInput 
            placeholder= "search for a product"  
            style={SearchProdStyles.searchBox} 
            onChangeText={(text) => this.setState({searchQuery: text})} 
            value={this.state.searchQuery} 
            onSubmitEditing = {() => this.onSearchProducts(this.state.searchQuery)}
        /> 
        <TouchableOpacity style = {SearchProdStyles.modalButton} onPress = {() => this.onViewBasket() }>
          <Text style = {SearchProdStyles.buttonText}>VIEW BASKET</Text>
        </TouchableOpacity>

        <TouchableOpacity style = {SearchProdStyles.modalButton} onPress = {() => this.onViewOrders() }>
          <Text style = {SearchProdStyles.buttonText}>MY ORDERS</Text>
        </TouchableOpacity>

      </View>
      
      <ScrollView styles = {SearchProdStyles.allContainer}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={()=>this._onRefresh.bind(this)}/>}
          >
            <View>
          {this.state.searchUsed == true &&
            this.state.products.map((product,i) =>(
            product.item.name && 
            <TouchableOpacity key ={i} onPress = {()=> this.onOpenItem(product.item)}>
              <View style = {SearchProdStyles.superContainer}>
              <Image source = {{uri:product.item.imgURL}} style = {SearchProdStyles.productPic} />
              <View style = {SearchProdStyles.mainContainer}>
                  <View style = {SearchProdStyles.titleContainer}>
                      <Text style = {SearchProdStyles.titleText}>{product.item.name} </Text>
                      <Text style = {SearchProdStyles.titleText}> N{product.item.price}</Text>
                  </View>
                  <View style = {SearchProdStyles.sizeContainer}>
                      <Text style = {SearchProdStyles.titleText}>{product.item.size} </Text>
                  </View>
                  <Text style = {product.item.stock > 0? SearchProdStyles.goodText: SearchProdStyles.badText} >
                      {product.item.stock > 0? "available": "out of Stock"}
                  </Text>
                  <Text style = {SearchProdStyles.description}>
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
              product.name && 
              <TouchableOpacity key ={i} onPress = {()=> this.onOpenItem(product)}>
                <View style = {SearchProdStyles.superContainer}>
                <Image source = {{uri:product.imgURL}} style = {SearchProdStyles.productPic} />
                <View style = {SearchProdStyles.mainContainer}>
                    <View style = {SearchProdStyles.titleContainer}>
                        <Text style = {SearchProdStyles.titleText}>{product.name} </Text>
                        <Text style = {SearchProdStyles.titleText}> N{product.price}</Text>
                    </View>
                    <View style = {SearchProdStyles.sizeContainer}>
                      <Text style = {SearchProdStyles.titleText}>{product.size} </Text>
                  </View>
                    <Text style = {product.stock > 0? SearchProdStyles.goodText: SearchProdStyles.badText} >
                        {product.stock > 0? "available": "out of Stock"}
                    </Text>
                    <Text style = {SearchProdStyles.description}>
                        {"x" + product.stock + " in stock"} 
                    </Text>
                </View>
              </View>
  
              <View>
              
            </View>
              </TouchableOpacity>  
          ))}

          <View style = {SearchProdStyles.superContainer}>
            <Image source = {{uri:"../../../assets/white.png"}} style = {SearchProdStyles.modalPic} />
          </View>

          </View>
          
        </ScrollView>
        </View>
  );
}
}


const SearchProdStyles = StyleSheet.create({
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
