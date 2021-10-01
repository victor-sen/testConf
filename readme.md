# Web App

## Updating the Authorization Token 

> The Oauth2 Token used to authenticate the user to the Salesforce Org `e2edemo` will expire. There are mechanisms to handle a refresh token, but are not correctly working at the moment. As a work around there is a process to manually create and update the required Authorization token. These instructions are provided below. 
-------

Dependencies 
- [ ] You will need a means to execute `git` commands and `git pushes` to this repo
- [ ] You will need Postman or `cUrl`

### Steps: 

> Within this repository you will need to update the `testConf/public/js/main.js` file on the `master` branch . There are several ways to do this for the sake of simplicity, the easiest way to do this is simply to edit the file directly from the Github UI. The information you will update Github with will come from Postman. We will therefore explain the process in the context of `1. What to do in Postman` & `2. What to do in Github`

#### `1. What to do in Postman` 
1. All the API calls associated with the `End2End` Demo, have been captured in a `Postman Collection` labeled `End2End` which can be downloaded from [here](https://drive.google.com/file/d/1R6dWAIBV-SXCQXxPB5GfAEDXGYDZHtk-/view?usp=sharing). Download the Postman Collection. 
2. Open `Postman` and select the _Import_ button
<p text-align="center"><img src="https://user-images.githubusercontent.com/8760590/135658352-54cd46d3-5258-4353-8976-b2febdd3444a.png" width="450"/></p>

1. First, ensure you are on the `master` branch
2. Within the directory structure of `master` branch navigate to `testConf/public/js/main.js`
3. Select the `pencil` on the UI, which will p