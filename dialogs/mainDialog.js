const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { MessageFactory, InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer, onlineStoreDialog) {
        super('MainDialog');

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        if (!onlineStoreDialog) throw new Error('[MainDialog]: Missing parameter \'onlineStoreDialog\' is required');

        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(onlineStoreDialog)
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }
    async introStep(stepContext) {
        if (!this.luisRecognizer.isConfigured) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg : 'Say something like "I need 2 small packets brown bread" or just say :"Order"';
        const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
    }
    async actStep(stepContext) {
        const orderDetails = {};

        if (!this.luisRecognizer.isConfigured) {
            return await stepContext.beginDialog('onlineStoreDialog', orderDetails);
        }

        // Call LUIS and gather any potential booking details. (Note the TurnContext has the response to the prompt)
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        switch (LuisRecognizer.topIntent(luisResult)) {
            case 'OrderProduct': {
                // Extract the values for the composite entities from the LUIS result.
                const productEnities = this.luisRecognizer.getproductEnities(luisResult);
                const productSizeEntities = this.luisRecognizer.getproductSizeEntities(luisResult);
                const productFlavorsEntities = this.luisRecognizer.getproductFlavorsEntities(luisResult);
                const productnumberEntities = this.luisRecognizer.getproductnumberEntities(luisResult);

                // Initialize orderDetails with any entities we may have found in the response.
                orderDetails.product = productEnities.product;
                orderDetails.size = productSizeEntities.size;
                orderDetails.flavor = productFlavorsEntities.flavor;
                orderDetails.quantity = productnumberEntities.quantity;

                console.log('LUIS extracted these booking details:', JSON.stringify(orderDetails));

                // Run the OnlineStoreDialog passing in whatever details we have from the LUIS call, it will fill out the remainder.
                return await stepContext.beginDialog('onlineStoreDialog', orderDetails);
            }
            default: {
                // Catch all for unhandled intents
                const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was ${LuisRecognizer.topIntent(luisResult)})`;
                await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
            }
        }
        return await stepContext.next();
    }

    async finalStep(stepContext) {
        // If the child dialog ("onlineStoreDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result;
            // If the call to the booking service was successful tell the user.
            const bookingTimeMsg = new Date(Date.now());
            const msg = `Thank you! We received your order for ${result.product} at ${bookingTimeMsg}, soon this product will be delivered to you.`;
            await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
        }

        // Restart the main dialog with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'Please explore other available products at Boulanger. What else can I do for you?' });
    }
}

module.exports.MainDialog = MainDialog;
