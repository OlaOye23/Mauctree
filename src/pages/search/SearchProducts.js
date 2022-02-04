import React from 'react'
import {View, ScrollView, TextInput, Text, Image, StyleSheet, FlatList, Linking} from 'react-native'
import {SearchBar} from 'react-native-elements'
//import SearchBar from 'react-native-platform-searchbar'
//import {BaseButton} from 'react-native-gesture-handler'
import {getProducts, getStockProducts}from '../../api/ShopsApi'
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
import { AsyncStorage } from 'react-native';

import basketPic from '../../../assets/basketActive.png'
import whatsappPic from '../../../assets/whatsapp.png'
import hamburgerPic from '../../../assets/hamburger.png'
import locationPic from '../../../assets/location.png'
import noImgPic from '../../../assets/noImgPic.png'

import AppLoading from 'expo-app-loading';
//import ProductsJSON from '../../../assets/images.json'


function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}



export default class SearchProducts extends React.Component{
  constructor(props){
      super(props)
      this.prodList = []
      this.stockProdList = []
      this.state = {
          products: [],
          stockProducts: [],
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
          category: "Immediate",
          
          disableAddButton: true,
          loadingPic: true,
          count: 0,
          isReady: false,
      }

      

      const {navigation} = this.props
      navigation.setOptions({
        headerLeft: () => (
          <View style = {{flex: 1, flexDirection: 'row', marginLeft: 15,}}>
          <TouchableOpacity
            onPress={() => {
              const { navigation } = props;
              navigation.navigate('More Apps')}
            }
          >
          <Image 
          style={{ width: 40, height: 40, marginTop: 14,  marginLeft: 0, }} 
          alt = "Open Menu" 
          source = {hamburgerPic}
            />
          </TouchableOpacity>

          
           </View>
        ),
        headerRight: () => (
          <View style = {{flex: 1, flexDirection: 'row'}}>

              <TouchableOpacity
                onPress={() => {
                  const { navigation } = props;
                  navigation.navigate('Location')}
                }
              >
              <Image 
              style={{ width: 40, height: 40, marginLeft: 10, marginTop: 15 }} 
              alt = "Change Location" 
              source = {locationPic}
               />
              </TouchableOpacity>

            <TouchableOpacity
                onPress = {() => this.onMoreInfo() }
              >
              <Image 
              style={{ width: 40, height: 40, marginLeft: 15, marginRight: 10, marginTop: 15 }} 
              alt = "Whatsapp" 
              source = {whatsappPic}
               />
              </TouchableOpacity>


              <TouchableOpacity
                onPress={() => {
                  const { navigation } = props;
                  navigation.navigate('Basket')}
                }
              >
              <Image 
              style={{ width: 40, height: 40, marginRight: 20, marginTop: 15 }} 
              alt = "Go to basket" 
              source = {basketPic}
               />
              </TouchableOpacity>

              
            </View>
        ),
      });
      
      
  }

  _loadAssetsAsync = async () =>{
   /*let imagesURL = []
    Images.forEach((prod)=>{
      imagesURL.push(prod.imgURL)
    })
    console.log(imagesURL)
    const imageAssets = cacheImages(imagesURL);
    //alert(imagesURL)

    await Promise.all([...imageAssets]);*/
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
                        {"available for immediate delivery"}
                    </Text>
                    <Text style = {SearchProdStyles.description}>
                        {product.stock + " in store"} 
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
    //this._loadAssetsAsync()
    if (this.props.params){
      const { route } = this.props;
      const { state } = route.params;
      this.setState({ state })
    }
    try{
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      //await getStockProducts(this.stockProductsRetrieved)
      this.stockProdList = require('../../../assets/productsStock.json')
      this.setState({stockProducts: this.stockProdList})
      this.setState({loadingPic: false})
      //getProducts(this.productsRetrieved)//, ()=>
      this.prodList = require('../../../assets/products.json')
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

  getAllLocalData = async () =>{//for basket count --- use redux-like central state mgmt
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

  
  productsRetrieved = (productList) =>{
    console.log('retrieved')
    //this._loadAssetsAsync(productList)
    function dynamicSort(property) {
      var sortOrder = 1;
      if(property[0] === "-") {
          sortOrder = -1;
          property = property.substr(1);
      }
      return function (a,b) {
          /* next line works with strings and numbers, 
           * and you may want to customize it to your needs
           */
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
      }
  }

    this.prodList = productList.sort(dynamicSort('shop'))//.reverse()
    console.log(productList)
    //this.setState({products: this.prodList})
    this.setState({count: this.state.count+1})
  }

  stockProductsRetrieved = (productList) =>{
    console.log('retrieved')

    function dynamicSort(property) {
      var sortOrder = 1;
      if(property[0] === "-") {
          sortOrder = -1;
          property = property.substr(1);
      }
      return function (a,b) {
          /* next line works with strings and numbers, 
           * and you may want to customize it to your needs
           */
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
      }
  }

    this.stockProdList = productList.sort(dynamicSort('stock')).reverse()
    console.log(productList)
    this.setState({stockProducts: this.stockProdList})
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


  onSearchProducts = async () => {
    //this.setState({loadingPic: true})*************************************for API
    //this.setState({category: ''})**********************************
    if (this.state.count == 0){
      //await getProducts(this.productsRetrieved)//count is increased in callback
      this.setState({count: this.state.count+1})
    }
    //setTimeout(()=>{
    Analytics.logEvent('searchItem', {
      query: this.state.searchQuery,
    })
    const options = {
      includeScore: true,
      keys: [
        {name: 'name', weight: 0.7},
        {name: 'category', weight: 0.1},
        {name: 'subcat', weight: 0.1},
        {name: 'tags', weight: 0.1},
      ]
    }
  
  const fuse = new Fuse(this.prodList, options)
  if (this.state.searchQuery !== ""){
    this.setState({searchUsed: true})
    //this.setState({loadingPic: true}) //too quick to display thus useless
    const result = fuse.search(this.state.searchQuery,{limit:250})
    console.log(result)
    this.setState({products :[]})
    this.setState({products :result})
    console.log(this.state.products)
    //this.setState({loadingPic: false})
  }
  else{
    this.setState({searchUsed: false})
    this.componentDidMount()
  }
  this.setState({loadingPic: false})
//},1000)
this.refs._scrollView.scrollTo({x: 0, y: 0, animated: false})
}


_onRefresh= () => {
  this.setState({searchUsed: false});
  this.setState({refreshing: true});
  this.setState({searchQuery: ""})
  this.setState({loadingPic: true})
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

onClearSearch  = () =>{//used for clearing search and loading only immediate
  this.setState({category: 'Immediate'})
  this._onRefresh()
}

onMoreInfo = () =>{
  let msg = `Hello, I want these items: %0A %0A`
  let chat = `http://api.whatsapp.com/send?text=${msg}&phone=+2348097908824`
  Linking.openURL(chat)
}

onSelectCat = async (category )=>{
  //setTimeout(async()=>{
    console.log(category)
    
    this.setState({loadingPic: true})
    this.setState({searchUsed: false, searchQuery: '', category: category})
    if (category == "Immediate"){
      this.onClearSearch()
    }

    else{
      
      if (this.state.count == 0){
        //await getProducts(this.productsRetrieved)
        this.setState({count: this.state.count+1})
      }

      Analytics.logEvent('searchItem', {
        query: category,
      })

      const options = {
        includeScore: true,
        keys: [
          {name: 'category', weight: 1.0},
        ]
      }
    
      const fuse = new Fuse(this.prodList, options)
      this.setState({searchUsed: true})
      const result = fuse.search('='+category, {limit: 250})
      this.setState({products :[]})
      this.setState({products :result})
      //console.log(this.state.products.length)
      
      
    }
    this.setState({loadingPic: false})
    this.refs._scrollView.scrollTo({x: 0, y: 0, animated: false})
  //},1000)
}

render(){
  /*if (!this.state.isReady) {
    //console.log('READDDDDDDDDDDY')
    return (
      <AppLoading
        startAsync={this._loadAssetsAsync}
        onFinish={() => this.setState({ isReady: true })}
        onError={console.warn}
      />
    );
  }*/
 
    
  return (
    
    <View style = {{backgroundColor: 'white', height: '110%', borderColor:'#c0c0c0', borderWidth: .5,}}>
      <View style = {SearchProdStyles.allContainer}>
     <View style = {{backgroundColor: 'white', borderColor:'#c0c0c0', borderWidth: .5,}}>
        <SearchBar 
            placeholder= "search over 3000 groceries"  
            inputStyle={SearchProdStyles.searchBox} 
            containerStyle={SearchProdStyles.searchBox} 
            inputContainerStyle={SearchProdStyles.searchBox} 
            autoCorrect={false}
            lightTheme="true"
            onChangeText={(text) => {
              //this.setState({searchUsed: false, category: ''})
              //this.refs._scrollView.scrollTo({x: 0, y: 0, animated: false})
              this.setState({searchQuery: text})
            }} 
            value={this.state.searchQuery} 
            onSubmitEditing = {() => this.onSearchProducts(this.state.searchQuery)}
        /> 

        {/*<TouchableOpacity style = {SearchProdStyles.modalButton} onPress = {() => this.onClearSearch() }>
            <Text style = {SearchProdStyles.buttonText}>CLEAR SEARCH</Text>
          </TouchableOpacity>*/}

  <ScrollView horizontal = {true} style = {{marginTop: hp(percHeight(10)), marginBottom: hp(percHeight(10)), height: '30%', backgroundColor: 'white',}}>
  <TouchableOpacity onPress = {() => this.onSelectCat('Immediate') }>
            <Text style = {this.state.category == "Immediate"?SearchProdStyles.selectecCatText: SearchProdStyles.catText} >Immediate Delivery</Text>
  </TouchableOpacity>
  {/*<TouchableOpacity onPress = {() => this.onSelectCat('Fresh') }>
            <Text style = {this.state.category == "Fresh"?SearchProdStyles.selectecCatText: SearchProdStyles.catText} >Fresh</Text>
  </TouchableOpacity>*/}
  <TouchableOpacity onPress = {() => this.onSelectCat('Breakfast') }>
            <Text style = {this.state.category == "Breakfast"?SearchProdStyles.selectecCatText: SearchProdStyles.catText} >Breakfast</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress = {() => this.onSelectCat('Snacks') }>
            <Text style = {this.state.category == "Snacks"?SearchProdStyles.selectecCatText: SearchProdStyles.catText} >Snacks</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress = {() => this.onSelectCat('Ingredients') }>
            <Text style = {this.state.category == "Cooking"?SearchProdStyles.selectecCatText: SearchProdStyles.catText} >Cooking</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress = {() => this.onSelectCat('Baking') }>
            <Text style = {this.state.category == "Baking"?SearchProdStyles.selectecCatText: SearchProdStyles.catText} >Baking</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress = {() => this.onSelectCat('Drinks') }>
            <Text style = {this.state.category == "Drinks"?SearchProdStyles.selectecCatText: SearchProdStyles.catText} >Drinks</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress = {() => this.onSelectCat('Alcohol') }>
            <Text style = {this.state.category == "Alcohol"?SearchProdStyles.selectecCatText: SearchProdStyles.catText} >Alcohol</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress = {() => this.onSelectCat('Baby') }>
            <Text style = {this.state.category == "Baby"?SearchProdStyles.selectecCatText: SearchProdStyles.catText}>Baby</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress = {() => this.onSelectCat('Household') }>
            <Text style = {this.state.category == "Household"?SearchProdStyles.selectecCatText: SearchProdStyles.catText} >Household</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress = {() => this.onSelectCat('Health') }>
            <Text  style = {this.state.category == "Toiletries"?SearchProdStyles.selectecCatText: SearchProdStyles.catText}>Toiletries</Text>
  </TouchableOpacity>
 
 
  <TouchableOpacity onPress = {() => this.onMoreInfo() }>
            <Text  style = {SearchProdStyles.catTextGood}>Submit your own list</Text>
  </TouchableOpacity>

    
  </ScrollView>

          
          

       
      </View>

      <View style = {{backgroundColor: 'white',}}>
            <Image source = {{uri: require("../../../assets/loading.gif")}} style = {this.state.loadingPic == true? SearchProdStyles.loadingPic: SearchProdStyles.loadingPicHide} />
            </View>
      {/* 450  */}
      <ScrollView 
        ref='_scrollView'
      	style={{ maxHeight: hp(percHeight(450)) }} 
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={()=>this._onRefresh.bind(this)}/>}
          >
            
      <View style = {{backgroundColor: 'white',}}>
          {this.state.searchUsed == true &&
            this.state.products.map((product,i) =>(
            product.item.name && 
            <TouchableOpacity key ={i} onPress = {()=> this.onOpenItem(product.item)}>
              <View style = {SearchProdStyles.superContainer}>
                { product.item.imgURL &&
              <Image source = {{uri:product.item.imgURL}} style = {SearchProdStyles.productPic} />
                }
                {!product.item.imgURL &&
              <Image source = {noImgPic} style = {SearchProdStyles.productPic} />
                }
              <View style = {SearchProdStyles.mainContainer}>

              {product.item.shop &&
              <View>
                  <View style = {SearchProdStyles.titleContainer}>
                      <Text style = {SearchProdStyles.titleText}>{product.item.name}</Text>
                      <Text style = {SearchProdStyles.priceText}>N{product.item.price}</Text>
                  </View>
                  <View style = {SearchProdStyles.titleContainer}>
                  <Text style = {SearchProdStyles.description}>{"same day delivery"} </Text>
                      
                  </View>
                  {product.item.shop == "MoW"?
                   <View style = {SearchProdStyles.sizeContainer}>
                    <Text style = {SearchProdStyles.mediumText}>{"fulfilled by\nexternal vendor"} </Text>
                    </View>
                    :
                   <View style = {SearchProdStyles.sizeContainer}>
                       <Text style = {SearchProdStyles.mediumText}>{"select next day\nat checkout\nfor 10% off"} </Text>
                       {/*<Text style = {SearchProdStyles.priceTextGood}>N{parseInt(parseInt(product.item.price*.90)/10)*10} </Text>*/}
                   </View>
                    }

                </View>
              }

              {!product.item.shop &&
              <View>
                  <View style = {SearchProdStyles.titleContainer}>
                      <Text style = {SearchProdStyles.titleText}>{product.item.name} </Text>
                      <Text style = {SearchProdStyles.priceTextBad}> N{parseInt(parseInt(product.item.price*1.1+5)/10)*10}</Text>
                  </View>
                  <View style = {SearchProdStyles.sizeContainer}>
                      <Text style = {SearchProdStyles.titleText}>{product.item.size} </Text>
                      <Text style = {SearchProdStyles.priceText}> N{product.item.price}</Text>
                  </View>

                  <View>
                  <Text style = {SearchProdStyles.description}>{product.item.stock + " in store"}</Text>
                </View>
                  

                  <View>
                    <Text style = {SearchProdStyles.goodText} >
                        {"select immediate\nat checkout\n(19 mins delivery)"}
                    </Text>
                    
                  </View>
                  
              </View>
              }

           
              </View>
            </View>
   
           
            </TouchableOpacity>

          ))}

          {this.state.searchUsed == false &&
            this.state.stockProducts.map((product,i) =>(
              product.name && 
              <TouchableOpacity key ={i} onPress = {()=> this.onOpenItem(product)}>
                <View style = {SearchProdStyles.superContainer}>
                { product.imgURL &&
              <Image source = {{uri:product.imgURL}} style = {SearchProdStyles.productPic} />
                }
                {!product.imgURL &&
              <Image source = {noImgPic} style = {SearchProdStyles.productPic} />
                }
                <View style = {SearchProdStyles.mainContainer}>

                  {product.shop &&
                   <View>
                   <View style = {SearchProdStyles.titleContainer}>
                       <Text style = {SearchProdStyles.titleText}>{product.name}</Text>
                       <Text style = {SearchProdStyles.priceText}>N{product.price}</Text>
                   </View>
                   <View style = {SearchProdStyles.titleContainer}>
                       <Text style = {SearchProdStyles.description}>{"same day delivery"} </Text>
                       
                   </View>
                   {product.shop == "MoW"?
                   <View style = {SearchProdStyles.sizeContainer}>
                    <Text style = {SearchProdStyles.mediumText}>{"fulfilled by external vendor:\nMarket on Wheels"} </Text>
                    </View>
                    :
                   <View style = {SearchProdStyles.sizeContainer}>
                       <Text style = {SearchProdStyles.mediumText}>{"select next day\nat checkout\n for 10% off"} </Text>
                       {/*<Text style = {SearchProdStyles.priceTextGood}>N{parseInt(parseInt(product.price*.90)/10)*10} </Text>*/}
                   </View>
                    }
 
                 </View>
                  }

                  {!product.shop &&
                  <View>
                    <View style = {SearchProdStyles.titleContainer}>
                        <Text style = {SearchProdStyles.titleText}>{product.name} </Text>
                        <Text style = {SearchProdStyles.priceTextBad}> N{parseInt(parseInt(product.price*1.1+5)/10)*10}</Text>
                    </View>
                    <View style = {SearchProdStyles.sizeContainer}>
                      <Text style = {SearchProdStyles.titleText}>{product.size} </Text>
                      <Text style = {SearchProdStyles.priceText}>N{product.price}</Text>
                  </View>

                  <View>
                  <Text style = {SearchProdStyles.description}>{product.stock + " in store"}</Text>
                  </View>

                  <View>
                      <Text style = {SearchProdStyles.goodText} >
                          {"select immediate\nat checkout\n(19 mins delivery)"}
                      </Text>
                      
                    </View>

                  </View>
                  }
                </View>
              </View>
  
            
              </TouchableOpacity>  
                ))}

          

          <View >
            <Image source = {{uri:"../../../assets/white.png"}} style = {SearchProdStyles.modalPic} />
          </View>

          </View>
          
          
        </ScrollView>

        <Image source = {{uri:"../../../assets/logo2.png"}} style = {{alignSelf: 'center', height: 10, width: 10,}} />
        </View>
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
    //marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  goodText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    //marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  mediumText: {//same as good but up for change
    color: 'green',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    //marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  searchBox: {
    //height: hp(percHeight(50)), 
    width: '100%',
    //marginTop: 5,
    //marginBottom: 5,
    paddingLeft: 0,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: hp(percHeight(15*1.25)),
    backgroundColor: 'white',
    //borderColor: 'black',
    //borderWidth: 1,
  },

  searchBoxOld: {
    height: hp(percHeight(50)), 
    width: '98%',
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 0,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: hp(percHeight(15*1.25)),
    backgroundColor: 'white',
    borderColor: 'black',
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
    backgroundColor: 'white',
    alignSelf : 'center',
    width: wp("100%") < hp(percHeight(450))? wp("100%") : hp(percHeight(450)),//hp("67%") < wp("100%")? hp("67%"): wp("100%"),- BS
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),

  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //margin: hp(percHeight(5)),

  },
  superContainer:{
    borderColor:'#c0c0c0',
    borderWidth: .5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: hp(percHeight(5)),
    paddingTop: hp(percHeight(5)),
    paddingBottom: hp(percHeight(5)),

  },
  mainContainer: {
    width:"65%",// hp(percHeight(350)),
    margin : hp(percHeight(5)),

  },
  description: {
    margin: hp(percHeight(0)),
    fontSize: hp(percHeight(12*1.25)),

  },
  titleText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    width: "75%",
  },

  selectecCatText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    //width: "75%",
    margin: hp(percHeight(5)),
    //borderColor: 'black',
    //borderWidth: 1,
  },

  catTextGood: {
    //fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    //width: "75%",
    margin: hp(percHeight(5)),
    color: 'green',
  },

  catText: {
    //fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    //width: "75%",
    margin: hp(percHeight(5)),
  },

  priceText: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    
  },

  priceTextGood: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    color: 'green',

  },

  priceTextBad: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    color: 'red',
    textDecorationLine: 'line-through',
    
  },
  

  
  productPic:{
    width: "30%",//hp(percHeight(80)),
    height: hp("20%") < hp(percHeight(80))? hp("20%") : hp(percHeight(120)),//used width to maintain ratio- very slight difference
    margin: hp(percHeight(5)),
    marginTop: hp(percHeight(10)),
    
    
  },
  
     


})
