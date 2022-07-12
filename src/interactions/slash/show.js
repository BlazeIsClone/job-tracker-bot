const { theme_color } = require("../../../config.json");
const { MessageEmbed, Message } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PrismaClient } = require("@prisma/client");
const momentTZ = require("moment-timezone");

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
		let embedArr = [];

		main(interaction, userArgs)
			.then(async () => {
				if (user?.sessions == null)
					return interaction.channel.send({
						content: `⚠️ No previous sessions found for the user ${
							userArgs || " "
						}`,
					});

				user.sessions.map(({ id: sessionID, start, end, totalTime }, index) => {
					if (index >= filterArgs) return;

					let embed = new MessageEmbed()
						.setColor(theme_color)
						.setTitle(`Session ${sessionID}`)
						.setDescription(`Name: ${user.username}`)
						.setThumbnail(user.avatar)
						.addFields(
							{
								name: "Start Time",
								value: momentTZ
									.tz(start, "Asia/Colombo")
									.format("hh:mm A DD/MM/YY "),
								inline: true,
							},
							{
								name: "End Time",
								value: end
									? momentTZ
											.tz(end, "Asia/Colombo")
											.format("hh:mm A DD/MM/YY") + " Hours"
									: "Session Not Ended",
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
							value: totalTime
								? String(totalTime) + " Hours"
								: "Session Not Ended",
						});

					embedArr.push(embed);
				});
				await interaction.reply({
					embeds: embedArr || "⚠️ No previous sessions found for the user",
					ephemeral: true,
				});
			})
			.catch((e) => {
				throw e;
			})
			.finally(async () => {
				await prisma.$disconnect();
			});
	},
};
