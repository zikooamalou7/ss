/* ********
 * * ********************
 * * * ***********************************
********************************************************* START *********************************************************
NEW CODE Seif Elislam Hanancha

* * * **********************************
* * *******************
* ******

Nodejs Developer

* * * **********************************
* * *******************
* ******

Email: sifouamra@gmail.com
WhatsApp: +213657204823
Telegram: https://t.me/si_yas_mi
Twitter: https://twitter.com/SNamalise

* * * **********************************
* * *******************
* ******/

/* *******
 * ***********
 * ***** Fixed Isssue in All bot code
 * ***********
 * ******* */
const Bot = require('node-telegram-bot-api');
const rp = require('request-promise');
const dotenv = require('dotenv');
var request = require('request');
const fs = require("fs");
dotenv.config();

const rootUrl = 'https://1xbet.com/LiveFeed';
const action = {
  games: '/BestGamesExtZip',
  game: '/GetGameZip',
};

const state = {
  0: 'не началась',
  1: 'ход игока',
  2: 'ход дилера',
  3: 'победа игрока',
  4: 'победа дилера',
};

const activeMsg = {};

const mast = {
  0: '♠️',
  1: '♣️',
  2: '♦️',
  3: '♥️',
};

const cardValue = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};


const gamesConsts = {
  sports: 146,
  count: 100,
  lng: 'ru',
  mode: 4,
  country: 75,
};

const gameConsts = {
  sports: 146,
  cfview: 0,
  isSubGames: true,
  GroupEvents: true,
  allEventsGroupSubGames: true,
  countevents: 250,
  grMode: 2,
};
var KcheckNbMsg = 0;
var QcheckNbMsg = 0;
var JcheckNbMsg = 0;
var KLatter = true;
var QLatter = true;
var JLatter = true;
var KLatterTester = false;
var QLatterTester = false;
var JLatterTester = false;
var KLatterTesterSender = false;
var QLatterTesterSender = false;
var JLatterTesterSender = false;
var CheckLastMessage = -1;
const telegramToken = checkEnvironments('TELEGRAM_TOKEN');
const bot = new Bot(telegramToken, { polling: true });
const tSubscryber = checkEnvironments('TELEGRAM_CHANNEL');
const tSubscryberChekingError = checkEnvironments('TELEGRAM_CHANNEL_WRONG');
// Бытует мнение, что эти комбинации, сулят скорый выйгрыш, сам не уверен.
/*
function signals(cart, game, sp){
  let signal = false;
  let signalMsg = `[${game}] Сигнал: `;
  if (sp) {
    signal = true;
    signalMsg += '6♠️';
  }
  if (cart[14] && cart[14] >= 2) {
    signal = true;
    signalMsg += 'ТУЗ,ТУЗ; ';
  }
  if (cart[6]) {
    if(!!cart[8]){
      signal = true;
      signalMsg += '6,8; ';
    }
    if(!!cart[7] && !!cart[12]){
      signal = true;
      signalMsg += '6,7,ДАМА; ';
    }
  }
  if (!!cart[10] && !!cart[13]) {
    signal = true;
    signalMsg += 'король,10; ';
  }
  if (signal) sendMessage(signalMsg);
}*/

async function checkGamesData(games){
  const game = await checkGame(games.I);
  if (!game) return null;
  const gameObject = JSON.parse(game);
  //console.log(gameObject)
  if (gameObject.Value) {
    const state = gameObject.Value.SC.S[2].Value;
    if (['3','4','5'].includes(state)) {
      const P1 = JSON.parse(gameObject.Value.SC.S[0].Value);
      const P2 = JSON.parse(gameObject.Value.SC.S[1].Value);
      var P1text ='';
      let P2text ='';
      let endPhrase = '';
      if (P1.length === 2 && P2.length === 2){
        endPhrase = '#R ';
        if (P1[0].CV === P1[1].CV && P1[1].CV === 14) endPhrase += '#G ';
        if (P2[0].CV === P2[1].CV && P2[1].CV === 14) endPhrase += '#G ';
      }
      const carts = {};
      var sp = false;
      for (let index = 0; index < P1.length; index++) {
        const card = P1[index];
        P1text += `${cardValue[card.CV]}${mast[card.CS]}`;
        if (!sp) sp = card.CV === 6 && card.CS === 0;
        carts[card.CV] = carts[card.CV]
          ? carts[card.CV] += 1 : carts[card.CV] = 1;
      }

      /*console.log("/***** Start P1text ******** /")
      console.log(P1text)
      console.log("/***** End P1text ******** /")*/
      for (let index = 0; index < P2.length; index++) {
        const card = P2[index];
        P2text += `${cardValue[card.CV]}${mast[card.CS]}`;
        if (!sp) sp = card.CV === 6 && card.CS === 0;
        carts[card.CV] = carts[card.CV]
          ? carts[card.CV] += 1 : carts[card.CV] = 1;
      }
      if (gameObject.Value.SC.FS.S1 === gameObject.Value.SC.FS.S2) {
        endPhrase += '#N';
      }
     // console.log(gameObject)
     const msg = `[${gameObject.Value.DI}]: ${gameObject.Value.SC.FS.S1}:(${P1text})`;// - ${gameObject.Value.SC.FS.S2}:(${P2text})${endPhrase}
     /* console.log('/** Before ** /')
      console.log(msg.length);
      console.log(msg);
      console.log('/** Before ** /')*/
      if (activeMsg[gameObject.Value.DI] && activeMsg[gameObject.Value.DI].sended) {
        if (activeMsg[gameObject.Value.DI].msg !== msg) {
         // signals(carts, gameObject.Value.DI, sp);
         await editMessage(msg, activeMsg[gameObject.Value.DI]);
          delete activeMsg[gameObject.Value.DI];
        }
        return null;
      }
      if (activeMsg[gameObject.Value.DI] && !activeMsg[gameObject.Value.DI].sended) {
        if (!activeMsg[gameObject.Value.DI].msg || activeMsg[gameObject.Value.DI].msg !== msg) {
        //  signals(carts, gameObject.Value.DI, sp);
      //  onsole.log("gameObject.Value.SC.TS", gameObject.Value.SC.TS)
        //  && (gameObject.Value.SC.TS === 25 || ameObject.Value.SC.TS === 25)
        if(gameObject.Value.DI !== CheckLastMessage) {
          CheckLastMessage = gameObject.Value.DI;
        /* console.log(gameObject)
           console.log('/** Before ** /')
           console.log(msg.length)
           console.log(msg)
           console.log('/** Before ** /')*/
           await sendMessage(msg);
           await checkLettersQJK(msg);
           
           //await checkLettersQJK(msg);
          // await testMsg(msg);
          /* console.log('/** 1-2 ** /')
           console.log(msg.length)
           console.log(msg)
           console.log('/** 1-2 ** /')*/
         //  await checkLettersQJK(msg)
        } else {
          CheckLastMessage = gameObject.Value.DI;
        }
          
          delete activeMsg[gameObject.Value.DI];
        }
        return null;
      }
    } else if (['1','2'].includes(state)) {
      const P1 = JSON.parse(gameObject.Value.SC.S[0].Value);
      const P2 = JSON.parse(gameObject.Value.SC.S[1].Value);
      var P1text ='';
      let P2text ='';
      for (let index = 0; index < P1.length; index++) {
        const card = P1[index];
        P1text += `${cardValue[card.CV]}${mast[card.CS]}`;
      }
     for (let index = 0; index < P2.length; index++) {
        const card = P2[index];
        P2text += `${cardValue[card.CV]}${mast[card.CS]}`;
      }
      const msg = `⏱[${gameObject.Value.DI}]: ${gameObject.Value.SC.FS.S1}:(${P1text}))`;// - ${gameObject.Value.SC.FS.S2}:(${P2text}
      /*********************************
       * 
       * New code
       */
      /*
        console.log('/** Before ** /')
        console.log(msg.length);
        console.log(msg);
        console.log('/** Before ** /')
      */
     
      if (
        activeMsg[gameObject.Value.DI]
          && !activeMsg[gameObject.Value.DI].locked
          && !activeMsg[gameObject.Value.DI].sended
        ) {
        activeMsg[gameObject.Value.DI] = {
          sended: true,
          msg,
          locked: true,
        };
  //  console.log("gameObject.Value.SC.TS: ", gameObject.Value.SC.TS)
        //&& (gameObject.Value.SC.TS === 23 || gameObject.Value.SC.TS === 28 || gameObject.Value.SC.TS === 26)
        if(gameObject.Value.DI !== CheckLastMessage) {
          CheckLastMessage = gameObject.Value.DI;
         /* console.log('/** Before ** /')
          console.log(msg.length)
          console.log(msg)
          console.log('/** Before ** /')
          chat = await sendMessage(msg);
          console.log('/**************************************************** Before ** /')
          console.log(chat)
          console.log('/**************************************************** Before ** /')*/
         // await testMsg(msg);
         chat = await sendMessage(msg);
        // await checkLettersQJK(msg);
        } else {
          CheckLastMessage = gameObject.Value.DI;
        }
        return activeMsg[gameObject.Value.DI] = {
          sended: true,
          msg,
          locked: false,
          ...chat,
        };
      }
      
      if (
        activeMsg[gameObject.Value.DI]
          && !activeMsg[gameObject.Value.DI].locked
          && activeMsg[gameObject.Value.DI].sended) {
        if (activeMsg[gameObject.Value.DI].msg === msg) return;
        await editMessage(msg, activeMsg[gameObject.Value.DI]);
        return activeMsg[gameObject.Value.DI] = {
          ...activeMsg[gameObject.Value.DI],
          sended: true,
          msg,
          locked: false,
        };
      }
    } else if (state === '0') {
      if (!!activeMsg[gameObject.Value.DI] ) return;
      activeMsg[gameObject.Value.DI] = {
        sended: false,
        msg: ''
      };
      // ToDo новая игра
    } else {
     // console.log(state, JSON.stringify(state));
    }
  }
}

async function checkGame(id) {
  try {
    return await rp.get({
      uri: `${rootUrl}${action.game}`,
      qs: { id ,...gameConsts },
      timeout: 150,
    });
  } catch (err) {
    if (err.cause.code === 'ECONNREFUSED') return null;
  }
}

async function checkGames(){
  try {
    return await rp.get({
      uri: `${rootUrl}${action.games}`,
      qs: { ...gamesConsts },
      timeout: 150,
    });    
  } catch (err) {
    if (err.cause.code === 'ECONNREFUSED') return null;
  }
}

async function getGames(){
  const games = await checkGames();
  if (!games) return null;
  try {
    const gamesObject = JSON.parse(games);
    if (
        gamesObject
        && gamesObject.Value
        && gamesObject.Value.length
        && gamesObject.Value.length > 0
      ){
      for (let element of gamesObject.Value) {
        await checkGamesData(element);
      }
    }
  } catch (error) {
    sendError(error);
    return 0;
  }
}

async function startCheck() {
  setInterval(async () => { 
   // await sendMessage('[2]: 23:(J♠️7♥️K♠️10♦️)');
   await getGames();
   await startCheckNewCommandAdmin();
  }, 4000);
  /* let all = [
     "K",
     "Q",
     "A",
     "A",
     "J",
     "A Q",
     "A",
     "A",
     "K",
     "J",
     "Q J K",
     "Q",
     "Q",
     "Q J K",
     "Q A K",
     "A",
     "A",
     "A",
     "Q",
     "Q A j",
   ]
   for(let a of all) {
   await sendMessage(a);
   }*/
 }
 
async function sendError(err) {
 //   console.log('Send error: ' +  err);
}

async function sendMessage(msg) {
 try {
 /* console.log('/** 1 ** /')
  console.log(msg.length)
  console.log(msg)
  console.log('/** 1 ** /')
  await checkLettersQJK(msg)*/
  console.log('/** 1-1 ** /')
  console.log(msg.length)
  console.log(msg)
  console.log('/** 1-1 ** /')
 var sendMsg = await bot.sendMessage(tSubscryber, msg);
 
  return sendMsg;
 } catch(e) {
  // console.log(e)
 }
}

async function editMessage(msg, chat) {
    return await bot.editMessageText(msg, { ...chat, chat_id: chat.chat.id, message_id: chat.message_id });
}

function checkEnvironments(key) {
  if (process.env[key]) return process.env[key];
  console.error(`Please, set ${key} environment variable`);
  process.exit(1);
}
/* ********
 * * ********************
 * * * ***********************************
********************************************************* START *********************************************************
NEW CODE Seif Elislam Hanancha

* * * **********************************
* * *******************
* ******

Nodejs Developer

* * * **********************************
* * *******************
* ******

Email: sifouamra@gmail.com
WhatsApp: +213657204823
Telegram: https://t.me/si_yas_mi
Twitter: https://twitter.com/SNamalise

* * * **********************************
* * *******************
* ******/
async function startCheckNewCommandAdmin() {
  //setInterval(async () => {
   var options = {
     'method': 'GET',
     'url': `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getUpdates`,
     'headers': {
     }
   };
  try {
   await request(options,async (error, response) => {
     if (error) throw new Error(error);
  //   console.log(response.body)
     const msgObject = JSON.parse(response.body);
     if(msgObject.ok && msgObject.result.length !== 0 && !msgObject.result[0].message.from.is_bot && msgObject.result[0].message.chat.id === parseInt(process.env.TELEGRAM_ADMIN_ID, 10)) {
         await updateAttributeEnv('.env',"TELEGRAM_NUMBER_MSG", msgObject.result[0].message.text);
     }
   });
  } catch(e) {
  // console.log(e);
  }
  // }, 2000);
 }

var updateAttributeEnv = function(envPath, attrName, newVal){
  var dataArray = fs.readFileSync(envPath,'utf8').split('\n');
  var replacedArray = dataArray.map((line) => {
      if (line.split('=')[0] == attrName){
          return attrName + "=" + String(newVal);
      } else {
          return line;
      }
  })

  fs.writeFileSync(envPath, "");
  for (let i = 0; i < replacedArray.length; i++) {
      fs.appendFileSync(envPath, replacedArray[i] + "\n"); 
  }
}
async function checkLettersQJK(msg) {
 try {
  console.log('/** 2 **/')
  console.log(msg.length)
  console.log(msg)
  console.log('/** 2 **/')
  for (var i = 0; i < msg.length; i++) {
    if (
      new String(msg.charAt(i)).valueOf() == new String('Q').valueOf() ||
      new String(msg.charAt(i)).valueOf() == new String('q').valueOf() 
    ) {
      QLatter = true;
      QLatterTester = true;
      QcheckNbMsg = 0;
    }
    else {
      QLatter = false;
    }
     if (
      new String(msg.charAt(i)).valueOf() == new String('k').valueOf() ||
      new String(msg.charAt(i)).valueOf() == new String('K').valueOf() 
    ) {
      KLatter = true;
      KLatterTester = true;
      KcheckNbMsg = 0;
    } 
    else {
      KLatter = false;
    }
     if (
      new String(msg.charAt(i)).valueOf() == new String('J').valueOf() ||
      new String(msg.charAt(i)).valueOf() == new String('j').valueOf() 
    ) {
      JLatter = true;
      JLatterTester = true;
      JcheckNbMsg = 0;
    }
    else {
      JLatter = false;
    }
  }
  var msgToWrongChannel = '';
  /*console.log(!QLatter);
  console.log(QLatterTester);
  console.log(QcheckNbMsg);*/
  if(!QLatter && QLatterTester && QcheckNbMsg === parseInt(process.env.TELEGRAM_NUMBER_MSG, 10)) {
    QLatterTesterSender = true;
    msgToWrongChannel += 'Q';
   } else if(QLatterTester){
    QcheckNbMsg++;
   }
  if(!JLatter && JLatterTester && JcheckNbMsg === parseInt(process.env.TELEGRAM_NUMBER_MSG, 10)) {
    JLatterTesterSender = true;
    msgToWrongChannel += ' J';
   } else if(JLatterTester){
    JcheckNbMsg++;
   }
   if(!KLatter && KLatterTester && KcheckNbMsg === parseInt(process.env.TELEGRAM_NUMBER_MSG, 10)) {
    KLatterTesterSender = true;
    msgToWrongChannel += ' K';
   } else if( KLatterTester){
    KcheckNbMsg++;
   }
   msgToWrongChannel += '.. Not Found 😭😭';
   
 if(KLatterTesterSender) {
    KLatterTesterSender = false;
    KLatterTester = false;
    KcheckNbMsg = 0;
    if (QLatterTesterSender) {
      QLatterTesterSender = false;
      QcheckNbMsg = 0;
      QLatterTester = false;
     }
      if(JLatterTesterSender) {
      JLatterTesterSender = false;
      JcheckNbMsg = 0;
      JLatterTester = false;
     }
    await sendMsgToErrorCheckingChannel(msgToWrongChannel);
   } else if (QLatterTesterSender) {
    QLatterTesterSender = false;
    QcheckNbMsg = 0;
    QLatterTester = false;
    
   if(KLatterTesterSender) {
      KLatterTesterSender = false;
      KLatterTester = false;
      KcheckNbMsg = 0;
    }
    if(JLatterTesterSender) {
      JLatterTesterSender = false;
      JcheckNbMsg = 0;
      JLatterTester = false;
     }
    await sendMsgToErrorCheckingChannel(msgToWrongChannel);
   }  else if(JLatterTesterSender) {
    JLatterTesterSender = false;
    JcheckNbMsg = 0;
    JLatterTester = false;
    if(KLatterTesterSender) {
      KLatterTesterSender = false;
      KLatterTester = false;
      KcheckNbMsg = 0;
    }
    if (QLatterTesterSender) {
      QLatterTesterSender = false;
      QcheckNbMsg = 0;
      QLatterTester = false;
     }
    await sendMsgToErrorCheckingChannel(msgToWrongChannel);
   }
 /* console.log('/********* JLatter ********* /')
  console.log(JLatter);
  console.log('/********* JLatterTester ********* /')
  console.log(JLatterTester);
  console.log('/********* JcheckNbMsg ********* /')
  console.log(JcheckNbMsg);
  console.log('/********* QLatter ********* /')*/
  /*console.log(QLatter);
  console.log('/********* QLatterTester ********* /')
  console.log(QLatterTester);
  console.log('/********* QcheckNbMsg ********* /')
  console.log(QcheckNbMsg);*/
 /* console.log('/********* KLatter ********* /')
  console.log(KLatter);
  console.log('/********* KLatterTester ********* /')
  console.log(KLatterTester);
  console.log('/********* KcheckNbMsg ********* /')
  console.log(KcheckNbMsg);
  console.log('/********* msgToWrongChannel ********* /')*/
 // console.log(msgToWrongChannel);
 } catch(e) {
  // console.log(e)
 }
}
async function sendMsgToErrorCheckingChannel(msg) {
  try {
    return await bot.sendMessage(tSubscryberChekingError, msg);
  }catch(e) {
   // console.log(e)
  }
}

startCheck();

function testMsg(msg) {
  console.log("/************ check *******************/");
  console.log(msg)
  console.log("/************ check *******************/");
}