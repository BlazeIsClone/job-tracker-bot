const { prefix, theme_color } = require("../../../config.json");

const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder().setName("help").setDescription("Get help"),

	async execute(interaction) {
		let embed = new MessageEmbed().setColor(theme_color);

		embed
			.setTitle("💉 Command Usage Guide")
			.addFields({
				name: "Start Tracking Session",
				value: "Click on the Track Job button to start tracking time",
			})
			.addFields({
				name: "End Current Tracking Session",
				value: "Will be available once you start a time tracking session.",
			})
			.addFields({
				name: "Total Time",
				value: `Use the ${prefix}total command`,
			})
			.addFields({
				name: "Show Session History",
				value: `Use the ${prefix}show command`,
			});

		interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
};
