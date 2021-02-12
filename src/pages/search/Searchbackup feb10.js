import React from 'react'
import {View, ScrollView, TextInput, Text, Image, StyleSheet, FlatList} from 'react-native'
//import {BaseButton} from 'react-native-gesture-handler'
import {getProducts}from '../../api/ShopsApi'
//import Modal from 'react-native-modal';
import Fuse from 'fuse.js'
import { RefreshControl } from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'
import * as myEPT from '../../../assets/myEPT.json'

import { FloatingAction } from "react-native-floating-action";

import { TouchableOpacity } from '../../web/react-native-web'; //'react-native' //
//import { TouchableOpacity } from 'react-native' //

import * as Analytics from 'expo-firebase-analytics';





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
          loadingPic: true,
      }

      
      
  }

  

  renderProduct = ({product}) =>(
    product.name && 
                <TouchableOpacity key ={i} onPress = {()=> this.onOpenItem(product)}>
                  <View style = {SearchProdStyles.superContainer}>
                  <Image source = {{uri:product.imgURL}} style = {SearchProdStyles.productPic} />
                  <View style = {SearchProdStyles.mainContainer}>
                      <View style = {SearchProdStyles.titleContainer}>
                          <Text style = {SearchProdStyles.titleText}>{product.name} </Text>
                          <Text style = {SearchProdStyles.priceText}> N{product.price}</Text>
                      </View>
                      <View style = {SearchProdStyles.sizeContainer}>
                        <Text style = {SearchProdStyles.titleText}>{product.size} </Text>
                    </View>
                    {!product.shop &&
                    <View>
                    <Text style = {product.stock > 0? SearchProdStyles.goodText: SearchProdStyles.badText} >
                        {product.stock > 0? "available for immediate delivery": "out of Stock"}
                    </Text>
                    <Text style = {SearchProdStyles.description}>
                        {product.stock + " in stock"} 
                    </Text>
                    </View>
                    }
  
                    {product.shop &&
                     <View>
                    <Text style = {SearchProdStyles.goodText} >
                        {"available for next day delivery"}
                    </Text>
                    <Text style = {SearchProdStyles.description}>
                        {" in stock"} 
                    </Text>
                    </View>
                    }
                  </View>
                </View>
    
                <View>
                
              </View>
                </TouchableOpacity>  
  )


  componentDidMount = async () =>{
    if (this.props.params){
      const { route } = this.props;
      const { state } = route.params;
      this.setState({ state })
    }
    try{
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      await getProducts(this.productsRetrieved)//, ()=>{
      this.setState({loadingPic: false})
      console.log('loading pic: '+ this.state.loadingPic)
      //})
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
    Analytics.logEvent('searchItem', {
      query: this.state.searchQuery,
    })
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

onViewMore = () =>{
  console.warn(myEPT.ept)
  const { navigation } = this.props;
  navigation.navigate('More Apps')
}

onClearSearch  = () =>{
  this._onRefresh()
}


render(){
  
  return (
      <View style = {SearchProdStyles.allContainer}>
     <View >
        <TextInput 
            placeholder= "search for a product"  
            style={SearchProdStyles.searchBox} 
            onChangeText={(text) => this.setState({searchQuery: text})} 
            value={this.state.searchQuery} 
            onSubmitEditing = {() => this.onSearchProducts(this.state.searchQuery)}
        /> 

        <TouchableOpacity style = {SearchProdStyles.modalButton} onPress = {() => this.onClearSearch() }>
            <Text style = {SearchProdStyles.buttonText}>CLEAR SEARCH</Text>
          </TouchableOpacity>

          <TouchableOpacity  onPress= {() => this.onViewBasket() } style = {SearchProdStyles.modalButton}>
            <Text style = {SearchProdStyles.buttonText}>OPEN BASKET</Text>
          </TouchableOpacity>

       
      </View>

      
            <Image source = {{uri: require("../../../assets/loading.gif")}} style = {this.state.loadingPic == true? SearchProdStyles.loadingPic: SearchProdStyles.loadingPicHide} />
          
      
      <ScrollView 
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
                      <Text style = {SearchProdStyles.priceText}> N{product.item.price}</Text>
                  </View>
                  <View style = {SearchProdStyles.sizeContainer}>
                      <Text style = {SearchProdStyles.titleText}>{product.item.size} </Text>
                  </View>
                  {!product.item.shop &&
                  <View>
                  <Text style = {product.item.stock > 0? SearchProdStyles.goodText: SearchProdStyles.badText} >
                      {product.item.stock > 0? "available for immediate delivery": "out of Stock"}
                  </Text>
                  <Text style = {SearchProdStyles.description}>
                      {product.item.stock + " in stock"} 
                  </Text>
                  </View>
                  }

                  {product.item.shop &&
                   <View>
                  <Text style = {SearchProdStyles.goodText} >
                      {"available for next day delivery"}
                  </Text>
                  <Text style = {SearchProdStyles.description}>
                      {" in stock"} 
                  </Text>
                  </View>
                  }
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
                        <Text style = {SearchProdStyles.priceText}> N{product.price}</Text>
                    </View>
                    <View style = {SearchProdStyles.sizeContainer}>
                      <Text style = {SearchProdStyles.titleText}>{product.size} </Text>
                  </View>
                  {!product.shop &&
                  <View>
                  <Text style = {product.stock > 0? SearchProdStyles.goodText: SearchProdStyles.badText} >
                      {product.stock > 0? "available for immediate delivery": "out of Stock"}
                  </Text>
                  <Text style = {SearchProdStyles.description}>
                      {product.stock + " in stock"} 
                  </Text>
                  </View>
                  }

                  {product.shop &&
                   <View>
                  <Text style = {SearchProdStyles.goodText} >
                      {"available for next day delivery"}
                  </Text>
                  <Text style = {SearchProdStyles.description}>
                      {" in stock"} 
                  </Text>
                  </View>
                  }
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

  alCenterText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    alignSelf: 'center',
  },
  goodCenterText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    alignSelf: 'center',
  },
  badCenterText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
  },
  badText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  goodText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  searchBox: {
    height: hp(percHeight(50)), 
    marginTop: 5,
    marginBottom: 10,
    paddingLeft: 0,
    textAlign: 'center',
    fontSize: hp(percHeight(18*1.25)),
    color: '#707070',
    borderColor: '#c0c0c0',
    borderWidth: 1,
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
  loadingPic:{
    width: hp(percHeight(50)),
    height: hp(percHeight(50)),
    alignSelf:'center',
    alignContent: 'center',
  },
  loadingPicHide:{
    width: hp(percHeight(1)),
    height: hp(percHeight(1)),
    alignSelf:'center',
    alignContent: 'center',
  },

  modalText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(20*1.25)),
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

  modalButton2: {
    width: hp(percHeight(200)),
    margin: hp(percHeight(5)),
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
    fontSize: hp(percHeight(12*1.25)),
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  
  allContainer:{
    alignSelf : 'center',
    width: wp("100%") < hp(percHeight(450))? wp("100%") : hp(percHeight(450)),//hp("67%") < wp("100%")? hp("67%"): wp("100%"),- BS
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 0,
    marginLeft: hp(percHeight(5)),
    alignContent: 'flex-end',
    //width: "30%", //doesnt work

  },
  superContainer:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  mainContainer: {
    width:"75%",// hp(percHeight(350)),
    margin : hp(percHeight(5)),

  },
  description: {
    margin: hp(percHeight(5)),
    fontSize: hp(percHeight(12*1.25)),

  },
  titleText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    width: "75%",
  },

  priceText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    
  },
  

  
  productPic:{
    width: "20%",//hp(percHeight(80)),
    height: wp("20%") < hp(percHeight(80))? wp("20%") : hp(percHeight(80)),//used width to maintain ratio- very slight difference
    margin: hp(percHeight(5)),
  },
  
     


})
