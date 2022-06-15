const { PrismaClient } = require("@prisma/client");
const { Permissions } = require("discord.js");

/**
 * @file Clear command.
 * @author BlazeIsClone
 * @since 2.0.0
 * @version 3.2.2
 */

const prisma = new PrismaClient();

let main = async () => {
	await prisma.session.deleteMany({});
};

module.exports = {
	name: "clear",
	description: "Reset session cache",
	aliases: ["reset"],
	usage: "[command name]",
	cooldown: 300,

	execute(message) {
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			return message.channel.send({
				content: `⚠️ Only Server Administrators can do that!`,
			});

		main()
			.then(() => {
				message.channel.send({
					content: `🧹 Database Session Cache Cleared`,
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
