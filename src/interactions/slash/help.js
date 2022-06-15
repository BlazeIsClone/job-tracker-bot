const { SlashCommandBuilder } = require("@discordjs/builders");
const { prefix } = require("../../../config.json");

/**
 * @file Ping slash command.
 * @author BlazeIsClone
 * @since 2.0.0
 * @version 1.0.0
 */

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
