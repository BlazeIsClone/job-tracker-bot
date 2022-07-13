const { theme_color } = require("../../../config.json");
const { PrismaClient } = require("@prisma/client");
const { MessageEmbed } = require("discord.js");
const momentTZ = require("moment-timezone");
const moment = require("moment");

const prisma = new PrismaClient();

let user = null;

let main = async (interaction) => {
	let userID = interaction.user.id;

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
	id: "show",

	async execute(interaction) {
		let embedArr = [];

		main(interaction)
			.then(async () => {
				if (user?.sessions == null)
					return interaction.channel.send({
						content: `⚠️ No previous sessions found for the user ${
							userArgs || " "
						}`,
					});

				user.sessions.map(({ id: sessionID, start, end, totalTime }, index) => {
					if (index >= 5) return;
					let embed = new MessageEmbed()
						.setColor(theme_color)
						.setTitle(`Session ${sessionID}`)
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
				await interaction.member.send({
					embeds: embedArr || "⚠️ No previous sessions found for the user",
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
