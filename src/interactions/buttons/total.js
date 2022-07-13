const { theme_color } = require("../../../config.json");
const { PrismaClient } = require("@prisma/client");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");

const prisma = new PrismaClient();

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
	id: "total",

	async execute(interaction) {
		let embed = new MessageEmbed().setColor(theme_color);

		main(interaction)
			.then(async () => {
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
					.setTitle(`Your Total Time`)
					.addFields({
						name: "Hours and Minutes",
						value: [Math.floor(sum.asHours()), sum.minutes()].join(":"),
					});

				interaction.member.send({
					embeds: [embed],
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
