# NUXEO ASSISTANT (actions on google) using Node.js and Cloud Functions for Firebase

This project is an attempt at creating a conversational interface to browse, find and perform actions on Nuxeo enterprise content from google assistant (available on smart speakers, smart displays, Android assistant and iOS google assistant app).

![nuxeo assistant](assistant_conv_example.gif?raw=true "nuxeo assistant" | width=100)

## Project structure
![nuxeo assistant chart](NXAssistant_chart.png?raw=true "nuxeo assistant chart")

## Setup Instructions

See the developer guide and release notes at [https://developers.google.com/actions/](https://developers.google.com/actions/) for more details.

### Steps
1. Add a file nx_server_credentials.js to the /functions folder, with the following content : 
```
module.exports = { 
    nx_platform_token: 'platform token here',
    server_url: 'https://your.nuxeo.server.com'
};
```
Where the platform token can be retrieved using [https://github.com/nuxeo/nuxeo/tree/master/nuxeo-services/login/nuxeo-platform-login-token](https://github.com/nuxeo/nuxeo/tree/master/nuxeo-services/login/nuxeo-platform-login-token) and server url your Nuxeo instance url.
1. Use the [Actions on Google Console](https://console.actions.google.com) to add a new project with a name of your choosing and click *Create Project*.
1. Click *Skip*, located on the top right to skip over category selection menu.
1. On the left navigation menu under *BUILD*, click on *Actions*. Click on *Add Your First Action* and choose your app's language(s).
1. Select *Custom intent*, click *BUILD*. This will open a Dialogflow console. Click *CREATE*.
1. Click on the gear icon to see the project settings.
1. Select *Export and Import*.
1. Select *Restore from zip*. Follow the directions to restore from the `nuxeo_assistant.zip` file in this repo / dialogflow_source folder.
1. Deploy the fulfillment webhook provided in the `functions` folder using [Google Cloud Functions for Firebase](https://firebase.google.com/docs/functions/):
    1. Follow the instructions to [set up and initialize Firebase SDK for Cloud Functions](https://firebase.google.com/docs/functions/get-started#set_up_and_initialize_functions_sdk). Make sure to select the project that you have previously generated in the Actions on Google Console and to reply `N` when asked to overwrite existing files by the Firebase CLI.
    1. Run `firebase deploy --only functions` and take note of the endpoint where the fulfillment webhook has been published. It should look like `Function URL (nxAssistant): https://${REGION}-${PROJECT}.cloudfunctions.net/nxAssistant`
1. Go back to the Dialogflow console and select *Fulfillment* from the left navigation menu. Enable *Webhook*, set the value of *URL* to the `Function URL` from the previous step, then click *Save*.
1. Select *Integrations* from the left navigation menu and open the *Integration Settings* menu for Actions on Google.
1. Enable *Auto-preview changes* and Click *Test*. This will open the Actions on Google simulator
1. Type `Talk to my test app` in the simulator, or say `OK Google, talk to my test app` to any Actions on Google enabled device signed into your developer account.

For more detailed information on deployment, see the [documentation](https://developers.google.com/actions/dialogflow/deploy-fulfillment).

