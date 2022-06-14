const { PrismaClient } = require("@prisma/client");
const moment = require("moment");

const prisma = new PrismaClient();

let user = null;
let existingUsers = false;

async function main(message, args) {
	let userID = message.author.id;
	let authorUsername = message.author.username;

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
}

module.exports = {
	name: "track",

	execute(message, args) {
		main(message, args)
			.then(() => {
				message.author.send({
					content: `TIME CLOCKED IN: ${moment()}`,
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
