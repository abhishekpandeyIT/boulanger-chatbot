// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class OnlineStoreDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'onlineStoreDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.productStep.bind(this),
                this.quantityStep.bind(this),
                this.sizeStep.bind(this),
                this.flavorStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * If item name is not provided then, prompt for one.
     */
    async productStep(stepContext) {
        const orderDetails = stepContext.options;
        if (!orderDetails.product) {
            const messageText = 'To what product would you like to have today?';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(orderDetails.product);
    }

    /**
     * If an quantity has not been provided, prompt for one.
     */
    async quantityStep(stepContext) {
        const orderDetails = stepContext.options;

        // Capture the response to the previous step's prompt
        orderDetails.product = stepContext.result;
        if (!orderDetails.quantity) {
            const messageText = 'How much units required for today?';
            const msg = MessageFactory.text(messageText, 'Please specify the number of units of products.', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(orderDetails.quantity);
    }

    /**
     * If an size has not been provided, prompt for one.
     */
    async sizeStep(stepContext) {
        const orderDetails = stepContext.options;

        // Capture the response to the previous step's prompt
        orderDetails.quantity = stepContext.result;
        if (!orderDetails.size) {
            const messageText = 'Which size you prefer most?';
            const msg = MessageFactory.text(messageText, 'Which size you required? Default is small', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(orderDetails.size);
    }

    /**
     * If an flavor has not been provided, prompt for one.
     */
    async flavorStep(stepContext) {
        const orderDetails = stepContext.options;

        // Capture the response to the previous step's prompt
        orderDetails.size = stepContext.result;
        if (!orderDetails.flavor) {
            const messageText = 'Which flavor you prefer most?';
            const msg = MessageFactory.text(messageText, 'Which flavor you likes the most?', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(orderDetails.flavor);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const orderDetails = stepContext.options;

        // Capture the results of the previous step
        orderDetails.flavor = stepContext.result;
        const flavorText = !orderDetails.flavor === 'NA' ? (String(orderDetails.flavor) + ' flavored') : '';
        const sizeText = !orderDetails.size === 'NA' ? (String(orderDetails.size) + ' size') : ''
        const messageText = `Please confirm, My order for today is ${orderDetails.quantity} units of ${flavorText} ${sizeText} ${orderDetails.product}. Is this correct?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    async finalStep(stepContext) {
        if (stepContext.result === true) {
            const orderDetails = stepContext.options;
            return await stepContext.endDialog(orderDetails);
        }
        return await stepContext.endDialog();
    }
}

module.exports.OnlineStoreDialog = OnlineStoreDialog;
