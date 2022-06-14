const { PrismaClient } = require("@prisma/client");
const moment = require("moment");
const momentTZ = require("moment-timezone");

const prisma = new PrismaClient();

let user = null;
let existingUsers = false;
let currentSession = null;

async function main(message, args) {
	let userID = message.author.id;
	let authorUsername = message.author.username;

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
				message.channel.send({
					content: `Session Number : ${JSON.stringify(
						currentSession[0]?.sessions[0]?.id + 1
					)}\n TIME CLOCKED IN: ${momentTZ
						.tz(new Date(), "Asia/Colombo")
						.format("hh:mm:ss")}`,
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
