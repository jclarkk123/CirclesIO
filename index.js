const Discord = require('discord.js');
const config = require('./config.json')
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
const fs = require('fs');
const antispam = require('discord-anti-spam');
const req = require('request');
const package = require('./package.json');

const dns = require('dns');
const sleep = require('system-sleep');
const createHash = require('hash-generator');
const express = require('express');

bot.on("guildMemberAdd", member => {
    const welcomeChannel = member.guild.channels.find(ch => ch.name === 'welcomes');
    var role = member.guild.roles.find("name", "Members")
    let welcomeembed = new Discord.RichEmbed()
    .setColor('#3378e8')
    .setTitle("Welcome Notification")
    .setDescription(`${member} has just joined.`)
    .setFooter(`There are now ${member.guild.memberCount} members.`)
    .setTimestamp()

    welcomeChannel.send(welcomeembed)
    member.addRole(role)
});

bot.on("guildMemberRemove", member => {
    const leaveChannel = member.guild.channels.find(ch => ch.name === 'welcomes');
    let leaveembed = new Discord.RichEmbed()
    .setColor('#3378e8')
    .setTitle('Leave Notification')
    .setDescription(`${member} just left.`)
    .setFooter(`There are now ${member.guild.memberCount} Members.`)
    .setTimestamp()

    leaveChannel.send(leaveembed)

})

bot.on("guildBanRemove", async guild => {
    const leaveChannel = member.guild.channels.find(ch => ch.name === 'welcomes');
    let leaveembed = new Discord.RichEmbed()
    .setColor('#3378e8')
    .setTitle('Leave Notification')
    .setDescription(`${member} just left.`)
    .setFooter(`There are now ${member.guild.memberCount} Members.`)
    .setTimestamp()

    leaveChannel.send(leaveembed)
})

bot.on("guildDelete", async guild => {

})

bot.on("guildCreate", async guild => {

})



antispam(bot, {
    warnBuffer: 3, //Maximum amount of messages allowed to send in the interval time before getting warned.
    maxBuffer: 5, // Maximum amount of messages allowed to send in the interval time before getting banned.
    interval: 1000, // Amount of time in ms users can send a maximum of the maxBuffer variable before getting banned.
    warningMessage: "Hello, don't spam. CirclesIO has a anti-spam features. You'll be banned if you continue.", // Warning message send to the user indicating they are going to fast.
    banMessage: " was banned for spamming. Don't test CirclesIO's anti spam. Would anyone else like a try?", // Ban message, always tags the banned user in front of it.
    maxDuplicatesWarning: 7, // Maximum amount of duplicate messages a user can send in a timespan before getting warned
    maxDuplicatesBan: 10, // Maximum amount of duplicate messages a user can send in a timespan before getting banned
    deleteMessagesAfterBanForPastDays: 7 // Delete the spammed messages after banning for the past x days.
});

  
  bot.on("ready", async () => {
      let index = 0;
    console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`); 
    bot.setInterval(async () => {
        const statuslist = [
            `Serving ${bot.guilds.size} Servers | c!help`,
            `Serving ${bot.guilds.members} Members | c!help`
        ];
        try {
            await bot.user.setActivity(statuslist[index]);
        } catch (error) {
            console.error(error);
        };
        if (index === statuslist.length)
            return index = 0;
        else +index;
    }, 5000); 
  });

  bot.on('message', async message => {

    let msg = message.content.toUpperCase();
    let sender = message.author;
    let args = message.content.slice(config.prefix.length).trim().split(' ');
    let cmd = args.shift().toLowerCase();

    if (!msg.startsWith(config.prefix)) return;
    if (message.author.bot) return;

    try {
        let commandFile = require(`./commands/${cmd}.js`);
        commandFile.run(bot, message, args);
    } catch (e) {
        console.log(e.message);
    } finally {
        console.log(`${message.author.tag} ran the command ${cmd}`);
    }
});

  bot.login(config.token)
  
  