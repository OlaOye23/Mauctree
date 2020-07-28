import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SearchProducts from './src/pages/SearchProducts'
import OrderForm from './src/pages/OrderForm'
import BasketList from './src/pages/BasketList'

import * as React from 'react';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/*<Stack.Screen name="Welcome" component={LogoPage} />*/}
        <Stack.Screen name="Browse" component={SearchProducts} />
        <Stack.Screen name="Basket" component={BasketList} />
        <Stack.Screen name="Order Details" component={OrderForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


/*
function Checkout() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Basket" component={BasketList} />
      <Stack.Screen name="Order Details" component={OrderForm} />
    </Stack.Navigator>
  );
}



function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Browse" component={Browse} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
*/

export default App;