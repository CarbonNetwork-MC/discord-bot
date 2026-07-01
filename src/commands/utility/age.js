const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
	isDev: false,
    servers: null,
    allowedUsers: null,
    requiredPermissions: null,

	data: new SlashCommandBuilder()
		.setName('age')
		.setDescription('Calculates the age based on the provided date of birth.')
		.addStringOption(option =>
			option.setName('dob')
				.setDescription('Your date of birth (DD-MM-YYYY).')
				.setRequired(true)
		),

	async execute(interaction) {
		const dobString = interaction.options.getString('dob');
        const [day, month, year] = dobString.split('-').map(Number);
        const dob = new Date(year, month - 1, day);
        const now = new Date();

        if (isNaN(dob.getTime())) {
            return interaction.reply({ 
                content: 'Invalid date format. Please use DD-MM-YYYY.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        let age = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
            age--;
        }

        const embed = new EmbedBuilder()
            .setTitle('Age Calculator')
            .setDescription(`You are **${age}** years old.`)
            .setColor(process.env.COLOR_BLUE)
            .setFooter({ text: process.env.EMBED_FOOTER })
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed] 
        });
	},
};