import {View} from 'react-native'
import React from 'react'
import {useSafeAreaInsets} from "react-native-safe-area-context";

const ScreenWrapper = ({children, bg}) => {

    const {top} = useSafeAreaInsets();

    // Use the safe area inset AND add a consistent margin (e.g., 10)
    // This works on both iOS and Android.
    const paddingTop = top + 10;

    return (
        <View style={{flex: 1, paddingTop, backgroundColor: bg}}>
            {
                children
            }
        </View>
    )
}
export default ScreenWrapper