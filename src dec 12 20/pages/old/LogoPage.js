import React, {Component} from 'react'
import {StyleSheet, Image, TextInput, TouchableOpacity, View, ScrollView} from 'react-native'
import logo from './logo2.png'


export default class LogoPage extends Component{
    constructor(props){
        super(props)
    }

   componentDidMount = () =>{
       const { navigation } = this.props
       setTimeout(()=> navigation.navigate('Browse'),2000)
   }

    


    render(){
        return(
            <View>
               <Image source = {logo} style = {LogoStyles.logoPic} />
            </View>
        )}

}

const LogoStyles = StyleSheet.create({
    logoPic: {
        marginTop: 150,
        width: 300,
        height: 220,
        alignSelf: 'center',
    },
  });






    





