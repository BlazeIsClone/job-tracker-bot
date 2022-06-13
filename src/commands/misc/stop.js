/**
 * @file Sample stop command
 * @author BlazeClone
 * @since 1.0.0
 * @version 1.0.0
 */

const { PrismaClient } = require("@prisma/client");
const moment = require("moment");

const prisma = new PrismaClient();

let user = null;

async function main(args) {
	await prisma.user.create({
		data: {
			posts: {
				create: {
					end: new Date("2020-03-19T14:21:00+0200"),
				},
			},
		},
	});
}

/**
 * @type {import('../../typings').LegacyCommand}
 */
module.exports = {
	name: "stop",

	execute(message, args) {
		main(args)
			.then(() => {
				message.channel.send({
					content: `USER ID: ${JSON.stringify(user.id)}`,
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
