import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SearchProducts from './src/pages/SearchProducts'
import OrderForm from './src/pages/OrderForm'
import BasketList from './src/pages/BasketList'
import MapPage from './src/pages/MapPage'
import RequestPage from './src/pages/RequestPage'

import * as React from 'react';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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


function Location() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Light Request" component={RequestPage} />
      <Stack.Screen name="Light Reports" component={MapPage} />
    </Stack.Navigator>
  );
}

function App() {//stack
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/*<Stack.Screen name="Welcome" component={LogoPage} />*/}
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
        <Tab.Screen name="Location" component={Location} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}


export default App;