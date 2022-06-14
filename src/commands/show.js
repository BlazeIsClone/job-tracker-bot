const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

let user = null;

async function main(args) {
	user = await prisma.user.findUnique({
		where: {
			id: JSON.parse(args[0]),
		},
		include: {
			sessions: true,
		},
	});
}

module.exports = {
	name: "show",

	execute(message, args) {
		if (!isNaN(args)) {
			main(args)
				.then(() => {
					message.channel.send({
						content: `Name: ${JSON.stringify(user)}`,
					});
				})
				.catch((e) => {
					throw e;
				})
				.finally(async () => {
					await prisma.$disconnect();
				});
		}
	},
};
