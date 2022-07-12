const { theme_color } = require("../../../config.json");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { PrismaClient } = require("@prisma/client");
const { MessageEmbed } = require("discord.js");
const momentTZ = require("moment-timezone");
const moment = require("moment");

/**
 * @file End slash command.
 * @author BlazeIsClone
 * @since 2.0.0
 * @version 1.0.0
 */

const prisma = new PrismaClient();

let user = null;
let sessionCount = null;

async function main(interaction) {
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
							currentSession[0].sessions[0]?.end != null
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
							.format("HH:mm"),
					},
					where: {
						id: currentID[0].sessions[0]?.id,
					},
				},
			},
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

	user = await prisma.user.findUnique({
		where: {
			id: userID,
		},
		include: {
			sessions: true,
		},
	});
}

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("end")
		.setDescription("Stop current session"),

	async execute(interaction) {
		let embed = new MessageEmbed().setColor(theme_color);

		main(interaction)
			.then(() => {
				let sessionCache = sessionCount.filter(
					(value) => value.id === interaction.user.id
				);

				embed
					.setColor(theme_color)
					.setTitle(
						`⏹  Session Ended: ${JSON.stringify(
							sessionCache[0]._count.sessions
						)}`
					)
					.setThumbnail(user.avatar)
					.addFields(
						{
							name: "Started",
							value: momentTZ
								.tz(cacheVar[0].sessions[0].start, "Asia/Colombo")
								.format("hh:mm A DD/MM/YY"),
							inline: true,
						},
						{
							name: "Ended",
							value: momentTZ
								.tz(cacheVar[0].sessions[0].end || new Date(), "Asia/Colombo")
								.format("hh:mm A DD/MM/YY "),
							inline: true,
						},
						{
							name: "Tracked Time",
							value: `${String(cacheVar[0].sessions[0].totalTime)} Hours`,
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
