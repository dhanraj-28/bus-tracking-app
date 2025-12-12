import React from 'react'
import { View } from 'react-native'
import TrackBusScreen from './Components/Passenger/TrackBus'
import LiveMapPage from './Components/Passenger/Tracking'
import NotificationsPage from './Components/Passenger/Notification'
import RewardProgressPage from './Components/Driver/Reward'

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* <TrackBusScreen /> */}
      {/* <LiveMapPage/> */}
      {/* <NotificationsPage/> */}
      <RewardProgressPage/>
    </View>
  )
}

export default App