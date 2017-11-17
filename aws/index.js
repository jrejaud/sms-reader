'use strict';

/**
 * This runs on AWS Lambda
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

 //Dependencies
 const request = require('request-promise');
 const SERVER_IP = "http://your_server:8080";
 const PASSWORD = "your_password";


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        // console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);
        console.log("Running!");

        request.get(SERVER_IP)
          .auth(USERNAME, PASSWORD, true)
          .then(function (response) {
            console.log("Response:",response);
            //Extract the title and the message from this object
            if (response.title === null) {
                callback(null,
                buildResponse({},
                buildSpeechletResponse("SMS Message", "No messages yet", "Reprompted",true)));
                return;
            }
            const responseJSON = JSON.parse(response);
            const senderName = responseJSON.title;
            const message = responseJSON.message;
            callback(null,
            buildResponse({},
            buildSpeechletResponse("SMS Message", senderName+" says "+message, "Reprompted",true)));
          })
    } catch (err) {
        callback(err);
    }
};
