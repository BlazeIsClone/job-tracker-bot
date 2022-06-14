const { PrismaClient } = require("@prisma/client");
const moment = require("moment");

const prisma = new PrismaClient();

let user = null;
let currentSession = null;

async function main(message) {
	let userID = message.author.id;

	let currentID = await prisma.user.findMany({
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

	await prisma.user.update({
		where: {
			id: userID,
		},
		data: {
			sessions: {
				update: {
					data: {
						end: new Date(),
						totalTime: moment
							.utc(
								moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(
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
}

module.exports = {
	name: "stop",

	execute(message, args) {
		main(message, args)
			.then(async () => {
				let cacheVar = await prisma.user.findMany({
					select: {
						sessions: {
							orderBy: {
								id: "desc",
							},
							take: 1,
						},
					},
				});
				message.channel.send({
					content: `Session Number : ${JSON.stringify(
						currentSession[0].sessions[0]?.id
					)}\n name: ${JSON.stringify(
						user.username
					)}\n TotalTime: ${JSON.stringify(cacheVar[0].sessions[0].totalTime)}`,
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
