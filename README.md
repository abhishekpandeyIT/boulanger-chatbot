# Welcome to our Online Bakery

Hi! I am Abhishek Pandey, submitting my project named as **Boulanger**, a french word which means Baker (Someone who own or work at Bakery). 

## Breif Introduction
I heard this word Boulanger at my French Language Course, and when we are making an online store then I thought it should have a name, so I named this chatbot as Boulanger.

Boulanger is LUIS and Azure based chatbot which uses Natural Language Processing to understand the user's query and respond accordingly. Currently, Boulanger is designed to take orders from the customers. To make this chatbot more user friendly, I have provided options to the users to choose from the given options.

### Advantages:
Boulanger is intellingent to understand the user needs and ask if something else is required at his end. For example, if user enter in a query that- **I want small bread.** In this query few things are missing such as in what quantity user needs bread, and which type of bread they want brown bread/ wheat bread or any thing else from the given option. 

To gather these information the Chatbot is intelligent enough and will prompt user to provide ***only rest*** information by choosing from the given options.

## How to Run the Chatbot
User will need to perform following steps to run this chatbot.

 1. Open a command terminal in the folder where the code for this chatbot exist.
 2. Enter `npm install` in the cmd terminal, this command will install all the required packages mentioned in the Package.json file of the folder.
 3. Once you created the LUIS model, update `.env` with your `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName`. 
```text
	LuisAppId="Your LUIS App Id"
	LuisAPIKey="Your LUIS Subscription key here"
	LuisAPIHostName="Your LUIS App region here (i.e: *******.api.cognitive.microsoft.com)"
```
 4. Once installation and other configuration is completed user need to run the project.
 5. To run this project enter `npm start` command in the command terminal. This command will run the code which can be consumed from the BOT Emulator.
## Testing the bot using Bot Framework Emulator

[Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.9.0 or greater from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to the bot using Bot Framework Emulator
- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`


Thanks
**Abhishek Pandey**
