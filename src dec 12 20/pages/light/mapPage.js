import React from 'react';//import react
import { View, Picker, Text, TextInput, Modal, TouchableOpacity, Animated, Image, StyleSheet } from 'react-native';//import native ocmponents
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';//import map feaures
import Geocoder from 'react-native-geocoding'; //import geocoder i.e long/lat --> address
import firebase from '../../api/ShopsApi'//to access firestore
import {BaseButton} from 'react-native-gesture-handler'//using BaseButton because Touchable Opacity functions act weird with react-gesture-handler(navigation)
import * as defaultLoc from '../../../assets/defaultLoc.json'
import yellow from '../../../assets/yellz.png'
import black from '../../../assets/black.jpg'







export default class MapPage extends React.Component {// create an externally visisble (export) component
	constructor(props) {//initialise the component with a constructor
    super(props);//enable features from {Component}
    this.state = {//initialise the  state with cab positions and initial map position
      reportModalVisible: false,//make the confirmation modal hidden or displayed
      reports: [],// to storre loaded reports
      timeText: new Date,//to display date field
      timeLimit: 15,//to determine what data is relevant to be shown
      nowTime: (new Date - 0)/60000,// to determine the time now
      doc: null,//for comparison to decide what modal is shown
      inputAddr: defaultLoc.address,//to take in an input address
      forceRefresh: Math.floor(Math.random() * 100000000),//to force a re-render
      notFoundModalVisible: false,//to toggle modal for an invalid address
      toLoad: false,//to decide whether to load reports or not
      reportNotificationModalVisible: false,//to toggle the visibility of the notification modal
      disableLoad: false,// to 
      loadMsg: 'CHECK IF THERE IS LIGHT',
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
      latitude: defaultLoc.latitude, // ocean = 19.8,
      longitude: defaultLoc.longitude, //ocean = 28.2
      imgSize: 15,
    };
    this.onClickReport = this.onClickReport.bind(this)// not neccessary? but doesn't hurt
  }

  static navigationOptions = {
    title: 'Set your location',
  };  


  onClickLoad = async () =>{
    console.log('in onClickLoad')
    this.setState({loadMsg: 'LOADING...'})
    this.setState({disableLoad: true})
    await this.onSubmitAddress(this.state.inputAddr)
    if (this.state.toLoad == false){
      this.setState({disableLoad: false})
      this.setState({loadMsg: 'CHECK IF THERE IS LIGHT'})
      return
    }
    await this.loadReports()
    //this.setState({reportNotificationModalVisible: false})
    this.setState({disableLoad: false})
    this.setState({loadMsg: 'CHECK IF THERE IS LIGHT'})
    console.log('out onClickLoad')
  }

  onClosereportNotificationModal = () =>{
    console.log('in onClosereportNotificationModal')
    this.setState({reportNotificationModalVisible : false})
    console.log('out onClosereportNotificationModal')
  }

  onSubmitAddress = async (addr) =>{
    console.log('in submit address')
    this.setState({reports: []})//remove previous reports when navigating to a new location
    await this.getGeoLocation(this.state.inputAddr)
    this.setState({forceRefresh: Math.floor(Math.random() * 10000000)})
    defaultLoc.latitude = this.state.latitude
    defaultLoc.longitude = this.state.longitude
    defaultLoc.address = this.state.address
    console.log(defaultLoc)
    console.log('out submit address')
  }

  loadReports = async () =>{
    console.log('in load reports')
    this.setState({reports: []})
    let minTime = this.state.nowTime - 600000
    latnos = [-.01,.01,0]//initially use wider range
    longnos = [-.01,.01,0]
    let latLong = []
    let address = []
    var addedDox = []
    latnos.forEach(async n =>{
      longnos.forEach(async m => {
        latArea = (parseFloat(this.state.latitude)+n).toFixed(1)
        longArea = (parseFloat(this.state.longitude)+m).toFixed(1)
        const db = firebase.firestore()//create a firstore access instance using the firbase config in './firbase'
        let reports_query = db.collection('light_reports')
                            .where('lat2dp', '==', latArea)
                            .where('long2dp', '==', longArea)
                            .orderBy('timeCalc', 'desc')
                            .limit(100) 
        //let reports_query = db.collection('light_reports').where('timeCalc', '>', minTime).where('timeCalc', '>', longArea).limit(1000)
        await reports_query.get().then(d00=> {//use a SQL query on the light_incident Database
          console.log('still running load')
          d00.forEach(d0 => {
            d = d0.data()
            if (d.lat != undefined && d.timeCalc != undefined){
            if ((d.timeCalc > minTime) &&  (this.state.nowTime - d.timeCalc > 0 )){
              if (latLong.includes(d.lat.toString().concat(d.long.toString()) ) == false){// geoloc overwrite check
                latLong.push(d.lat.toString().concat(d.long.toString()))
                if (address.includes(d.address) == false) {//address overwrite check...incase geoloc fails due to different degrees of accuracy 
                  address.push(d.address)
                  addedDox.push(d)
                  console.log(addedDox.length)
                }
              }
            }
          }
          })//d00
        })
        //console.log(addedDox)
        this.setState({reports: [...addedDox]})
      })//longnos
    })//latnos
    console.log('out load reports')
    //this.isThereLight()
  }

 
  

	componentDidMount = () =>{ 
    console.log('in componentDidMount')
    this.setState({reportNotificationModalVisible: true})
  /*  const { navigation } = this.props;
    this.focusListenerReq = navigation.addListener('didFocus', () => { //set states to update on navigation
    this.setState({forceRefresh: Math.floor(Math.random() * 10000000)})
  }); */
  console.log('out componentDidMount')
  }

         


  getGeoLocation= async (address) =>{
    console.log('in getGeolocation')
    //return if address is null
    if (address == ""){
      this.setState({notFoundModalVisible : true})
      this.setState({toLoad : false})
      return
    }
    try{
      Geocoder.init("AIzaSyBLElYt7l1VCCCHI5l8nAlsWwYK6xe1KRk");
      json = await Geocoder.from(address+", Lagos, Nigeria")
      jsonLagos = await Geocoder.from("Lagos, Nigeria")
      var locationLagos = jsonLagos.results[0].geometry.location;
      var location = json.results[0].geometry.location;
      if (location.lat == locationLagos.lat && location.lng == locationLagos.lng){
        this.setState({notFoundModalVisible : true})
        this.setState({toLoad : false})
        return
      }
      //this.setState({forceRefresh: Math.floor(Math.random() * 10000000)})
      /*
      defaultLoc.address = address;
      defaultLoc.latitude = location.lat
      defaultLoc.longitude = location.lng//for landing on last searched address
      */
      this.setState({toLoad : true, latitude: location.lat, longitude: location.lng, address: address})// for loading reports at location after search
    }catch{error => console.warn(error)}
    console.log('out getGeolocation')
  }

  onCloseNotFoundModal = () =>{
    console.log('in onCloseNotFoundModal')
    this.setState({notFoundModalVisible : false})
    console.log('out onCloseNotFoundModal')
  }

  onClickReport = (doc) => {//what to do when a booking request is made
    console.log('in onClickReport')
    try{
      this.setState({//set the state
        doc: doc,
        reportModalVisible: true //make the confirmation modal visible
      });
    }
    catch(err){
      console.log(err)
    }
    console.log('out onClickReport')
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
  
  
  onCloseModal = () => {//what to do when a booking request is made
    console.log('in close modal')
    this.setState({reportModalVisible: false});
    console.log('out close modal')
  }

  onOpenShops = () => {//wrong!!!- should actually open list of shops instead...no longer used for now
    const {navigate} = this.props.navigation;
    navigate('shopPage')
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
          key={this.state.forceRefresh} 
          style={mapStyles.fullScreenMap}  
          onRegionChange ={this.onRegionChange}
					initialRegion={{//set the initial position of the map as non-state variable
            latitude: parseFloat(this.state.latitude),
            longitude: parseFloat(this.state.longitude),
            latitudeDelta: this.state.latitudeDelta ,
            longitudeDelta: this.state.longitudeDelta
          }}
				>
          {this.state.reports.map((doc, i) => (
            doc !=undefined?
				    <MapView.Marker 
				    	key={i} 
				      coordinate={doc.lat?{
                        latitude: parseFloat(doc.lat),
                        longitude: parseFloat(doc.long) ,
                      }: {latitude: 12.8,
                        longitude: 28.2}}
              icon={{
                url: null
              }}
              onPress ={() => this.onClickReport(doc)}
				    >
            {(doc.status != ""  && doc.address != "Loading your current location..." && doc.address != "Loading...") ?
            
						<View  >
               {
                 (this.state.doc == doc) && (doc.timeCalc != undefined) && (this.state.timeLimit - (this.state.nowTime - doc.timeCalc) >0) &&
                <Modal key = {Math.floor(Math.random() * 1000000)} animationType={'fade'} visible= {this.state.reportModalVisible}  transparent={true} >
                    <View style={mapStyles.overlay}>
                      <View style={mapStyles.container}>
                        <Text style={mapStyles.title2}>REPORT DETAILS</Text>
                        <Text style={mapStyles.title}>IS THERE LIGHT?: {doc.status}</Text>
                        <Text style={mapStyles.title}>REPORT TIME: {doc.time}</Text>
                        <Text style={mapStyles.title}>REPORT ADDRESS: {doc.address}</Text>
                        <TouchableOpacity style={mapStyles.closeButton} onPress={this.onCloseModal}>
                          <Text style={mapStyles.buttonText}>CLOSE</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                }
                <Image source= {doc.status == "YES"? yellow : black} 
                  style = {{height: this.state.imgSize, width: this.state.imgSize, borderRadius: this.state.imgSize/2}}
                  opacity = { (this.state.timeLimit - (this.state.nowTime - doc.timeCalc))/this.state.timeLimit}
                />
            </View>: <Text></Text>}
            
				    </MapView.Marker> : <Text></Text>
				  ))} 
				</MapView>

        <Modal key = {Math.floor(Math.random() * 1000000)} animationType={'fade'} visible= {this.state.notFoundModalVisible}  transparent={true} >
          <View style={mapStyles.overlay}>
            <View style={mapStyles.container}>
              <Text style={mapStyles.title2}>ALERT</Text>
              <Text style={mapStyles.title}>The address you typed in was not found!</Text>
              <Text style={mapStyles.title}>Cross-check the address and try again </Text>
              <Text style={mapStyles.title}>You were not charged for this {'\n'}</Text>
              <Text style={mapStyles.plainText}>HINT: Google search the location to get an exact address</Text>
              <TouchableOpacity style={mapStyles.closeButton} onPress={this.onCloseNotFoundModal}>
                <Text style={mapStyles.buttonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal key = {Math.floor(Math.random() * 100000)} animationType={'fade'} visible= {false /*this.state.reportNotificationModalVisible*/}  transparent={true} >
          <View style={mapStyles.overlay}>
            <View style={mapStyles.container}>
              <Text style={mapStyles.title2}>INSTRUCTIONS</Text>
              <Text style={mapStyles.title}>Enter an address and press enter to navigate there</Text>
              <Text style={mapStyles.title}>Confirm the location by clicking 'CHECK IF THERE IS LIGHT'</Text>
              <Text style={mapStyles.title}>Reports are represented by square boxes</Text>
              <Text style={mapStyles.title}>Click on a report to see details {'\n'} </Text>
              <Text style={mapStyles.title}>Yelow: There is light!</Text>
              <Text style={mapStyles.title}>Black: There is no light! {'\n'}</Text>
              <Text style={mapStyles.title}>Bold: New report</Text>
              <Text style={mapStyles.title}>Faded: Old report </Text>
              <TouchableOpacity style={mapStyles.closeButton} onPress={this.onClosereportNotificationModal}>
                <Text style={mapStyles.buttonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

				
        <View style={mapStyles.container2}>

        <TextInput 
          placeholder= "enter desired location"  
          style={mapStyles.location2} 
          onChangeText={(text) => this.setState({inputAddr: text})} 
          value={this.state.inputAddr} 
          onSubmitEditing = {() => this.onSubmitAddress(this.state.inputAddr)}/> 
        </View>

        <TouchableOpacity style={mapStyles.loadButton} onPress={this.onClickLoad} disabled= {this.state.disableLoad} >
          <Text style={mapStyles.buttonText}>
            {this.state.loadMsg}
            {/*this.state.loadMsg + ' at ' + this.state.timeText.getHours() + ":" + this.state.timeText.getMinutes() + ":" + this.state.timeText.getSeconds()*/}
          </Text>
        </TouchableOpacity>
          


        <View style={mapStyles.pickerContainer} >
        <Text style={mapStyles.settingsTitle}>Set Time interval:</Text>
        <Picker
          selectedValue={this.state.timeLimit}
          style={{height: 50, width: 100}}
          onValueChange={(itemValue, itemIndex) =>{
            this.setState({nowTime: (new Date - 0)/60000, timeLimit: itemValue})
            }}
          >
          <Picker.Item label="1 min" value={1} />
          <Picker.Item label="5 mins" value={5} />
          <Picker.Item label="15 mins" value={15} />
          <Picker.Item label="30 mins" value={30} />
          <Picker.Item label="1 hour" value={60} />
          <Picker.Item label="2 hours" value={120} />
          <Picker.Item label="4 hours" value={240} />
          <Picker.Item label="8 hours" value={480} />
          <Picker.Item label="today" value={7200} />
          <Picker.Item label="temp_all" value={6000000} />
        </Picker>
        </View>

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



