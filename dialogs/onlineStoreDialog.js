const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, ChoicePrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const SIZE_PROMPT = 'sizePrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class OnlineStoreDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'onlineStoreDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new ChoicePrompt(SIZE_PROMPT))
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
            return await stepContext.prompt(
                SIZE_PROMPT, {
                prompt: messageText,
                choices: ['Pizza', 'Bun', 'Bread', 'Cake', 'Pastries', 'Eggs'],
                retryPrompt: 'Currently this item is unavailable at us'
            }
            );
        }
        return await stepContext.next(orderDetails.product);
    }

    /**
     * If an quantity has not been provided, prompt for one.
     */
    async quantityStep(stepContext) {
        const orderDetails = stepContext.options;
        // Capture the response to the previous step's prompt
        orderDetails.product = stepContext.result != null && stepContext.result.value != null ? stepContext.result.value : stepContext.result;
        if (!orderDetails.quantity) {
            const messageText = 'How much units required for today?';
            return await stepContext.prompt(
                SIZE_PROMPT, {
                prompt: messageText,
                choices: ['1', '2', '4', '6', '8', '10'],
                retryPrompt: 'Please enter a valid number'
            }
            );
        }
        return await stepContext.next(orderDetails.quantity);
    }

    /**
     * If an size has not been provided, prompt for one.
     */
    async sizeStep(stepContext) {
        const orderDetails = stepContext.options;
        // Capture the response to the previous step's prompt
        orderDetails.quantity = stepContext.result != null && stepContext.result.value != null ? stepContext.result.value : stepContext.result;
        if (!orderDetails.size) {
            const messageText = 'Which size you prefer most?';
            if (orderDetails.product === 'Eggs') {
                return await stepContext.prompt(
                    SIZE_PROMPT, {
                    prompt: messageText,
                    choices: ['Standard', 'Choosen_Big'],
                    retryPrompt: 'Please enter a size'
                }
                );
            }
            else {
                return await stepContext.prompt(
                    SIZE_PROMPT, {
                    prompt: messageText,
                    choices: ['small', 'medium', 'large'],
                    retryPrompt: 'Please enter a size'
                }
                );
            }
        }
        return await stepContext.next(orderDetails.size);
    }

    /**
     * If an flavor has not been provided, prompt for one.
     */
    async flavorStep(stepContext) {
        const orderDetails = stepContext.options;
        // Capture the response to the previous step's prompt
        orderDetails.size = stepContext.result != null && stepContext.result.value != null ? stepContext.result.value : stepContext.result;
        if (!orderDetails.flavor) {
            const messageText = 'Which taste you prefer most?';
            if (orderDetails.product === 'Cake' || orderDetails.product === 'Pastries') {
                return await stepContext.prompt(
                    SIZE_PROMPT, {
                    prompt: messageText,
                    choices: ['Chocolate', 'Pineapple', 'Starwberry', 'Black Forest'],
                    retryPrompt: 'Please select a valid value'
                }
                );
            }
            else if (orderDetails.product === 'Bun' || orderDetails.product === 'Bread') {
                return await stepContext.prompt(
                    SIZE_PROMPT, {
                    prompt: messageText,
                    choices: ['Brown', 'Milk', 'Wheat', 'MultiGrain'],
                    retryPrompt: 'Please select a valid value'
                }
                );
            }
            else if (orderDetails.product === 'Eggs') {
                return await stepContext.prompt(
                    SIZE_PROMPT, {
                    prompt: messageText,
                    choices: ['Standard Brown Eggs', 'Nest-Laid Eggs', 'Organic Eggs', 'Omega-3 Eggs'],
                    retryPrompt: 'Please select a valid value'
                }
                );
            }
            else if (orderDetails.product === 'Pizza') {
                return await stepContext.prompt(
                    SIZE_PROMPT, {
                    prompt: messageText,
                    choices: ['Extra Vagenga', 'Veggie Paradise', 'Farmhouse', 'Double Cheese'],
                    retryPrompt: 'Please select a valid value'
                }
                );
            }
        }
        return await stepContext.next(orderDetails.flavor);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const orderDetails = stepContext.options;

        // Capture the results of the previous step
        orderDetails.flavor = stepContext.result.value ? stepContext.result.value : stepContext.result;
        const messageText = `Please confirm, My order for today is ${orderDetails.quantity} units of ${orderDetails.flavor} ${orderDetails.size} size ${orderDetails.product}. Is this correct?`;
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
