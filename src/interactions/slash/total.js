const { theme_color } = require("../../../config.json");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PrismaClient } = require("@prisma/client");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

const prisma = new PrismaClient();

let user = null;

async function main(interaction, userArgs) {
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
}

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("total")
		.setDescription("Get the total job time"),

	async execute(interaction) {
		let embed = new MessageEmbed().setColor(theme_color);
		let userArgs = interaction.options.getMentionable("user");

		main(interaction, userArgs)
			.then(() => {
				let totalArr = [];
				user.sessions.map(({ totalTime }) => {
					if (totalTime) {
						totalArr.push(totalTime);
					}
				});

				const sum = totalArr.reduce(
					(prev, current) => prev.add(moment.duration(current)),
					moment.duration()
				);

				embed
					.setColor(theme_color)
					.setTitle(`${user.username}'s Total Time`)
					.setThumbnail(user.avatar)
					.addFields({
						name: "Hours and Minutes",
						value: [Math.floor(sum.asHours()), sum.minutes()].join(":"),
					});

				interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			})
			.catch((e) => {
				throw e;
			})
			.finally(async () => {
				totalArr = [];
				await prisma.$disconnect();
			});
	},
};
