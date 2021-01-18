import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SearchProducts from './src/pages/search/SearchProducts'
import AddItem from './src/pages/search/AddItem'

import OrderForm from './src/pages/order/OrderForm'
import OrderComplete from './src/pages/order/OrderComplete'
//import OrderPayment from './src/pages/order/OrderPayment'

import BasketList from './src/pages/basket/BasketList'
import UpdateItem from './src/pages/basket/UpdateItem'

import MyOrders from './src/pages/history/MyOrders'
import ViewOrder from './src/pages/history/ViewOrder'


import MoreApps from './src/pages/misc/moreApps'
import Location from './src/pages/misc/location'
//import TrackDriver from './src/pages/track/trackDriver'
//import MapPage from './src/pages/light/mapPage'
//import RequestPage from './src/pages/light/requestPage'


import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';

import * as myEPT from './assets/myEPT.json'

import * as Analytics from 'expo-firebase-analytics';


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
      console.warn('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    //console.log("token: ",token); // log token to send to user
  } else {
    console.warn('Must use physical device for Push Notifications');
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
  const routeNameRef = React.useRef();
  const navigationRef = React.useRef();


  return (
    <NavigationContainer
      ref={navigationRef}
        onReady={() => routeNameRef.current = navigationRef.current.getCurrentRoute().name}
        onStateChange={() => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name

          if (previousRouteName !== currentRouteName) {
            Analytics.setCurrentScreen(currentRouteName);
          }
          routeNameRef.current = currentRouteName;
        }}
    >

      <Stack.Navigator initialRouteName="Welcome">
        
        {/*<Stack.Screen name="Welcome" component={LogoPage} />*/}

        
        <Stack.Screen name="More Apps" component={MoreApps} options={{ title: 'Welcome' }}/>
        <Stack.Screen name="Location" component={Location} options={{ title: 'Select Location' }}/>
        <Stack.Screen name="Search Products" component={SearchProducts} options={{ title: 'Browse' }}/>
        <Stack.Screen name="Add Item" component={AddItem} options={{ title: ' ' }}/>
        <Stack.Screen name="Basket" component={BasketList} options={{ title: 'Basket' }}/>
        <Stack.Screen name="Update Item" component={UpdateItem} options={{ title: ' ' }}/>
        <Stack.Screen name="Order Details" component={OrderForm} options={{ title: 'Delivery' }}/>
        <Stack.Screen name="Order Complete" component={OrderComplete} options={{ title: ' ' }}/>
        <Stack.Screen name="My Orders" component={MyOrders} options={{ title: 'History' }}/>
        <Stack.Screen name="View Order" component={ViewOrder} options={{ title: ' ' }}/>

        
        
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
      <Stack.Navigator >
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