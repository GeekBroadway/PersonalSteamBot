//Packages
var Steam = require('steam');
var SteamTotp = require('steam-totp');
var SteamUser = require('steam-user');
var TradeOfferManager = require('steam-tradeoffer-manager');
var SteamCommunity = require('steamcommunity');
var Winston = require('winston');
var fs = require('fs');
//Configs
var config = require('./config/config.js');
//node-steam setup
var steamUser = new SteamUser();
//Package Setup
var logger = new (Winston.Logger)({
    levels: {
        'debug': -2,
        'info': -1,
        'setup': 0,
        'trade': 1,
        'error': 2
    },
    colors: {
        'debug': 'grey',
        'info': 'green',
        'setup': 'cyan',
        'trade': 'yellow',
        'error': 'red'

    },
    transports: [
        new (Winston.transports.Console)({level:'error',colorize: true})
    ]
});
SteamTotp.generateAuthCode(config.escrow.shared_secret, function(err, code) {
    if (err) {
        logger.error("[totp] "+err.stack);
    } else {
        logger.setup("SteamGuard Code: " + code);
        doSetup(code);
    }
});
var community = new SteamCommunity();
var manager = new TradeOfferManager({
    "steam": steamUser,
    "community": community,
    "domain": "geekbroadway.com",
    "language": "en"
});

//start Login
function doSetup(code) {
    var loginObject = {
        accountName: config.account.username,
        password: config.account.password,
        twoFactorCode: code
    };
    steamUser.logOn(loginObject);
    community.chatLogon();
    steamUser.on('loggedOn', function (details) {
        logger.setup("Logged into Steam as " + steamUser.steamID.getSteam3RenderedID());
        steamUser.setPersona(SteamUser.EPersonaState.Online);
        steamUser.gamesPlayed(440);
    });
    steamUser.on('webSession', function(sessionID, cookies) {
       logger.setup("Got webSession: Starting Trade setup");
       manager.setCookies(cookies, function(err) {
            if (err) {
                logger.error('[cookie] '+err.stack);
                process.exit(1); // Fatal error since we couldn't get our API key
            }
            logger.setup("Got API key: " + manager.apiKey);
        });
        community.setCookies(cookies);
        community.startConfirmationChecker(config.bot.checkTradeOffers, config.escrow.identy_secret);
    });
    community.on('chatLoggedOn',function(){
        logger.setup("Logged into SteamChat");
        main()
    });
    steamUser.on('error', function (e) {
        logger.error('[steam_login]'+e.stack);
        process.exit(1);
    });

}
//Main bot logic
function main() {
    logger.info("Ready to trade!");
    backpack = {};
    function refreshBackpack() {
        manager.getInventoryContents(440, 2, true, function (err, inventory, currency, count) {
            backpack.inventory = inventory;
            backpack.count = count;
            logger.info("TF2 backpack refreshed")
        });
    }
    refreshBackpack();
    manager.on('newOffer', function(offer) {
        logger.trade("New Offer: "+offer.id+", from: "+offer.partner.getSteam3RenderedID());
        if(isAdmin(offer.partner.getSteam3RenderedID())) {
            offer.accept(function(err){
                if(err) {
                    logger.error(err);
                } else {
                    logger.trade("Trade is from an admin, accepting");
                    community.checkConfirmations();
                }
            });
        } else {
            doNonAdminTrade(offer, function(err, tradeerr) {
                if (err) {
                    logger.error(err);
                } else if (tradeerr){
                    logger.trade("TradeError:"+tradeerr);
                }
            });
        }
    });
    manager.on('receivedOfferChanged', function(offer, oldState) {
        logger.trade(`Offer #${offer.id} changed: ${TradeOfferManager.ETradeOfferState[oldState]} -> ${TradeOfferManager.ETradeOfferState[offer.state]}`);

        if (offer.state == TradeOfferManager.ETradeOfferState.Accepted) {
            offer.getReceivedItems(function(err, items) {
                if (err) {
                    logger.error("Couldn't get received items: " + err);
                } else {
                    var names = items.map(function(item) {
                        return item.name;
                    });

                    logger.trade("Received: " + names.join(', '));
                }
            });
        }
    });
    community.on('chatMessage', function(sender, text){
       logger.debug('received message from ',sender,': ',text);
       if(text == '!currency'){
            let scrap =  backpack.inventory.filter(function(item) { return item.name == 'Scrap Metal';});
            let reclaimed =  backpack.inventory.filter(function(item) { return item.name == 'Reclaimed Metal';});
            let refined =  backpack.inventory.filter(function(item) { return item.name == 'Refined Metal';});
            let keys = backpack.inventory.filter(function(item) { return item.name == 'Mann Co. Supply Crate Key';});
            let formatted_message = "\n Keys: "+keys.length+"\n Refined: "+refined.length+"\n Reclaimed: "+reclaimed.length+"\n Scrap: "+scrap.length
            community.chatMessage(sender, formatted_message, function(err){
                if(err) {
                    logger.error("Error sending response: " + err.error);
                }
            })
       }
       if(text == '!refreshbackpack'){
            refreshBackpack();
           community.chatMessage(sender, "Backpack Updated", function(err){
               if(err) {
                   logger.error("Error sending response: " + err.error);
               }
           })
       }
    });
    function doNonAdminTrade(offer, callback) {
        logger.trade("Trade not from admin or bot, aborting!");
        offer.decline();
        return callback(null, "declined");
    }
    function isAdmin(user) {
        return (config.bot.admins.indexOf(user) > -1 || config.bot.scraptf.indexOf(user) > -1);

    }
}
