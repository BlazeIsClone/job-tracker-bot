const { PrismaClient } = require("@prisma/client");
const moment = require("moment");

const prisma = new PrismaClient();

let user = null;
let startTime = null;

async function main(message) {
	let userID = message.author.id;

	await prisma.user.update({
		where: {
			id: userID,
		},
		data: {
			sessions: {
				update: {
					data: {
						end: new Date(),
						totalTime: Math.floor(
							moment
								.duration(
									moment([21, 30, 00], "HH:mm:ss").diff(
										startTime?.sessions[0].start
									)
								)
								.asHours()
						),
					},
					where: {
						id: 2,
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

	startTime = await prisma.user.findUnique({
		where: {
			id: userID,
		},
		include: {
			sessions: true,
		},
	});
}

module.exports = {
	name: "stop",

	execute(message, args) {
		main(message, args)
			.then(() => {
				message.channel.send({
					content: `userID : ${JSON.stringify(
						user.id
					)}\n name: ${JSON.stringify(user.username)}\n`,
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
