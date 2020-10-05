import React from 'react';//import react
import { View, Picker, Text, TextInput, Modal, TouchableOpacity, Animated, Image, StyleSheet } from 'react-native';//import native ocmponents
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';//import map feaures
import Geocoder from 'react-native-geocoding'; //import geocoder i.e long/lat --> address
import {loadDriverLoc} from '../../api/ShopsApi'//to access firestore
import {BaseButton} from 'react-native-gesture-handler'//using BaseButton because Touchable Opacity functions act weird with react-gesture-handler(navigation)
import * as defaultLoc from '../../../assets/defaultLoc.json'
import yellow from '../../../assets/yellz.png'
import black from '../../../assets/black.jpg'







export default class TrackDriver extends React.Component {// create an externally visisble (export) component
	constructor(props) {//initialise the component with a constructor
    super(props);//enable features from {Component}
    this.state = {//initialise the  state with cab positions and initial map position
      count: 0,
      reportModalVisible: false,//make the confirmation modal hidden or displayed
      reports: [],// to storre loaded reports
      timeText: new Date,//to display date field
      timeLimit: 15,//to determine what data is relevant to be shown
      nowTime: (new Date - 0)/60000,// to determine the time now
      inputAddr: defaultLoc.address,//to take in an input address
      forceRefresh: Math.floor(Math.random() * 100000000),//to force a re-render
      notFoundModalVisible: false,//to toggle modal for an invalid address
      toLoad: false,//to decide whether to load reports or not
      reportNotificationModalVisible: false,//to toggle the visibility of the notification modal
      disableLoad: false,// to 
      loadMsg: 'CHECK IF THERE IS LIGHT',
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
      latitude: 19.8,
      longitude:  28.2,
      imgSize: 50,
      markerLat : 10,
      markerLong: 10,
    };
   


  this.t = setInterval(() => {
    this.setState({ count: this.state.count + 1 });
    if (this.state.count % 60 == 0){
        this.componentDidMount()
    }
  }, 1000);


  }

  


 
  

  componentDidMount = () =>{ 
    loc = loadDriverLoc()
    console.warn(loc[0])
    this.setState({latitude:loc[0], longitude: loc[1]})
  }

         
  
  
  onRegionChange = async (region) => {//define what to do when the displayed region changes
    if(this.timeoutId) clearTimeout(this.timeoutId);
        try {//try-catch block
          this.state.latitude = region.latitude
          this.state.longitude = region.longitude 
        } catch (err) {// error handling
          console.log(err)//log errors
        }
        setTimeout(()=>{  
          //this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
      }, 5000);//timeout after 2 seconds
	}

  onZoomIn = () => {
    //if (this.state.latitudeDelta >= 0.015 || this.state.longitudeDelta >= 0.015){
      this.setState({
        latitudeDelta: this.state.latitudeDelta * 0.5,
        longitudeDelta: this.state.longitudeDelta * 0.5,
      })
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
  // }
    }
  
  onZoomOut = () => {
  //if (this.state.latitudeDelta <= 0.025 || this.state.longitudeDelta <= 0.025){
    this.setState({
      latitudeDelta: this.state.latitudeDelta / 0.5,
      longitudeDelta: this.state.longitudeDelta / 0.5,
    })
    this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
  //   }
  }
  
  onMarkerZoomIn = () => {
    //if (this.state.latitudeDelta >= 0.015 || this.state.longitudeDelta >= 0.015){
      this.setState({
        imgSize: this.state.imgSize * 1.5,
      })
      this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
  // }
    }
  
  onMarkerZoomOut = () => {
  //if (this.state.latitudeDelta <= 0.025 || this.state.longitudeDelta <= 0.025){
    this.setState({
      imgSize: this.state.imgSize / 1.5,
    })
    this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
  //   }
  }

  onClearAllZoom = () => {
    this.setState({
      imgSize: 15,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
    this.setState({forceRefresh: Math.floor(Math.random() * 100000000)})
  //   }
  }
  

  render() {//what to display
    console.log('rendering')
		return (
	<View key = {this.state.forceRefresh}  style={{flex: 1}}>
        <MapView
          provider = {PROVIDER_GOOGLE}
          key={2} 
          style={mapStyles.fullScreenMap}  
          onRegionChange ={this.onRegionChange}
					initialRegion={{//set the initial position of the map as non-state variable
            latitude: 6.468,
            longitude: 3.540,
            latitudeDelta: this.state.latitudeDelta ,
            longitudeDelta: this.state.longitudeDelta
          }}
		>
    
				<MapView.Marker 
				    	key={this.state.forceRefresh} 
                        coordinate={(this.state.latitude !== undefined) ? {
                            latitude: parseFloat(this.state.markerLat ),
                            longitude: parseFloat(this.state.markerLong ) ,
                          }: {latitude: 6.468,
                            longitude: 3.540}}
                    icon={{
                        url: null
                    }}
                >
                    <View  >
                        <Image source= {require('../../../assets/icon.png')} 
                        style = {{height: this.state.imgSize, width: this.state.imgSize, borderRadius: this.state.imgSize/2}}
                        />
                    </View>
            
				</MapView.Marker> 
        
		</MapView>
          

        <View style= {mapStyles.zoomContainer}>

          <Text style={mapStyles.settingsTitle}>Zoom Level:</Text>
          <View style= {mapStyles.markerZoomContainer}>
            <BaseButton style={mapStyles.zoomButton} onPress={this.onZoomIn}>
              <Text style={mapStyles.zoomButtonText}>+</Text>
            </BaseButton>
            <BaseButton style={mapStyles.zoomButton} onPress={this.onZoomOut}>
              <Text style={mapStyles.zoomButtonText}>-</Text>
            </BaseButton>
          </View>

          <Text style={mapStyles.settingsTitle}>Indicator Size:</Text> 
          <View style= {mapStyles.markerZoomContainer}>
            <BaseButton style={mapStyles.zoomButton} onPress={this.onMarkerZoomIn}>
              <Text style={mapStyles.zoomButtonText}>+</Text>
            </BaseButton>
            <BaseButton style={mapStyles.zoomButton} onPress={this.onMarkerZoomOut}>
              <Text style={mapStyles.zoomButtonText}>-</Text>
            </BaseButton>
          </View>

          <Text style={mapStyles.settingsTitle}>Clear Zoom:</Text> 
          <View style= {mapStyles.markerZoomContainer}>
            <BaseButton style={mapStyles.clearZoomButton} onPress={this.onClearAllZoom}>
              <Text style={mapStyles.zoomButtonText}>X</Text>
            </BaseButton>
          </View>

        </View>
      </View>
    );
	}
}

const mapStyles = StyleSheet.create({
  fullScreenMap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0, 
  },
  statusPic: {
      height: 30,
      width: 30,
      borderRadius:15,
  },
  zoomContainer:{
    margin: 20,
    marginLeft: 250, 
    marginTop: 130,
    marginBottom:0,
    alignContent: 'center'
  },
  zoomButton: {
    backgroundColor: 'black',
    height: 40,
    width: 40,
    margin: 5,
    padding: 5,
    borderRadius: 20,
    alignSelf: 'center',
  },
  clearZoomButton: {
    backgroundColor: 'black',
    height: 40,
    width: 40,
    margin: 5,
    padding: 5,
    borderRadius: 20,
    alignSelf: 'center',
    marginLeft: 30,
  },
  markerZoomContainer: {
    flexDirection: 'row',
    //margin: 20,
    //marginLeft: 120, 
    //marginTop: 10,
    alignContent: 'center'
  },
  zoomButtonText: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 20
  },
  overlay: {
    flex: 1,
    backgroundColor: '#0006',
    justifyContent: 'center'
  },
  container: {
    backgroundColor: 'white',
    alignSelf: 'center',
    padding: 20,
    borderColor: '#ccc',
    borderWidth: 1
  },
  title: {
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsTitle: {
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#808080'
  },
  plainText: {
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 12,
    fontWeight: 'normal'
  },
  spinner: {
    resizeMode: 'contain',
    height: 50,
    width: 50,
    margin: 50,
    alignSelf: 'center'
  },
  loadButton: {
    margin: 5,
    marginTop: 0,
    marginLeft: 40,
    marginRight: 40,
    height: 35,
    alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'black',
  
  },
  button: {
    margin: 10,
    marginTop: 0,
    alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'black',
  
  },
  closeButton: {
    margin: 20,
    alignItems: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'black',
  },
  closeButtonText: {
    marginBottom: 10,
    color: 'white',
    alignSelf: 'center',
    fontSize: 20
  },
  container2: {
    paddingTop: 0,
    backgroundColor: 'white',
    marginBottom: 5,
    height: 50,
    marginTop:0,
    padding: 0,
    borderColor: '#ffffff',
    borderWidth: 1
  },
  container3: {
    margin: 20,
    marginTop: 100,
  },
  pickerContainer: {
    margin: 20,
    marginLeft: 250, 
    marginTop: 5,
  },
  title2: {// no longer used... formerly for : "navigate to a location" header
    alignSelf: 'center',
    fontSize: 12,
    color: 'black',
    fontWeight: 'bold',
  },
  location2: {
    height: 50,
    marginTop: 0,
    marginBottom: 0,
    paddingLeft: 30,
    textAlign: 'center',
    fontSize: 18,
    color: '#707070',
    borderColor: '#c0c0c0',
    borderWidth: 1,
  },
  spinner2: {
    margin: 10
  },
  buttonText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  }
});



