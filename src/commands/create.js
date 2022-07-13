const { theme_color } = require("../../config.json");
const {
	Permissions,
	MessageEmbed,
	MessageActionRow,
	MessageButton,
} = require("discord.js");

module.exports = {
	name: "create",
	description: "Creates a tracking interface",
	aliases: [],
	usage: "[command name]",
	cooldown: 30,

	execute(message) {
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			return message.channel.send({
				content: `⚠️ Only Server Administrators can do that!`,
			});
		}

		let embed = new MessageEmbed()
			.setColor(theme_color)
			.setTitle("👮‍♂️ Job Tracker")
			.setDescription("Create a new session and start tracking time");

		let component = new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId("track")
				.setLabel("Start Tracking")
				.setStyle("PRIMARY")
				.setEmoji("▶️"),
			new MessageButton()
				.setCustomId("total")
				.setLabel("Total Time")
				.setStyle("SECONDARY")
				.setEmoji("⏲️"),
			new MessageButton()
				.setCustomId("show")
				.setLabel("Session History")
				.setStyle("SUCCESS")
				.setEmoji("📈"),
		]);

		message.channel
			.send({
				embeds: [embed],
				components: [component],
			})
			.catch((e) => {
				throw e;
			});
	},
};
