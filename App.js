import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Piste from './screens/Piste';
import Planning from './screens/Planning';
import Historique from './screens/Historique';
import { Image } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{
          tabBarStyle: { height: 60 },
        }}>
        <Tab.Screen name="Pistes" component={Piste} options={{ tabBarIcon: () => <Image source={require('./assets/icones/pistes.png')} style={{ width: 30, height: 30 }} />}}/>
        <Tab.Screen name="Planning" component={Planning} options={{ tabBarIcon: () => <Image source={require('./assets/icones/planning.png')} style={{ width: 30, height: 30 }} />}}/>
        <Tab.Screen name="Historique" component={Historique} options={{ tabBarIcon: () => <Image source={require('./assets/icones/historique.png')} style={{ width: 30, height: 30 }} />}}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
