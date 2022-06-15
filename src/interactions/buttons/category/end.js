const { PrismaClient } = require("@prisma/client");
const { MessageEmbed } = require("discord.js");
const momentTZ = require("moment-timezone");
const moment = require("moment");

const prisma = new PrismaClient();

let user = null;
let sessionCount = null;
let cacheVar = null;

let main = async (interaction) => {
	let userID = interaction.user.id;

	let currentID = await prisma.user.findMany({
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

	currentSession = await prisma.user.findMany({
		select: {
			sessions: {
				orderBy: {
					id: "desc",
				},
				take: 1,
			},
		},
	});

	sessionCount = await prisma.user.findMany({
		include: {
			_count: { select: { sessions: true } },
		},
	});

	await prisma.user.update({
		where: {
			id: userID,
		},
		data: {
			sessions: {
				update: {
					data: {
						end:
							currentSession[0].sessions[0].end != null
								? undefined
								: new Date(),
						totalTime: moment
							.utc(
								moment(
									currentSession[0].sessions[0]?.end || new Date(),
									"DD/MM/YYYY HH:mm:ss"
								).diff(
									moment(
										currentSession[0].sessions[0]?.start,
										"DD/MM/YYYY HH:mm:ss"
									)
								)
							)
							.format("HH:mm:ss"),
					},
					where: {
						id: currentID[0].sessions[0]?.id,
					},
				},
			},
		},
	});

	user = await prisma.user.findUnique({
		where: {
			id: userID,
		},
		include: {
			sessions: true,
		},
	});

	cacheVar = await prisma.user.findMany({
		where: {
			id: interaction.user.id,
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
};

module.exports = {
	id: "end",

	async execute(interaction) {
		let embed = new MessageEmbed().setColor(0x4286f4);

		main(interaction)
			.then(async () => {
				let sessionCache = sessionCount.filter(
					(value) => value.id === interaction.user.id
				);

				embed
					.setColor("#0099ff")
					.setTitle(
						`⏹️ Session Ended: ${JSON.stringify(
							sessionCache[0]._count.sessions
						)}`
					)
					.setThumbnail(user.avatar)
					.addFields(
						{
							name: "Time Ended",
							value: momentTZ
								.tz(new Date(), "Asia/Colombo")
								.format("hh:mm:ss A"),
						},
						{
							name: "Total Time",
							value: String(cacheVar[0].sessions[0].totalTime),
						}
					);

				interaction.reply({
					embeds: [embed],
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
