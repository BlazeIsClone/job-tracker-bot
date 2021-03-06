const { theme_color } = require("../../../config.json");
const { PrismaClient } = require("@prisma/client");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const momentTZ = require("moment-timezone");

const prisma = new PrismaClient();

let currentSession = null;

let main = async (interaction) => {
	let userID = interaction.user.id;
	let authorUsername = interaction.user.username;

	existingUsers = await prisma.user.findUnique({
		where: {
			id: userID,
		},
	});

	if (!existingUsers) {
		await prisma.user.create({
			data: {
				id: userID,
				username: authorUsername,
				avatar: interaction.user.avatarURL(),
				sessions: { create: {} },
			},
		});
	}

	currentSession = await prisma.user.findMany({
		where: {
			id: userID,
		},
		select: {
			sessions: {
				orderBy: {
					id: "desc",
				},
				take: 1,
			},
		},
	});

	if (existingUsers && currentSession[0]?.sessions[0]?.end) {
		await prisma.user.update({
			where: {
				id: userID,
			},
			data: {
				sessions: { create: {} },
			},
		});
	}

	sessionCount = await prisma.user.findMany({
		include: {
			_count: { select: { sessions: true } },
		},
	});
};

module.exports = {
	id: "track",

	async execute(interaction) {
		let embed = new MessageEmbed().setColor(theme_color);

		main(interaction)
			.then(async () => {
				let sessionCache = sessionCount.filter(
					(value) => value.id === interaction.user.id
				);

				embed
					.setColor(theme_color)
					.setTitle(`▶  Session Created: ${sessionCache[0]._count.sessions}`)
					.addFields({
						name: "Time Created",
						value: momentTZ.tz(new Date(), "Asia/Colombo").format("hh:mm A"),
					});

				let endBtn = new MessageActionRow().addComponents(
					new MessageButton()
						.setCustomId("end")
						.setLabel("End Session")
						.setStyle("DANGER")
						.setEmoji("⏹️")
				);

				interaction.member.send({
					embeds: [embed],
					components: [endBtn],
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
