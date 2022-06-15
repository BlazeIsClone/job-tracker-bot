const { theme_color } = require("../../../config.json");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");
const { PrismaClient } = require("@prisma/client");
const { MessageEmbed } = require("discord.js");
const momentTZ = require("moment-timezone");

/**
 * @file Track slash command.
 * @author BlazeIsClone
 * @since 2.0.0
 * @version 1.0.0
 */

const prisma = new PrismaClient();

let user = null;
let existingUsers = false;
let sessionCount = null;

async function main(interaction) {
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

	if (existingUsers) {
		await prisma.user.update({
			where: {
				id: userID,
			},
			data: {
				sessions: { create: {} },
			},
		});
	}

	user = await prisma.user.findUnique({
		where: {
			id: userID,
		},
		include: {
			sessions: true,
		},
	});

	sessionCount = await prisma.user.findMany({
		include: {
			_count: { select: { sessions: true } },
		},
	});
}

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("track")
		.setDescription("Create a new session and track time"),

	async execute(interaction) {
		let embed = new MessageEmbed().setColor(theme_color);

		let component = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId("end")
				.setLabel("End Session")
				.setStyle("DANGER")
				.setEmoji("⏹️")
		);

		main(interaction)
			.then(() => {
				let sessionCache = sessionCount.filter(
					(value) => value.id === interaction.user.id
				);
				embed
					.setColor(theme_color)
					.setTitle(
						`▶  Session Created: ${JSON.stringify(
							sessionCache[0]._count.sessions
						)}`
					)
					.setThumbnail(user.avatar)
					.addFields({
						name: "Time Created",
						value: momentTZ.tz(new Date(), "Asia/Colombo").format("hh:mm:ss A"),
					});

				interaction.reply({
					embeds: [embed],
					components: [component],
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
