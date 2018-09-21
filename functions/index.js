const functions = require('firebase-functions');

const app = require('actions-on-google').dialogflow({ debug: true });
const {
    dialogflow,
    BasicCard,
    BrowseCarousel,
    BrowseCarouselItem,
    Button,
    Carousel,
    Confirmation,
    Image,
    LinkOutSuggestion,
    List,
    MediaObject,
    Suggestions,
    SimpleResponse,
    Permission
} = require('actions-on-google');

const request = require('request');
const Nuxeo = require('nuxeo');
const server_credentials = require('./nx_server_credentials.js')

const getMyTasks = (conv) => {

    var options = {
        method: 'GET',
        url: conv.data.nxserver + '/nuxeo/api/v1/task' + '?token=' + conv.data.nxtoken,
        headers:
        {
            //Authorization: 'Basic ' + basicAuth,
            //'X-NXenrichers.document': 'thumbnail, preview, tags',
            properties: '*',
            Accept: 'application/json'
        }
    };


    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (error) return reject(error);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
    });
};

const getMyDetails = (conv) => {

    var options = {
        method: 'GET',
        url: conv.data.nxserver + '/nuxeo/api/v1/me' + '?token=' + conv.data.nxtoken,
        headers:
        {
            //Authorization: 'Basic ' + basicAuth,
            //'X-NXenrichers.document': 'thumbnail, preview, tags',
            properties: '*',
            Accept: 'application/json'
        }
    };


    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (error) return reject(error);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
    });
};

const getUserDetails = (username, conv) => {

    var options = {
        method: 'GET',
        url: conv.data.nxserver + '/nuxeo/api/v1/user/' + username + '?token=' + conv.data.nxtoken,
        headers:
        {
            //Authorization: 'Basic ' + basicAuth,
            //'X-NXenrichers.document': 'thumbnail, preview, tags',
            properties: '*',
            Accept: 'application/json'
        }
    };


    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (error) return reject(error);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
    });
};

const getDocData = (docId, conv) => {

    var options = {
        method: 'GET',
        url: conv.data.nxserver + '/nuxeo/api/v1/id/' + docId + '/' + '?token=' + conv.data.nxtoken,
        headers:
        {
            //Authorization: 'Basic ' + basicAuth,
            'X-NXenrichers.document': 'thumbnail, preview, tags',
            properties: '*',
            Accept: 'application/json'
        }
    };


    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (error) return reject(error);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
    });
};

const searchDoc = (searchedWord, conv) => {
    console.log('searched word :');
    console.log(searchedWord);
    var options = {
        method: 'GET',
        url: encodeURI(conv.data.nxserver + "/nuxeo/api/v1/search/lang/NXQL/execute?query=SELECT * FROM Document WHERE ecm:fulltext = '" + searchedWord + " ' ORDER BY dc:modified DESC" + '&token=' + conv.data.nxtoken),
        headers:
        {
            //Authorization: 'Basic ' + basicAuth,
            'X-NXenrichers.document': 'thumbnail, preview, tags',
            properties: '*',
            Accept: 'application/json'
        }
    };


    return new Promise(function (resolve, reject) {
        request(options, function (error, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (error) return reject(error);
            try {
                // JSON.parse() can throw an exception if not valid JSON
                resolve(JSON.parse(body));
            } catch (e) {
                reject(e);
            }
        });
    });
};

app.intent('Default Welcome Intent', (conv) => {

    if (conv.user.storage.nxtoken) {

        conv.data.nxtoken = conv.user.storage.nxtoken;
        conv.data.nxserver = conv.user.storage.nxserver;
        conv.data.firstName = conv.user.storage.firstName;

        var date = new Date().getHours()
        var greetings = date < 12 ? 'Good Morning' : date < 18 ? 'Good Afternoon' : 'Good Night';

        conv.ask(greetings + ` ` + conv.data.firstName + ` ! looks like youre logged in and ill be able to perform amazing stuff.`);


    } else {
        conv.ask('Welcome to my enterprise content ! Would you like to login to a demo enterprise content or login to your server instead ?');
        conv.ask(new Suggestions(['Login to demo', 'Login to my server']));
    }


    // to handle "long time fella" type of user experience
    // if (conv.user.last.seen) {
    //     conv.ask(`Hey you're back...`);
    // } else if (conv.user.last.seen>x){
    // } else {
    //}
});

app.intent('log to demo', (conv) => {

    const nx_platform_token = server_credentials.nx_platform_token;
    const server_url = server_credentials.server_url;

    conv.data.nxtoken = nx_platform_token;
    conv.data.nxserver = server_url;

    return getMyDetails(conv)
        .then((value) => {

            conv.data.firstName = value.properties.firstName;
            conv.data.email = value.properties.email;

            conv.ask(new Confirmation(`You are now connected as ` + value.properties.username + ` and I'll use ` + value.properties.firstName + ` and ` + value.properties.email + ` from now on. Do you agree to save these informations for future conversations ?`));
            //conv.ask(new Confirmation(`Ok to save data ?`));
        });

});

app.intent('log to demo confirmation', (conv, params, confirmationGranted) => {


    //implicit : if confirmationGranted = false, these wont work :
    conv.user.storage.nxtoken = conv.data.nxtoken;
    conv.user.storage.nxserver = conv.data.nxserver;
    conv.user.storage.firstName = conv.data.firstName;
    conv.user.storage.email = conv.data.email;

    return conv.ask(confirmationGranted ? `You are now connected on ` + conv.data.nxserver + ` NB : on demo, the session will never expire, say "forget me" to logout)` : `No problem ! You are logged in ` + conv.data.nxserver + ` , but your informations will be removed at the end of the conversation`);
});

app.intent('log me out', (conv, params, confirmationGranted) => {
    conv.user.storage = {};
    conv.user.data = {};
    return conv.ask('You are logged out, you can login to any server or to the Nuxeo demo by saying "login to demo"');
});

app.intent('show my tasks', (conv, params) => {
    return getMyTasks(conv)
        .then((value) => {
            var items = [];
            var data = value.entries;

            for (var i in data) {
                var item = {
                    optionInfo: {
                        key: data[i]["id"],
                        synonyms: [
                            data[i]["name"]
                        ]
                    },
                    title: data[i]["workflowTitle"],
                    description: data[i]["workflowModelName"],
                    image: new Image({
                        url: "http://www.zaarapp.com/assets/images/Task.PNG",

                        alt: data[i]["directive"],
                    })
                };
                console.log(item.synonyms);
                items.push(item);
            };
        });
});

app.intent('search document', (conv, params) => {

    var searchedWord = params['any'];

    return searchDoc(searchedWord, conv)
        .then((value) => {

            console.log("value.resultsCount");
            console.log(value.resultsCount);
            //var respObj = value.asJSON;
            var items = [];
            var data = value.entries;

            //construct list
            for (var i in data) {
                var item = {
                    optionInfo: {
                        key: data[i]["uid"],
                        synonyms: [
                            data[i]["title"]
                        ]
                    },
                    title: data[i]["title"],
                    description: data[i]["properties"]["dc:description"],
                    image: new Image({
                        url: data[i]["contextParameters"].thumbnail.url + '?token=' + conv.data.nxtoken,

                        alt: data[i]["type"],
                    })
                };
                console.log(item.synonyms);
                items.push(item);
            };

            //then add a "add document" item to avoid the display error on carousel with one result + allowing adding content in the future
            //this is hacky and should be removed.
            var item = {
                optionInfo: {
                    key: 'add_content_carousel_item',
                    synonyms: [
                        'add_content'
                    ]
                },
                title: "create new",
                description: "create a new document",
                image: new Image({

                    url: 'https://image.ibb.co/juF7o9/add_content_flat.png',
                    alt: 'create',
                })
            };
            items.push(item);//will have an error if clicked for now



            //on devices without display, say few informations for the user 
            if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
                conv.ask('Ok, I found ' + value.resultsCount + ' documents when searching for ' + searchedWord);
                conv.ask('The first document found has the title : ' + data[i]["title"]);
                return;
            }


            if (value.resultsCount == 0) {
                conv.ask('Uh oh, I didnt find any result when searching for ' + searchedWord + '! try another search :');
            } else {
                conv.ask('ok here is what I found when searching for : ' + searchedWord);
                //if less than 10 items : 
                if (value.resultsCount < 10) {
                    conv.ask(new Carousel(
                        {
                            items: items
                        }
                    )
                    );
                }
                //if more than 10, we may want to have pagination ?
                if (value.resultsCount > 10) {
                    conv.ask(new List(
                        {
                            items: items
                        }
                    )
                    );
                }
            }
        });


});

app.intent('share document', (conv) => {
    const contexts = conv.contexts;
    const document_context = conv.contexts.get('current_doc');
    console.log('SHARE action : context document id :');
    console.log(document_context.parameters['document_id']);


    conv.ask('I will share the document "' + document_context.parameters['document_title'] + '" ');
    if (document_context.parameters['email'] == '') {
        if (document_context.parameters['username'] == '') {
            conv.ask('who do you want to share this with ?');
        } else {
            conv.ask(' with ' + document_context.parameters['username']);
        }
    } else {
        conv.ask(' with ' + document_context.parameters['email']);
    }
});

app.intent('search document - displaydoc', (conv, params, option) => {

    let response = 'You did not select any item';
    // console.log(searchdocument-followup.params['any']);
    console.log(option);

    return getDocData(option, conv)
        .then((value) => {


            console.log(value.uid);
            //set output context as doc ID for followup actions
            const parameters = { // Custom parameters to pass with context
                document_id: value.uid,
                document_title: value.title,
            };

            conv.contexts.set('CURRENT_DOC', 5, parameters);

            if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) {
                conv.ask('On a device with display, i would show you the document : ' + value.title);
                return;
            }

            // Create a basic card
            conv.ask('Here is a document of type : ' + value.type);
            conv.ask(new BasicCard({
                text:
                    `👨‍💻 Contributors : ` + value.properties["dc:contributors"].toString()
                    + `  \n`
                    + '🕘 Last modified : ' + value.lastModified.replace('T', ' ').replace('/\..+/', '').replace('Z', '')
                    + `  \n`
                    + '🕘 Created : ' + value.properties["dc:created"] + ' by ' + value.properties["dc:creator"]
                    + `  \n`
                    + `🏳️ Tags : ` + value.contextParameters.tags.toString(),

                subtitle: value.properties['dc:description'],
                title: value.title,
                // buttons: [
                //     new Button({
                //         title: 'open on browser',
                //         url: domain + '/nuxeo/ui/?token=' + conv.data.nxtoken + '#!/browse' + value.path
                //     })
                // ],
                image: new Image({
                    url: value.contextParameters.thumbnail.url + '?token=' + conv.data.nxtoken,
                    alt: 'Image alternate text',
                }),

                //add doc uid into context to perform actions
                context: value.uid,
            }));
            conv.ask(new Suggestions(['Start a workflow', 'Share to someone']));
        });
});



exports.webhook = functions.https.onRequest(app);

//https://us-central1-nuxeo-assistant.cloudfunctions.net/webhook has to be included in dialogflow/
//locally, it would be something like : https://cbe146d2.ngrok.io/nuxeo-assistant/us-central1/webhook