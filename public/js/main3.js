// var axios = require('axios');
// const dotenv = require('dotenv');
// var FormData = require('form-data');
import axios from 'axios'
import FormData from 'form-data'
var data = new FormData();
data.append('username', 'e2edemo@provartesting.com');
data.append('password', 'Provar2021!!!Ul2LxNAOyzQLmj0G9GUtvW3F7');
data.append('grant_type', 'password');
data.append('client_id', '3MVG9p1Q1BCe9GmAzqa1Tc_g1pvtcraAQmp8H_kNjB1rW5FzQsH.fN1rG_Qan3blT8yBKcA8NYkiQ2H.8PtN0');
data.append('client_secret', 'CADE9C80309F138093EF71D803AF8D56AA8F2434BD64605658EC09115E3422F3');

const getAccessToken = async () => {
    var config = {
        method: 'post',
        url: 'https://login.salesforce.com/services/oauth2/token',
        headers: { 
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            ...data.getHeaders()
        },
        data : data
      };  
      
      const response = await axios(config)
      console.log(`Access Token: ${response.data.access_token}`)
      return response.data.access_token
}

const postSpeaker = async(speakerFormDetails) => {
    getAccessToken()
        .then(function(token){
            var data = speakerFormDetails
            var config = {
            method: 'post',
            url: 'https://e2edemo.my.salesforce.com/services/data/v51.0/sobjects/Speaker__c?Content-Type=application/json&sObject=Speaker__c',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'X-PrettyPrint': '1', 
                'Content-Type': 'application/json', 
                'Access-Control-Allow-Origin': '*'
                // 'Cookie': 'BrowserId=jQI9FhvZEeyQGZtiAyAmOQ; CookieConsentPolicy=0:0'
            },
            data : data
            };

            axios(config)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
            console.log(error);
            });
        })
}

const postSession = async (sessionFormDetails) => {
    getAccessToken()
        .then(function(token){
            var data = sessionFormDetails
            var config = {
            method: 'post',
            url: 'https://e2edemo.my.salesforce.com/services/data/v51.0/sobjects/Session__c?Content-Type=application/json&sObject=Session__c',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'X-PrettyPrint': '1', 
                'Content-Type': 'application/json', 
                'Access-Control-Allow-Origin': '*'
                // 'Cookie': 'BrowserId=jQI9FhvZEeyQGZtiAyAmOQ; CookieConsentPolicy=0:0'
            },
                data : data
            };

            axios(config)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
            console.log(error);
            });
        })
}

// document.getElementById('sfdc_btn').addEventListener('click', ()=>{
//     let fn = document.getElementById('firstName').value;
//     let ln = document.getElementById('lastName').value;
//     let email = document.getElementById('inputEmail4').value;
//     let bio = document.getElementById('bio').value;
//     let topic = document.getElementById('topic').value;
//     let title = document.getElementById('title').value;
//     let diff = document.getElementById('difficulty').value;
//     let sType = document.getElementById('sessionType').value;

//     let speakerDetails = {
//         "Bio__c": bio,
//         "First_Name__c": fn,
//         "Last_Name__c": ln,
//         "Email__c": email
//     }

//     let sessionDetails = {
//         "Description__c": topic,
//         "Level__c": diff,
//         "Session_Date__c": "2022-03-16T19:00:00.000+0000",
//         "Name": title
//     }

//     postSpeaker(speakerDetails)
//     postSession(sessionDetails)
// })


// let speakerTest = {
//     "Bio__c": "I am a pony4",
//     "First_Name__c": "Jeremy",
//     "Last_Name__c": "Hackbarth",
//     "Email__c": "jh@gmail.com"
// }

// let sessionTest = {
//     "Description__c": "This is a how sausage gets made, and then the porage is poured",
//     "Level__c": "Intermediate",
//     "Session_Date__c": "2022-03-16T19:00:00.000+0000",
//     "Name": "Big Dinner"
// }

// getAccessToken()
// postSpeaker(speakerTest)
// postSession(sessionTest)