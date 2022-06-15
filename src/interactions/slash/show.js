const { theme_color } = require("../../../config.json");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PrismaClient } = require("@prisma/client");
const momentTZ = require("moment-timezone");

/**
 * @file Show slash command.
 * @author BlazeIsClone
 * @since 2.0.0
 * @version 1.0.0
 */

const prisma = new PrismaClient();

let user = null;

let main = async (interaction, userArgs) => {
	let userID;

	if (userArgs) {
		userID = userArgs.user.id;
	} else {
		userID = interaction.user.id;
	}

	user = await prisma.user.findUnique({
		where: {
			id: userID,
		},
		include: {
			sessions: { orderBy: { id: "desc" } },
		},
	});
};

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("show")
		.setDescription("Show time tracking session history")
		.addIntegerOption((option) =>
			option
				.setName("filter")
				.setDescription("Number of sessions to be displayed")
				.setRequired(true)
		)
		.addMentionableOption((option) =>
			option.setName("user").setDescription("Target user")
		),

	async execute(interaction) {
		let filterArgs = interaction.options.getInteger("filter");
		let userArgs = interaction.options.getMentionable("user");

		let embed = new MessageEmbed().setColor(theme_color);

		main(interaction, userArgs)
			.then(() => {
				if (user?.sessions == null)
					return interaction.channel.send({
						content: `⚠️ No previous sessions found for the user ${
							userArgs || " "
						}`,
					});

				user.sessions.map(({ id: sessionID, start, end, totalTime }, index) => {
					if (index >= filterArgs) return;

					embed
						.setColor(theme_color)
						.setTitle(`Session ${sessionID}`)
						.setDescription(`Name: ${user.username}`)
						.setThumbnail(user.avatar)
						.addFields(
							{
								name: "Start Time",
								value: momentTZ.tz(start, "Asia/Colombo").format("hh:mm:ss"),
								inline: true,
							},
							{
								name: "End Time",
								value: momentTZ.tz(end, "Asia/Colombo").format("hh:mm:ss A"),
								inline: true,
							},
							{
								name: "\u200B",
								value: "\u200B",
								inline: true,
							}
						)
						.addFields({
							name: "Session Duration",
							value: String(totalTime),
						});

					interaction.channel.send({
						embeds: [embed],
						ephemeral: true,
					});
				});
			})
			.catch((e) => {
				throw e;
			})
			.finally(async () => {
				await prisma.$disconnect();
			});

		await interaction.reply({
			content: `📁 Showing filtered results`,
		});
	},
};
