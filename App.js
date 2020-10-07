import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SearchProducts from './src/pages/search/SearchProducts'
import AddItem from './src/pages/search/AddItem'

import OrderForm from './src/pages/order/OrderForm'
import OrderComplete from './src/pages/order/OrderComplete'

import BasketList from './src/pages/basket/BasketList'
import UpdateItem from './src/pages/basket/UpdateItem'

import MyOrders from './src/pages/history/MyOrders'

import MoreApps from './src/pages/more/moreApps'
//import TrackDriver from './src/pages/track/trackDriver'
//import MapPage from './src/pages/light/mapPage'
//import RequestPage from './src/pages/light/requestPage'


import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';

import * as myEPT from './assets/myEPT.json'


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});



function Shop() {
  return (
      <Stack.Navigator>
        {/*<Stack.Screen name="Welcome" component={LogoPage} />*/}
        <Stack.Screen name="Find a Product" component={SearchProducts} />
        <Stack.Screen name="Basket" component={BasketList} />
        <Stack.Screen name="Order Details" component={OrderForm} />
        
      </Stack.Navigator>
  );
}




/*
function Location() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Light Request" component={RequestPage} />
      <Stack.Screen name="Light Reports" component={MapPage} />
    </Stack.Navigator>
  );
}
*/

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    //console.log("token: ",token); // log token to send to user
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}

function App() {//stack

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {// functions for receiving push notifications
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token)
      myEPT.ept = token
      console.warn(myEPT.ept)
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator>
        
        {/*<Stack.Screen name="Welcome" component={LogoPage} />*/}
        <Stack.Screen name="Search Products" component={SearchProducts} />
        <Stack.Screen name="Add Item" component={AddItem} />
        <Stack.Screen name="Basket" component={BasketList} />
        <Stack.Screen name="Update Item" component={UpdateItem} />
        <Stack.Screen name="Order Details" component={OrderForm} />
        <Stack.Screen name="Order Complete" component={OrderComplete} />
        <Stack.Screen name="My Orders" component={MyOrders} />

        <Stack.Screen name="More Apps" component={MoreApps} />
        {/*
        <Stack.Screen name="Track Driver" component={TrackDriver} />
        <Stack.Screen name="Request" component={RequestPage} />
        <Stack.Screen name="Reports" component={MapPage} />
        */}

      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppX() {//stack
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Find a Product" component={SearchProducts} />
        <Stack.Screen name="Basket" component={BasketList} />
        <Stack.Screen name="Order Details" component={OrderForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


function AppTab() {//tab
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Browse" component={Shop} />
        {/*<Tab.Screen name="Location" component={Location} />*/}
      </Tab.Navigator>
    </NavigationContainer>
  );
}


export default App;