const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

let user = null;

async function main(message, args) {
	let userID = message.author.id;

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
	name: "show",

	execute(message, args) {
		main(message, args)
			.then(() => {
				message.channel.send({
					content: `${JSON.stringify(user).substring(0, 2000)}`,
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
