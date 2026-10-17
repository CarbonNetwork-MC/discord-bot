const { 
	SlashCommandBuilder, 
	EmbedBuilder, 
	MessageFlags,
	InteractionContextType,
	ApplicationIntegrationType
} = require("discord.js");

const { convertUnit, convertTemperature } = require("../../utils/conversionUtils.js");

module.exports = {
	isDev: false,
	servers: null,
	allowedUsers: null,
	requiredPermissions: null,

  	data: new SlashCommandBuilder()
		.setName("convert")
		.setDescription("Convert between common units.")
		.setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
		.addNumberOption(option =>
			option
				.setName("amount")
				.setDescription("The amount to convert")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("from")
				.setDescription("The unit to convert from")
				.setRequired(true)
				.addChoices(
					{ name: "Meters", value: "m" },
					{ name: "Kilometers", value: "km" },
					{ name: "Centimeters", value: "cm" },
					{ name: "Millimeters", value: "mm" },
					{ name: "Miles", value: "mi" },
					{ name: "Yards", value: "yd" },
					{ name: "Feet", value: "ft" },
					{ name: "Inches", value: "in" },
					{ name: "Acres", value: "ac" },
					{ name: "Hectares", value: "ha" },
					{ name: "Grams", value: "g" },
					{ name: "Kilograms", value: "kg" },
					{ name: "Milligrams", value: "mg" },
					{ name: "Pounds", value: "lb" },
					{ name: "Ounces", value: "oz" },
					{ name: "Bushels", value: "bu" },
					{ name: "Celsius", value: "c" },
					{ name: "Fahrenheit", value: "f" },
					{ name: "Kelvin", value: "k" }
				)
		)
		.addStringOption(option =>
			option
				.setName("to")
				.setDescription("The unit to convert to")
				.setRequired(true)
				.addChoices(
					{ name: "Meters", value: "m" },
					{ name: "Kilometers", value: "km" },
					{ name: "Centimeters", value: "cm" },
					{ name: "Millimeters", value: "mm" },
					{ name: "Miles", value: "mi" },
					{ name: "Yards", value: "yd" },
					{ name: "Feet", value: "ft" },
					{ name: "Inches", value: "in" },
					{ name: "Acres", value: "ac" },
					{ name: "Hectares", value: "ha" },
					{ name: "Grams", value: "g" },
					{ name: "Kilograms", value: "kg" },
					{ name: "Milligrams", value: "mg" },
					{ name: "Pounds", value: "lb" },
					{ name: "Ounces", value: "oz" },
					{ name: "Bushels", value: "bu" },
					{ name: "Celsius", value: "c" },
					{ name: "Fahrenheit", value: "f" },
					{ name: "Kelvin", value: "k" }
				)
		),

  	async execute(interaction) {
		const amount = interaction.options.getNumber("amount");
		const from = interaction.options.getString("from");
		const to = interaction.options.getString("to");

		try {
			if (from === to) {
				return interaction.reply({
					content: ":x: The source and target units are the same.",
					flags: MessageFlags.Ephemeral,
				});
			}

			const result = convertUnit(amount, from, to);
			const rounded = Number(result.toFixed(6));

			const embed = new EmbedBuilder()
				.setTitle("Unit Conversion")
				.addFields(
					{
						name: "Input",
						value: `\`${amount} ${from}\``,
						inline: true,
					},
					{
						name: "Output",
						value: `\`${rounded} ${to}\``,
						inline: true,
					}
				)
				.setColor(process.env.COLOR_BLUE)
				.setFooter({ text: process.env.EMBED_FOOTER })
				.setTimestamp();

			await interaction.reply({ 
				embeds: [embed] 
			});
		} catch (error) {
			await interaction.reply({
				content: `:x: ${error.message}`,
				flags: MessageFlags.Ephemeral,
			});
		}
  	},
};