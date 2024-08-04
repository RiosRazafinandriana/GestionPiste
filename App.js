import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Piste from './screens/Piste';
import Planning from './screens/Planning';
import Historique from './screens/Historique';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Pistes" component={Piste} />
        <Tab.Screen name="Planning" component={Planning} />
        <Tab.Screen name="Historique" component={Historique} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
