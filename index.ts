import {
  ButtonInteraction,
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";

const applicationRole = "924370022414053436";
const applicationChannel = "924137050100338708";
const citizenRole = "867441845306785872";
const guildColor = "#0c5fb0";
const guildId = "867376142334951445";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.once("ready", () => {
  console.log("bot online");

  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;
  let commands = guild.commands;

  commands.create({
    name: "verify",
    description: "Verify your Discord name for the application process",
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, user } = interaction;

  if (commandName === "verify") {
    const verifyButton = new MessageButton()
      .setCustomId("verify")
      .setLabel("Verify")
      .setStyle("PRIMARY");
    const verificationRow = new MessageActionRow().addComponents(verifyButton);
    const verificationEmbed = new MessageEmbed()
      .setColor(guildColor)
      .setTitle("Discord Verification")
      .setAuthor(
        `${user.username}#${user.discriminator}`,
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      )
      .setDescription(
        "Please verify your discord name for the application process"
      )
      .setFooter("Remember to click the verify button on the website again")
      .setTimestamp();
    await interaction.reply({
      ephemeral: true,
      components: [verificationRow],
      embeds: [verificationEmbed],
    });

    const filter = (buttonInteraction: ButtonInteraction) =>
      interaction.user.id === buttonInteraction.user.id;
    if (!interaction.channel) return;
    const collector = interaction.channel.createMessageComponentCollector({
      componentType: "BUTTON",
      filter,
      max: 1,
      time: 1000 * 15,
    });

    collector.on("end", async (collected) => {
      if (collected.first() && collected.first()?.customId === "verify") {
        const btnInteraction = collected.first();
        const member = await btnInteraction?.guild?.members.fetch(
          btnInteraction.user.id
        );
        await member?.roles.add(applicationRole);
        btnInteraction?.reply({
          content:
            "You successfully verified your discord name for the application\nPlease return to the website and click on the validate button once more",
          ephemeral: true,
        });
      }
      await interaction.editReply({
        content:
          "The application time has run out\nIf you need, restart the process on the website",
        components: [],
      });
    });
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      return;
    }
  }

  if (user.bot || reaction.message.channelId !== applicationChannel) return;
  if (reaction.emoji.name === "✅") {
    const guild = reaction.message.guild;
    const applicant = reaction.message.embeds[0].author;

    // const match = await fetchUserByName(applicant.name);
    const memberList = await guild.members.search({
      query: applicant.name.slice(0, -5),
      cache: true,
    });
    const match = memberList.find(
      ({ user }) => `${user.username}#${user.discriminator}` === applicant.name
    );

    if (match) {
      const member = await guild.members.fetch(match.user.id);
      member.roles.add(citizenRole);
      member.roles.remove(applicationRole);
    }
  }
});

client.login(process.env.BOT_TOKEN);
