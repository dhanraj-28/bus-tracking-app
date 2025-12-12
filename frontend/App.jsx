import React from 'react'
import { View } from 'react-native'
import TrackBusScreen from './Components/Passenger/TrackBus'
import LiveMapPage from './Components/Passenger/Tracking'
import NotificationsPage from './Components/Passenger/Notification'

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* <TrackBusScreen /> */}
      {/* <LiveMapPage/> */}
      <NotificationsPage/>
    </View>
  )
}

export default App