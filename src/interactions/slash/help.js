const { SlashCommandBuilder } = require("@discordjs/builders");
const { prefix } = require("../../../config.json");

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder().setName("help").setDescription("Get help"),

	async execute(interaction) {
		interaction.reply({
			content: `💊 Use this command to start tracking time: ${prefix}track`,
			ephemeral: true,
		});
	},
};
