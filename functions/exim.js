var express = require("express");

import { firestoreExport } from 'node-firestore-import-export';
import * as firebase from 'firebase-admin';
 
firebase.initializeApp({
    apiKey: "AIzaSyCaIAv4g9dzPRnJneyv6Yofu8X93ReYwYU",                             
    authDomain: "mobishopvgc.firebaseapp.com",         
    databaseURL: "https://mobishopvgc.firebaseio.com", 
    storageBucket: "mobishopvgc.appspot.com",          
    messagingSenderId: "578653668100"                  
});
 
const collectionRef = firebase.firestore().collection('products/');
 
firestoreExport(collectionRef)
    .then(data=>console.log(data));