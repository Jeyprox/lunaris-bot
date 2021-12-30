"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const applicationRole = "924370022414053436";
const applicationChannel = "924137050100338708";
const citizenRole = "867441845306785872";
const guildColor = "#0c5fb0";
const guildId = "867376142334951445";
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
client.once("ready", () => {
    console.log("bot online");
    const guild = client.guilds.cache.get(guildId);
    if (!guild)
        return;
    let commands = guild.commands;
    commands.create({
        name: "verify",
        description: "Verify your Discord name for the application process",
    });
});
client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand())
        return;
    const { commandName, user } = interaction;
    if (commandName === "verify") {
        const verifyButton = new discord_js_1.MessageButton()
            .setCustomId("verify")
            .setLabel("Verify")
            .setStyle("PRIMARY");
        const verificationRow = new discord_js_1.MessageActionRow().addComponents(verifyButton);
        const verificationEmbed = new discord_js_1.MessageEmbed()
            .setColor(guildColor)
            .setTitle("Discord Verification")
            .setAuthor(`${user.username}#${user.discriminator}`, `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`)
            .setDescription("Please verify your discord name for the application process")
            .setFooter("Remember to click the verify button on the website again")
            .setTimestamp();
        yield interaction.reply({
            ephemeral: true,
            components: [verificationRow],
            embeds: [verificationEmbed],
        });
        const filter = (buttonInteraction) => interaction.user.id === buttonInteraction.user.id;
        if (!interaction.channel)
            return;
        const collector = interaction.channel.createMessageComponentCollector({
            componentType: "BUTTON",
            filter,
            max: 1,
            time: 1000 * 15,
        });
        collector.on("end", (collected) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            if (collected.first() && ((_a = collected.first()) === null || _a === void 0 ? void 0 : _a.customId) === "verify") {
                const btnInteraction = collected.first();
                const member = yield ((_b = btnInteraction === null || btnInteraction === void 0 ? void 0 : btnInteraction.guild) === null || _b === void 0 ? void 0 : _b.members.fetch(btnInteraction.user.id));
                yield (member === null || member === void 0 ? void 0 : member.roles.add(applicationRole));
                btnInteraction === null || btnInteraction === void 0 ? void 0 : btnInteraction.reply({
                    content: "You successfully verified your discord name for the application\nPlease return to the website and click on the validate button once more",
                    ephemeral: true,
                });
            }
            yield interaction.editReply({
                content: "The application time has run out\nIf you need, restart the process on the website",
                components: [],
            });
        }));
    }
}));
client.on("messageReactionAdd", (reaction, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (reaction.partial) {
        try {
            yield reaction.fetch();
        }
        catch (error) {
            console.error("Something went wrong when fetching the message:", error);
            return;
        }
    }
    if (user.bot || reaction.message.channelId !== applicationChannel)
        return;
    if (reaction.emoji.name === "✅") {
        const guild = reaction.message.guild;
        const applicant = reaction.message.embeds[0].author;
        // const match = await fetchUserByName(applicant.name);
        const memberList = yield guild.members.search({
            query: applicant.name.slice(0, -5),
            cache: true,
        });
        const match = memberList.find(({ user }) => `${user.username}#${user.discriminator}` === applicant.name);
        if (match) {
            const member = yield guild.members.fetch(match.user.id);
            member.roles.add(citizenRole);
            member.roles.remove(applicationRole);
        }
    }
}));
client.login(process.env.BOT_TOKEN);
