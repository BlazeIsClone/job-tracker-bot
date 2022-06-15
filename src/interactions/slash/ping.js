const { SlashCommandBuilder } = require("@discordjs/builders");

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
