const { SlashCommandBuilder } = require("@discordjs/builders");

/**
 * @file Ping slash command.
 * @author BlazeIsClone
 * @since 2.0.0
 * @version 1.0.0
 */

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Pings the server"),

	async execute(interaction) {
		interaction.reply({
			content: "🏓 PONG!",
			ephemeral: true,
		});
	},
};
