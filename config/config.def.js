var config = {};

config.account = {};
config.account.username = "";
config.account.password = "";

config.escrow = {};
config.escrow.shared_secret = "";
config.escrow.identy_secret = "";

config.bot = {};
config.bot.checkTradeOffers = 30000;
config.bot.admins = [
    "Steam3IDHere"
];
config.bot.scraptf = [ //An Array of steamID used by scrap TF bots
    "[U:1:156412256]",
    "[U:1:108209680]",
    "[U:1:90888160]",
    "[U:1:114287492]",
    "[U:1:108309144]",
    "[U:1:156413244]",
    "[U:1:120158970]"
];

module.exports = config;