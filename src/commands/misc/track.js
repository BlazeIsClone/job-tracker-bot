/**
 * @file Sample track command
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
			name: `${args}`,
			email: `${args}@gmail.com`,
			posts: { create: {} },
		},
	});

	user = await prisma.user.findUnique({
		where: {
			email: `${args}@gmail.com`,
		},
		include: {
			posts: true,
		},
	});
}

/**
 * @type {import('../../typings').LegacyCommand}
 */
module.exports = {
	name: "track",

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
