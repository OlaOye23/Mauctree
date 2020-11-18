import React from 'react'
import * as ReactNativeWeb from 'react-native-web'
import * as ReactNativeX from 'react-native'


const createTouchable = (Touchable) => (props: any) => {
  const { onPress, ...restProps } = props
  return (
    <Touchable {...restProps} onClick={onPress} />
  )
}



export * from 'react-native-web'


//export const TouchableOpacity = ReactNativeX.TouchableOpacity
export const TouchableOpacity = createTouchable(ReactNativeWeb.TouchableOpacity)
export const TouchableWithoutFeedback = createTouchable(ReactNativeWeb.TouchableWithoutFeedback)

