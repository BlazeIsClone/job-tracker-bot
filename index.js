// Declare constants which will be used throughout the bot.

const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { token, client_id, test_guild_id } = require("./config.json");

/**
 * From v13, specifying the intents is compulsory.
 * @type {import('./typings').Client}
 * @description Main Application Client */

// @ts-ignore
const client = new Client({
	// Please add all intents you need, more detailed information
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/**********************************************************************/
// Below we will be making an event handler!

/**
 * @description All event files of the event handler.
 * @type {String[]}
 */

const eventFiles = fs
	.readdirSync("./src/events")
	.filter((file) => file.endsWith(".js"));

// Loop through all files and execute the event when it is actually emmited.
for (const file of eventFiles) {
	const event = require(`./src/events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(
			event.name,
			async (...args) => await event.execute(...args, client)
		);
	}
}

/**********************************************************************/
// Define Collection of Commands, Slash Commands and cooldowns

client.commands = new Collection();
client.slashCommands = new Collection();
client.buttonCommands = new Collection();
client.cooldowns = new Collection();
client.triggers = new Collection();

/**********************************************************************/
// Registration of Message-Based Legacy Commands.

/**
 * @type {String[]}
 * @description All command categories aka folders.
 */

// Loop through all files and store commands in commands collection.

const commandFiles = fs
	.readdirSync(`./src/commands`)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
}

/**********************************************************************/
// Registration of Slash-Command Interactions.

/**
 * @type {String[]}
 * @description All slash commands.
 */

const slashCommands = fs.readdirSync("./src/interactions/slash");

// Loop through all files and store slash-commands in slashCommands collection.

const slashCommandFiles = fs
	.readdirSync(`./src/interactions/slash`)
	.filter((file) => file.endsWith(".js"));

for (const commandFile of slashCommandFiles) {
	const command = require(`./src/interactions/slash/${commandFile}`);
	client.slashCommands.set(command.data.name, command);
}

/**********************************************************************/
// Registration of Button-Command Interactions.

/**
 * @type {String[]}
 * @description All button commands.
 */

// Loop through all files and store button-commands in buttonCommands collection.

const buttonCommandFiles = fs
	.readdirSync(`./src/interactions/buttons`)
	.filter((file) => file.endsWith(".js"));

for (const commandFile of buttonCommandFiles) {
	const command = require(`./src/interactions/buttons/${commandFile}`);
	client.buttonCommands.set(command.id, command);
}

/**********************************************************************/
// Registration of Slash-Commands in Discord API

const rest = new REST({ version: "9" }).setToken(token);

const commandJsonData = [
	...Array.from(client.slashCommands.values()).map((c) => c.data.toJSON()),
];

(async () => {
	try {
		console.log("Started refreshing application (/) commands.");

		await rest.put(
			/**
			 * By default, you will be using guild commands during development.
			 * Once you are done and ready to use global commands (which have 1 hour cache time),
			 * 1. Please uncomment the below (commented) line to deploy global commands.
			 * 2. Please comment the below (uncommented) line (for guild commands).
			 */

			Routes.applicationGuildCommands(client_id, test_guild_id),

			/**
			 * Good advice for global commands, you need to execute them only once to update
			 * your commands to the Discord API. Please comment it again after running the bot once
			 * to ensure they don't get re-deployed on the next restart.
			 */

			// Routes.applicationGuildCommands(client_id)

			{ body: commandJsonData }
		);

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();

/**********************************************************************/
// Registration of Message Based Chat Triggers

/**
 * @type {String[]}
 * @description All trigger categories aka folders.
 */

// Loop through all files and store triggers in triggers collection.

const triggerFiles = fs
	.readdirSync(`./src/triggers`)
	.filter((file) => file.endsWith(".js"));
for (const file of triggerFiles) {
	const trigger = require(`./src/triggers/${file}`);
	client.triggers.set(trigger.name, trigger);
}

// Login into your client application with bot's token.

client.login(token);
