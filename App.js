import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SearchProducts from './src/pages/search/SearchProps'
import AddItem from './src/pages/search/ViewProp'



import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, Image } from 'react-native';


import * as Analytics from 'expo-firebase-analytics';

import logoName from './assets/mauctree.png' 


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});




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
        
        
        <Stack.Screen name="Search Products" component={SearchProducts} options={{
          title: 'Browse',
          headerTitle: 
          <View style = {{flex: 1, flexDirection: 'row', marginLeft: 0, justifyContent: 'flex-start', alignItems: 'flex-start'}}>
              {/*<Image style={{ width: 40, height: 40, marginRight: 20, marginTop: 10, }} source = {logoPic} /> */}
              <Image style={{ width: 120, height:20, marginLeft: 0,marginRight: 20, marginTop: 20, marginBottom: 15}} source = {logoName} /> 
            </View>,
          headerRight: () => {}
        }}/>
        
        <Stack.Screen name="Add Item" component={AddItem} options={{ title: ' ' }}/>
        

      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;