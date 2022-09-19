import React from 'react'
import {View, ScrollView, TextInput, Text, Image, StyleSheet, FlatList, Linking} from 'react-native'
import {SearchBar} from 'react-native-elements'
import {getProperties}from '../../api/PropertiesAPI'//using local storage instead

import Fuse from 'fuse.js'
import { RefreshControl } from 'react-native';

import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import {percWidth, percHeight} from '../../api/StyleFuncs'


import { TouchableOpacity } from '../../web/react-native-web'; //'react-native' //

import * as Analytics from 'expo-firebase-analytics';




function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}



export default class SearchProperties extends React.Component{
  constructor(props){
      super(props)
      this.propList = []
      this.stockpropList = []
      this.state = {
          Properties: [],
          stockProperties: [],
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
      
      });
      
      
  }

  


  componentDidMount = async () =>{
    //this._loadAssetsAsync()
    if (this.props.params){
      const { route } = this.props;
      const { state } = route.params;
      this.setState({ state })
    }
    try{
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      //this.stockpropList = await getProperties()
      this.propList = require('../../../assets/properties.json')
      console.warn(this.propList)
      this.setState({stockProperties: this.propList})
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

  


  onOpenItem =(Property) => {
    console.log("Item pressed")
    //this.setState({current : Property})
    const { navigation } = this.props;
    navigation.navigate(
      'Add Item',
      {current: Property,
      itemObj: this.state.itemObj}
    )
  }


  onSearchProperties = async () => {
    this.setState({loadingPic: true})//*************************************for API
    this.setState({category: ''})//**********************************
    if (this.state.count == 0){
      //await getProperties(this.PropertiesRetrieved)//count is increased in callback
      this.setState({count: this.state.count+1})
    }
    Analytics.logEvent('searchItem', {
      query: this.state.searchQuery,
    })
    const options = {
      includeScore: true,
      keys: [
        {name: 'name', weight: 0.2},
        {name: 'city', weight: 0.2},
        {name: 'region', weight: 0.2},
        {name: 'prop_type', weight: 0.2},
        {name: 'sale_type', weight: 0.2},
      ]
    }
  
  const fuse = new Fuse(this.propList, options)
  if (this.state.searchQuery !== ""){
    this.setState({searchUsed: true})
    this.setState({loadingPic: true}) //too quick to display thus useless
    const result = fuse.search(this.state.searchQuery,{limit:250})
    console.log(result)
    this.setState({Properties :[]})
    this.setState({Properties :result})
    console.log(this.state.Properties)
    this.setState({loadingPic: false})
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
  const { navigation } = this.props;
  navigation.navigate('More Apps')
}

onClearSearch  = () =>{//used for clearing search and loading only immediate
  this.setState({category: 'Immediate'})
  this._onRefresh()
}

onMoreInfo = () =>{
  let msg = `Hello, I want these items: %0A %0A`
  let chat = `http://api.whatsapp.com/send?text=${msg}&phone=+2348090653657`
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
        //await getProperties(this.PropertiesRetrieved)
        this.setState({count: this.state.count+1})
      }
      Analytics.logEvent('searchItem', {
        query: category,
      })
      const options = {
        includeScore: true,
        keys: [
          {name: 'city', weight: 1.0},
        ]
      }
    
      const fuse = new Fuse(this.propList, options)
      this.setState({searchUsed: true})
      const result = fuse.search('='+category, {limit: 250})
      this.setState({Properties :[]})
      this.setState({Properties :result})
    }
    this.setState({loadingPic: false})
    this.refs._scrollView.scrollTo({x: 0, y: 0, animated: false})
  //},1000)
}

render(){
    
  return (
    
    <View style = {{backgroundColor: 'white', height: '110%', borderColor:'#c0c0c0', borderWidth: .5,}}>
      <View style = {SearchPropStyles.allContainer}>
     <View style = {{backgroundColor: 'white', borderColor:'#c0c0c0', borderWidth: .5,}}>
        <SearchBar 
            placeholder= "search over 1300 properties"  
            inputStyle={SearchPropStyles.searchBox} 
            containerStyle={SearchPropStyles.searchBox} 
            inputContainerStyle={SearchPropStyles.searchBox} 
            autoCorrect={false}
            lightTheme="true"
            onChangeText={(text) => {
              //this.setState({searchUsed: false, category: ''})
              //this.refs._scrollView.scrollTo({x: 0, y: 0, animated: false})
              this.setState({searchQuery: text})
            }} 
            value={this.state.searchQuery} 
            onSubmitEditing = {() => this.onSearchProperties(this.state.searchQuery)}
        /> 

        

  <ScrollView horizontal = {true} style = {{marginTop: hp(percHeight(10)), marginBottom: hp(percHeight(10)), height: '30%', backgroundColor: 'white',}}>
  <TouchableOpacity onPress = {() => this.onSelectCat('Immediate') }>
            <Text style = {this.state.category == "Immediate"?SearchPropStyles.selectecCatText: SearchPropStyles.catText} >All Properties</Text>
  </TouchableOpacity>
  
  <TouchableOpacity onPress = {() => this.onSelectCat('Cesion de remate') }>
            <Text style = {this.state.category == "Cesion de remate"?SearchPropStyles.selectecCatText: SearchPropStyles.catText} >Cesion de remate</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress = {() => this.onSelectCat('Cesion de credito') }>
            <Text style = {this.state.category == "Cesion de credito"?SearchPropStyles.selectecCatText: SearchPropStyles.catText} >Cesion de credito</Text>
  </TouchableOpacity>
 
 
  <TouchableOpacity onPress = {() => this.onMoreInfo() }>
            <Text  style = {SearchPropStyles.catTextGood}>Contact Us</Text>
  </TouchableOpacity>

    
  </ScrollView>

          
          

       
      </View>

      <View style = {{backgroundColor: 'white',}}>
            <Image source = {{uri: require("../../../assets/loading.gif")}} style = {this.state.loadingPic == true? SearchPropStyles.loadingPic: SearchPropStyles.loadingPicHide} />
            </View>
    
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
            this.state.Properties.map((Property,i) =>(
            Property.item.name && 
            <TouchableOpacity key ={i} onPress = {()=> this.onOpenItem(Property.item)}>
              <View style = {SearchPropStyles.superContainer}>
                
              <View style = {SearchPropStyles.mainContainer}>

             

             
              <View>
                  <View style = {SearchPropStyles.titleContainer}>
                    
                      <Text style = {SearchPropStyles.titleText}>{Property.item.number}.{Property.item.name} </Text>
                    
                  </View>
                  <View style = {SearchPropStyles.sizeContainer}>
                      <Text style = {SearchPropStyles.titleText}>{Property.item.region} </Text>
                      <Text style = {SearchPropStyles.priceText}>Auction price: €{Property.item.start_bid}k</Text>
                  </View>

                  <View>
                  <Text style = {SearchPropStyles.description}>{Property.item.close_date}</Text>
                </View>
                  

                  <View>
                    <Text style = {SearchPropStyles.goodText} >
                      {Property.item.city+'\n'+Property.item.prop_type+'\n'+Property.item.sale_type}
                    </Text>
                    
                  </View>
                  
              </View>
            

           
              </View>
            </View>
   
           
            </TouchableOpacity>

          ))}

          {this.state.searchUsed == false &&
            this.state.stockProperties.map((Property,i) =>(
              Property.name && 
              <TouchableOpacity key ={i} onPress = {()=> this.onOpenItem(Property)}>
                <View style = {SearchPropStyles.superContainer}>
              
                <View style = {SearchPropStyles.mainContainer}>

                  
                

                  
                  <View>
                    <View style = {SearchPropStyles.titleContainer}>
                        <Text style = {SearchPropStyles.titleText}>{Property.number}.{Property.name} </Text>
                      
                    </View>
                    <View style = {SearchPropStyles.sizeContainer}>
                      <Text style = {SearchPropStyles.titleText}>{Property.region} </Text>
                      <Text style = {SearchPropStyles.priceText}>Auction price: €{Property.start_bid}k</Text>
                  </View>

                  <View>
                  <Text style = {SearchPropStyles.description}>{Property.close_date}</Text>
                  </View>

                  <View>
                      <Text style = {SearchPropStyles.goodText} >
                          {Property.city+'\n'+Property.prop_type+'\n'+Property.sale_type}
                      </Text>
                      
                    </View>

                  </View>
                  
                </View>
              </View>
  
            
              </TouchableOpacity>  
                ))}

          

          <View >
            <Image source = {{uri:"../../../assets/white.png"}} style = {SearchPropStyles.modalPic} />
          </View>

          </View>
          
          
        </ScrollView>

        <Image source = {{uri:"../../../assets/logo2.png"}} style = {{alignSelf: 'center', height: 10, width: 10,}} />
        </View>
         </View>
      
  );
}
}


const SearchPropStyles = StyleSheet.create({

  alCenterText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    marginLeft: hp(percHeight(5)),
    alignSelf: 'center',
  },
  goodCenterText: {
    color: 'purple',
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
    color: 'purple',
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    //marginLeft: hp(percHeight(5)),
    //alignSelf: 'center',
  },
  mediumText: {//same as good but up for change
    color: 'purple',
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
    width:"100%",// hp(percHeight(350)),
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
    width: "100%",
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
    color: 'purple',
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
    marginRight: '10%',
    color: 'black',
  },

  priceTextGood: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    color: 'purple',
    marginRight: '10%'

  },

  priceTextBad: {
    fontWeight: 'bold',
    fontSize: hp(percHeight(12*1.25)),
    alignSelf: 'center',
    color: 'red',
    marginRight: '10%'
    
  },
  

  
  PropertyPic:{
    width: "30%",//hp(percHeight(80)),
    height: hp("20%") < hp(percHeight(80))? hp("20%") : hp(percHeight(120)),//used width to maintain ratio- very slight difference
    margin: hp(percHeight(5)),
    marginTop: hp(percHeight(10)),
    
    
  },
  
     


})
