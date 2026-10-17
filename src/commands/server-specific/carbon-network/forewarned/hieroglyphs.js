const { 
    SlashCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType
 } = require('discord.js');

const hieroglyphs = {
    A: '𓅂',
    B: '𓃀',
    C: '𓋴',
    D: '𓂧',
    E: '𓇌',
    F: '𓆑',
    G: '𓎼',
    H: '𓎛',
    I: '𓇋',
    J: '𓆓',
    K: '𓎡',
    L: '𓃭',
    M: '𓅓',
    N: '𓈖',
    O: '𓍯',
    P: '𓊪',
    Q: '𓏘',
    R: '𓂋',
    S: '𓈙',
    T: '𓏏',
    U: '𓅱',
    V: '𓆒',
    W: '𓅶',
    X: '𓎢',
    Y: '𓏭',
    Z: '𓋉',
    1: '𓏺',
    10: '𓎆',
    100: '𓍢',
    1000: '𓆼',
    10000: '𓂭',
    100000: '𓆏',
    1000000: '𓁏',
};

module.exports = {
    isDev: false,
    servers: [
        '1203116259693301830', // Carbon Network
    ],
    allowedUsers: null,
    requiredPermissions: null,

    data: new SlashCommandBuilder()
        .setName('hieroglyphs')
        .setDescription('Translate a message into Forewarned hieroglyphs')
        .setIntegrationTypes([
			ApplicationIntegrationType.GuildInstall,
		])
		.setContexts([
			InteractionContextType.Guild,
			InteractionContextType.BotDM,
		])
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Message to translate')
                .setRequired(true)
        ),

    async execute(interaction) {
        const input = interaction.options.getString('message');

        let output = "";
        let i = 0;

        while (i < input.length) {
            let matched = false;

            const multiNumbers = ['1000000', '100000', '10000', '1000', '100', '10'];
            for (const num of multiNumbers) {
                if (input.startsWith(num, i)) {
                    output += hieroglyphs[num];
                    i += num.length;
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                const char = input[i].toUpperCase();
                output += hieroglyphs[char] || char;
                i++;
            }
        }
        
        await interaction.reply(`${output}`);
    },
}