import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js'

export type Command = {
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
    execute(interaction: ChatInputCommandInteraction): Promise<void>
}

export type ServerInfo = {
    online: boolean,
    players: {
        max: number,
        online: number,
        list: MinecraftUser[]
    }
}

export type ServerConfig = {
    name: string, 
    ip: string,
    port?: number,
    playerCount?: number,
    players?: MinecraftUser[]
}

export type MinecraftUser = {
    uuid: string, 
    name_raw: string,
    name_clean: string,
    name_html: string
}