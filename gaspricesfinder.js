/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.

var http = require('http');
var host = 'http://gasprices.mapquest.com';
var path = '/services/v1/stations?filter=gasprice%3Apremium&sortby=distance&hits=5&location=';
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);
        
        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        
        if (event.session.application.applicationId !== "") {
             context.fail("Invalid Application ID");
        }
        

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session,
            function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("GetGasPrices" === intentName) {
      var zipcode = intent.slots.zip.value;
      if(zipcode===null || zipcode==="" || zipcode === undefined)
        {
           getInvalidResponse(callback);
        }
        else
       {    
          if(zipcode.length < 5)
          {
              getInvalidResponse(callback);
          }
          else
          {
            getGasPrices(intent, session, function(callbacks) {
                console.log("Completed");
                callback(session,
                 buildSpeechletResponse(intent.name, callbacks[0], callbacks[1], callbacks[2], callbacks[3]));
            });
          }
       }  
    } else if ("AMAZON.HelpIntent" === intentName) {
        getHelpResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName || "AMAZON.CancelIntent" === intentName) {
        handleSessionEndRequest(callback);
    } 
    else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session, callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "<speak><s>Thank you for trying gas prices finder.</s><s> Have a nice day!</s></speak>";
    var cardOutput = "Thank you for trying gas prices finder. Have a nice day!";
    var sessionAttributes = {};
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, cardOutput, null, shouldEndSession));
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "<speak><s>Welcome to your Gas Prices Finder.</s><s> Please provide the zip code for checking gas prices in your area of interest</s></speak>";
    var cardOutput = "Welcome to your Gas Prices Finder. Please provide the zip code for checking gas prices in your area of interest"
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please provide the zip code."
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
}


function getInvalidResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Invalid Entry";
    var speechOutput = "<speak><s>Please provide a valid zip code in your request like nine four five six zero</s></speak>";
    var cardOutput = "Please provide a valid zip code in your request like 94560"
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please provide a valid zip code";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
}

function getHelpResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Help";
    var speechOutput = "<speak><s>Gas Prices Finder finds the gas prices for upto 5 gas stations for your requested zip code.</s><s> To get Gas prices for your Zip code of interest, just ask what are the gas prices in zip code nine four five six zero.</s></speak>";
    var cardOutput = "Gas Prices Finder finds the gas prices for upto 5 gas stations for your requested zip code. To get Gas prices for your Zip code of interest, just ask what are the gas prices in zip code 94560.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please provide a valid zip code";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, cardOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "<speak><s>Thank you for trying gas prices finder.</s><s> Have a nice day!</s></speak>";
    var cardOutput = "Thank you for trying Gas Prices Finder. Have a nice day!";
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, cardOutput, null, shouldEndSession));
}


function getGasPrices(intent, session, callback) {
    var zipcode = intent.slots.zip.value;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "<speak><s> Here are the lowest Gas prices for your requested zip code.</s>";
    var cardOutput = "Here are the lowest Gas prices for your requested zip code.";
    var repromptOutput = null;
    console.log("zip: "+zipcode);
    
    getJsonEventsFromMapquest(zipcode, function(events) {
        console.log("event: "+events.length);
        if(events.length===0)
        {
            speechOutput = "<speak><s>Invalid Zip code or no results found for the zip code that you have provided.</s><s> Please provide a valid zip code.</s>";
            cardOutput = "Invalid Zip code or no results found for the zip code that you have provided. Please provide a valid zip code."
            repromptOutput = "Please provide a valid zip code";
            shouldEndSession = false;
        }
        else
        {
            for(i=0;i<events.length;i++)
            {
                speechOutput = speechOutput + "<s> Result " + (i+1) + " is " + events[i].name + " located at " + events[i].GeoAddress.Street +".</s>";
                cardOutput = cardOutput +" Result " + (i+1) + " is " + events[i].name + " located at " + events[i].GeoAddress.Street;
            
                for(j=0;j<events[i].opisGasPrices.length;j++)
                {
                    speechOutput = speechOutput + "<s> Price for " +events[i].opisGasPrices[j].type + " Gas is $" + events[i].opisGasPrices[j].amount +".</s>";
            
                    cardOutput = cardOutput + " Price for " +events[i].opisGasPrices[j].type + " Gas is $" + events[i].opisGasPrices[j].amount +".";
                }    
            }
            shouldEndSession = true;
        }    
        //console.log(speechOutput);
        // Setting repromptText to null signifies that we do not want to reprompt the user.
        // If the user does not respond or says something that is not understood, the session
        // will end.
        speechOutput = speechOutput + "</speak>";
        callback([speechOutput,cardOutput, repromptOutput, shouldEndSession]);
    });
}

function getJsonEventsFromMapquest(zip, eventCallback) {
    var url = host + path + zip;
    
    console.log("url is:" +url);
    
    http.get(url, function(res) {
        var resJSON = '';
        console.log("STATUS:" + res.statusCode);

        res.on('data', function (chunk) {
            resJSON += chunk;
        });
        console.log("resJSON:"+resJSON);
       res.on('end', function () {
             var stringResult = JSON.parse(resJSON);
             //console.log("string:" +stringResult.results[0].name);
             eventCallback(stringResult.results);
         });
    
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, speechOutput, cardOutput, repromptText, shouldEndSession) {
    console.log("ssml:"+speechOutput);
    console.log("text:"+cardOutput)
    return {
        outputSpeech: {
            type: "SSML",
            ssml: speechOutput
        },
        card: {
            type: "Simple",
            title: "Gas Prices",
            content: cardOutput
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
