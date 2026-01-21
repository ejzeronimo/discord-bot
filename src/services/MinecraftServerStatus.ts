import { ActivityType, APIEmbedField, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import { Command, MinecraftUser, ServerConfig, ServerInfo } from "../CustomTypes";
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = "https://api.mcstatus.io/v2";

var serverList: ServerConfig[] = JSON.parse(process.env.MINECRAFT_SERVER_LIST ?? "");
var minecraftQuery: NodeJS.Timeout;
var channelId = process.env.MINECRAFT_CHANNEL_ID;
var messageId = process.env.MINECRAFT_MESSAGE_ID;

function generateEmbed() {
    let servers: APIEmbedField[] = [];

    // loop through servers
    for (let idx = 0; idx < serverList.length; idx++) {
        servers.push({
            name: serverList[idx].name,
            value: `${serverList[idx].playerCount} player${serverList[idx].playerCount != 1 ? "s" : ""}`,
            inline: true,
        });
    }

    let playerList: MinecraftUser[] = []
    for (let idx = 0; idx < serverList.length; idx++) {
        playerList = [...playerList, ...(serverList[idx].players ?? [])];
    }

    if (playerList.length > 0) {
        servers.push({
            name: "Players",
            value: playerList.map(player => player.name_clean).join("\n"),
            inline: false
        });
    }

    // generate embed
    return new EmbedBuilder()
        .setTitle("Minecraft Servers")
        .setColor("#1f8b4c")
        .setDescription("Updates every minute, and gathers data from all servers")
        // .setThumbnail("https://github.com/ejzeronimo/discord-bot/blob/feature/ez/dev/assets/upscaled.png?raw=true")
        .addFields(servers);
}

export async function checkMinecraftServerStatus(bot: Client) {
    let totalPlayerCount = 0;

    // loop through servers
    for (let idx = 0; idx < serverList.length; idx++) {
        serverList[idx].playerCount = 0;

        try {
            const response = await fetch(baseUrl + "/status/java/" + serverList[idx].ip);
            if (!response.ok) {
                // failure to get data
            }

            const result = await response.json() as ServerInfo;

            serverList[idx].playerCount = result.players.online;
            serverList[idx].players = result.players.list;
        } catch {
            console.log("failed to check mc server");
        }

        totalPlayerCount += serverList[idx].playerCount ?? 0;
    }

    // change status if we have players
    if (totalPlayerCount > 0) {
        bot.user?.setPresence({
            activities: [{
                name: `${totalPlayerCount} player${totalPlayerCount != 1 ? "s" : ""} in Minecraft`,
                type: ActivityType.Custom,
            }],
            status: "online",
        });
    } else {
        bot.user?.setPresence({
            activities: [],
            status: "online",
        });
    }

    // edit pinned message
    if (channelId && messageId) {
        let channel = (await bot.channels.fetch(channelId) as TextChannel);
        let message = await channel?.messages.fetch(messageId);

        await message.edit({ embeds: [generateEmbed()] });
    }
}

export default function startMinecraftService(bot: Client) {
    minecraftQuery = setInterval(async () => {
        console.log("checking mc status...");

        await checkMinecraftServerStatus(bot);
    }, 60 * 1000);

    return function () {
        clearInterval(minecraftQuery);
    }
}

const minecraft: Command = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Create a minecraft status message")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction) {
        channelId = interaction.channelId;
        messageId = (await (await interaction.client.channels.fetch(channelId) as TextChannel).send({ embeds: [generateEmbed()] })).id;
    },
};

export { minecraft };