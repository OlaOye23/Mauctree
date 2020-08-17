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

//import MapPage from './src/pages/MapPage'
//import RequestPage from './src/pages/RequestPage'

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

function App() {//stack
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