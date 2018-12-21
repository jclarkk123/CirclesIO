// start discord.js init
const config = require("./enmap.json"); // See config.json below for example
const Discord = require("discord.js"); // Code below supports and is tested under "stable" 11.3.x
const client = new Discord.Client();
// end discord.js init

// Initialize **or load** the server configurations
const Enmap = require('enmap');

// I attach settings to client to allow for modular bot setups
// In this example we'll leverage fetchAll:false and autoFetch:true for
// best efficiency in memory usage. We also have to use cloneLevel:'deep'
// to avoid our values to be "reference" to the default settings.
// The explanation for why is complex - just go with it.
client.settings = new Enmap({
  name: "settings",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});

const defaultSettings = {	
  prefix: "!",	
  modLogChannel: "mod-log",	
  modRole: "Moderator",	
  adminRole: "Administrator",	
  welcomeChannel: "welcome",	
  welcomeMessage: "Say hello to {{user}}, everyone! We all need a warm welcome sometimes :D"	
}

client.on("guildDelete", guild => {
  // Removing an element uses `delete(key)`
  client.settings.delete(guild.id);
});

client.on("guildMemberAdd", member => {
  // This executes when a member joins, so let's welcome them!
  
  // First, ensure the settings exist
  client.settings.ensure(member.guild.id, defaultSettings);
  
  // First, get the welcome message using get: 
  let welcomeMessage = client.settings.get(member.guild.id, "welcomeMessage");
  
  // Our welcome message has a bit of a placeholder, let's fix that:
  welcomeMessage = welcomeMessage.replace("{{user}}", member.user.tag)
  
  // we'll send to the welcome channel.
  member.guild.channels
    .find("name", client.settings.get(member.guild.id, "welcomeChannel"))
    .send(welcomeMessage)
    .catch(console.error);
});
   
// Nowe let's get to the commands!
// This runs on every message we'll use it to demonstrate loading and changing values
client.on("message", async (message) => {
  // This stops if it's not a guild (obviously), and we ignore all bots.
  if(!message.guild || message.author.bot) return;

  // We can use ensure() to actually grab the default value for settings,
  // if the key doesn't already exist. 
  const guildConf = client.settings.ensure(message.guild.id, defaultSettings);
  
  // We also stop processing if the message does not start with our prefix.
  if(message.content.indexOf(guildConf.prefix) !== 0) return;

  //Then we use the config prefix to get our arguments and command:
  const args = message.content.split(/\s+/g);
  const command = args.shift().slice(guildConf.prefix.length).toLowerCase();
  
  // Alright. Let's make a command! This one changes the value of any key
  // in the configuration.
  if(command === "setconf") {
    // Command is admin only, let's grab the admin value: 
    const adminRole = message.guild.roles.find("name", guildConf.adminRole);
    if(!adminRole) return message.reply("Administrator Role Not Found");
    
    // Then we'll exit if the user is not admin
    if(!message.member.roles.has(adminRole.id)) {
      return message.reply("You're not an admin, sorry!");
    }
    
    // Let's get our key and value from the arguments. 
    // This is array destructuring, by the way. 
    const [prop, ...value] = args;
    // Example: 
    // prop: "prefix"
    // value: ["+"]
    // (yes it's an array, we join it further down!)
    
    // We can check that the key exists to avoid having multiple useless, 
    // unused keys in the config:
    if(!client.settings.has(message.guild.id, prop)) {
      return message.reply("This key is not in the configuration.");
    }
    
    // Now we can finally change the value. Here we only have strings for values 
    // so we won't bother trying to make sure it's the right type and such. 
    client.settings.set(message.guild.id, value.join(" "), prop);
    
    // We can confirm everything's done to the client.
    message.channel.send(`Guild configuration item ${prop} has been changed to:\n\`${value.join(" ")}\``);
  }
  
  // Now let's make another command that shows the configuration items.
  if(command === "showconf") {
    let configProps = Object.keys(guildConf).map(prop => {
      return `${prop}  :  ${guildConf[prop]}\n`;
    });
    message.channel.send(`The following are the server's current configuration:
    \`\`\`${configProps}\`\`\``);
  }
});

// Start the bot by logging it in.
client.login(config.token);