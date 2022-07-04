// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { LuisRecognizer } = require('botbuilder-ai');

class OnlineOrderRecognizer {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {
            // Set the recognizer options depending on which endpoint version you want to use e.g v2 or v3.
            // More details can be found in https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/luis-migration-api-v3
            const recognizerOptions = {
                apiVersion: 'v3'
            };

            this.recognizer = new LuisRecognizer(config, recognizerOptions);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        return await this.recognizer.recognize(context);
    }

    getproductEnities(result) {
        let productValue;
        if (result.entities.$instance.Product) {
            productValue = result.entities.$instance.Product[0].text;
        }
        return { product: productValue };
    }
    getproductSizeEntities(result) {
        let productSize;
        if (result.entities.$instance.ProductSize) {
            productSize = result.entities.$instance.ProductSize[0].text;
        }
        return { size: productSize };
    }
    getproductFlavorsEntities(result) {
        let productFlavor;
        if (result.entities.$instance.ProductFlavors) {
            productFlavor = result.entities.$instance.ProductFlavors[0].text;
        }
        return { flavor: productFlavor };
    }
    getproductnumberEntities(result) {
        let productQuantity;
        if (result.entities.$instance.number) {
            productQuantity = result.entities.$instance.number[0].text;
        }
        return { quantity: productQuantity };
    }
}

module.exports.OnlineOrderRecognizer = OnlineOrderRecognizer;
