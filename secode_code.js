const Bot = require('node-telegram-bot-api');
const rp = require('request-promise');
const dotenv = require('dotenv');

dotenv.config();

const rootUrl = 'https://1xbet.com/LiveFeed';
const action = {
  games: '/BestGamesExtZip',
  game: '/GetGameZip',
};
var KcheckNbMsg = 0;
var QcheckNbMsg = 0;
var JcheckNbMsg = 0;
var AcheckNbMsg = 0;
var KLatter = false;
var QLatter = false;
var JLatter = false;
var ALatter = false;
var KLatterTester = false;
var QLatterTester = false;
var JLatterTester = false;
var ALatterTester = false;
var KLatterTesterSender = false;
var QLatterTesterSender = false;
var JLatterTesterSender = false;
var ALatterTesterSender = false;
var CheckLastMessage = -1;


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
const cardValueArr = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
]

const cardValueArr2 = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'j',
  'Q',
  'q',
  'K',
  'k',
  'A',
  'a',
]

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

const telegramToken = checkEnvironments('TELEGRAM_TOKEN');
const bot = new Bot(telegramToken, { polling: true });
const tSubscryber = checkEnvironments('TELEGRAM_CHANNEL');
const tSubscryberChekingError = checkEnvironments('TELEGRAM_CHANNEL_WRONG');
// Бытует мнение, что эти комбинации, сулят скорый выйгрыш, сам не уверен.
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
 // if (signal) sendMessage(signalMsg);
}

async function checkGamesData(games){
  const game = await checkGame(games.I);
  if (!game) return null;
  const gameObject = JSON.parse(game);

  if (gameObject.Value) {
    const state = gameObject.Value.SC.S[2].Value;
    if (['3','4','5'].includes(state)) {
      const P1 = JSON.parse(gameObject.Value.SC.S[0].Value);
      const P2 = JSON.parse(gameObject.Value.SC.S[1].Value);
      let P1text ='';
      let P2text ='';
      let endPhrase = '';
      if (P1.length === 2 && P2.length === 2){
        endPhrase = '#R ';
        if (P1[0].CV === P1[1].CV && P1[1].CV === 14) endPhrase += '#G ';
        if (P2[0].CV === P2[1].CV && P2[1].CV === 14) endPhrase += '#G ';
      }
      const carts = {};
      let sp = false;
      for (let index = 0; index < P1.length; index++) {
        const card = P1[index];
        P1text += `${cardValue[card.CV]}${mast[card.CS]}`;
        if (!sp) sp = card.CV === 6 && card.CS === 0;
        carts[card.CV] = carts[card.CV]
          ? carts[card.CV] += 1 : carts[card.CV] = 1;
      }
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
      let msg = `[${gameObject.Value.DI}]: ${gameObject.Value.SC.FS.S1}:(${P1text}) `;//- ${gameObject.Value.SC.FS.S2}:(${P2text})${endPhrase}
      if (activeMsg[gameObject.Value.DI] && activeMsg[gameObject.Value.DI].sended) {
        if (activeMsg[gameObject.Value.DI].msg !== msg) {
          signals(carts, gameObject.Value.DI, sp);
          await editMessage(msg, activeMsg[gameObject.Value.DI]);
          await checkLettersQJK(msg)
         // console.log('/***** msg *****/')
         // console.log(msg)
          //console.log(msg)
         // checkLettersQJK(editMessages)
          delete activeMsg[gameObject.Value.DI];
        }
        return null;
      }
      if (activeMsg[gameObject.Value.DI] && !activeMsg[gameObject.Value.DI].sended) {
        if (!activeMsg[gameObject.Value.DI].msg || activeMsg[gameObject.Value.DI].msg !== msg) {
          signals(carts, gameObject.Value.DI, sp);
          sendMessage(msg);
          delete activeMsg[gameObject.Value.DI];
        }
        return null;
      }
    } else if (['1','2'].includes(state)) {
      const P1 = JSON.parse(gameObject.Value.SC.S[0].Value);
      const P2 = JSON.parse(gameObject.Value.SC.S[1].Value);
      let P1text ='';
      let P2text ='';
      for (let index = 0; index < P1.length; index++) {
        const card = P1[index];
        P1text += `${cardValue[card.CV]}${mast[card.CS]}`;
      }
      for (let index = 0; index < P2.length; index++) {
        const card = P2[index];
        P2text += `${cardValue[card.CV]}${mast[card.CS]}`;
      }
      let msg = `⏱[${gameObject.Value.DI}]: ${gameObject.Value.SC.FS.S1}:(${P1text}) )`; //- ${gameObject.Value.SC.FS.S2}:(${P2text}
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
        chat = await sendMessage(msg);
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
      // await checkLettersQJK(msg)
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

async function test() {
  var arr = [
    '[1]: 23:(8♣️Q♦️6♦️6♣️)',
    '[2]:6 8 A',
    '[3]:7 4 5 1 0 5',
    '[4]:1 1 A 8 2',
  ];
  var arr2 = [
    '[5]:6 1 0 A q 2',
    '[6]:6 8 A',
    '[7]:7 1 0 A',
    '[8]:A A'
  ];
  var arr3 = [
    '[9]:j 9 K 7',
    '[10]:1',
    '[11]:6 k q 6',
    '[12]:1 0 j j 9'
  ];
  for(var i of arr) {
    await checkLettersQJK(i);
  }

  for(var i of arr2) {
    await checkLettersQJK(i);
  }
  for(var i of arr3) {
    await checkLettersQJK(i);
  }
  console.log('Done')
}
//test();
async function startCheck() {
  setInterval(async () => {
  //  await sendMsgToErrorCheckingChannel('555')
  
  await getGames();
  await startCheckNewCommandAdmin()
    
  }, 2000);
}

async function sendError(err) {
    //console.log('Send error: ' +  err);
}

async function sendMessage(msg) {
    return await bot.sendMessage(tSubscryber, msg);
}

async function editMessage(msg, chat) {
    return await bot.editMessageText(msg, { ...chat, chat_id: chat.chat.id, message_id: chat.message_id });
}

function checkEnvironments(key) {
  if (process.env[key]) return process.env[key];
  console.error(`Please, set ${key} environment variable`);
  process.exit(1);
}


async function startCheckNewCommandAdmin() {
  //setInterval(async () => {
   var options = {
     'method': 'GET',
     'url': `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getUpdates`,
     'headers': {
     }
   };
  try {
   // console.log('dfgsd')
   await request(options,async (error, response) => {
     if (error) throw new Error(error);
    
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
      if (line.split('=')[0] === attrName){
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

async function isLater(letter) {
  return await new Promise((resolve, reject) => {
    for(var j = 0; j < cardValueArr2.length; j++) {
        if(letter === cardValueArr2[j]) {
          resolve({
            status: true
          })

        }
    }
    resolve({
      status: false
    })
    
});
}


async function checkLettersQJK(msg) {
  /*
var KcheckNbMsg = 0;
var QcheckNbMsg = 0;
var JcheckNbMsg = 0;
var KLatter = false;
var QLatter = false;
var JLatter = false;
var KLatterTester = false;
var QLatterTester = false;
var JLatterTester = false;
var KLatterTesterSender = false;
var QLatterTesterSender = false;
var JLatterTesterSender = false;
var CheckLastMessage = -1;

  */
  try {
    var QisDone = true;
    var AisDone = true;
    var JisDone = true;
    var KisDone = true;

    var checkLatter = false;
    for(var i = 0; i < msg.length; i++) {
     // for(var j = 0; j < cardValueArr2.length; j++) {
      //  if(msg[i] === cardValueArr2[j]) {
        
        const checkifLater = await isLater(msg[i]).then((rs) => rs)
        
       // console.log('msg[i]')
        if(checkifLater.status) {
        //  console.log(msg[i])
         // console.log('checkifLater.status')
         //  console.log(checkifLater.status)
          if(msg[i] === 'q' || msg[i] === 'Q') {
            QcheckNbMsg = 0;
            QLatterTester = true;
          } else if(QLatterTester && QisDone) {
            QcheckNbMsg++;
            QisDone = false;
           
          }
           if(msg[i] === 'j' || msg[i] === 'J') {
            JcheckNbMsg = 0;
            JLatterTester = true;
          } else if(JLatterTester && JisDone) {
            JisDone = false;
            JcheckNbMsg++;
          
          }
          if(msg[i] === 'a' || msg[i] === 'A') {
            AcheckNbMsg = 0;
            ALatterTester = true;
          } else if(ALatterTester && AisDone) {
            AisDone = false;
            AcheckNbMsg++;
            
          }
           if(msg[i] === 'k' || msg[i] === 'K') {
            KcheckNbMsg = 0;
            KLatterTester = true;
          } else if(KLatterTester && KisDone) {
            KisDone = false;
            KcheckNbMsg++;
           
          }
          //checkLatter === true;
          //break;
        }
        //}
      //}
    }
     if(QcheckNbMsg === (parseInt(process.env.TELEGRAM_NUMBER_MSG, 10) + 1)) {
              await sendMsgToErrorCheckingChannel(`
              Match is: ${msg.split(':')[0]}, Q Not Found
              `)
              QLatterTester = false;
              QcheckNbMsg = 0;
            }
  if(JcheckNbMsg === (parseInt(process.env.TELEGRAM_NUMBER_MSG, 10) + 1)) {
            
              await sendMsgToErrorCheckingChannel(`
              Match is: ${msg.split(':')[0]}, J Not Found
              `)
              JLatterTester = false;
              JcheckNbMsg = 0;
            }
             if(AcheckNbMsg === (parseInt(process.env.TELEGRAM_NUMBER_MSG, 10) + 1)) {
              await sendMsgToErrorCheckingChannel(`
              Match is: ${msg.split(':')[0]}, A Not Found
              `)
              ALatterTester = false;
              AcheckNbMsg = 0;
            }
     if(KcheckNbMsg === (parseInt(process.env.TELEGRAM_NUMBER_MSG, 10) + 1)) {
            //  console.log(msg.split(':'))
              await sendMsgToErrorCheckingChannel(`
              Match is: ${msg.split(':')[0]}, K Not Found
              `)
              KLatterTester = false;
              KcheckNbMsg = 0;
            } 
   // console.log(msg.split(':')[0])
    //console.log(KcheckNbMsg)
    //console.log(JcheckNbMsg)
    //console.log(AcheckNbMsg)
  } catch(err) {
    console.log(err);
  }
 /* try {
   for (var i = 0; i < msg.length; i++) {
     if(checkIfLetter(msg.charAt(i))) {

     if (
       new String(msg.charAt(i)).valueOf() === new String('Q').valueOf() ||
       new String(msg.charAt(i)).valueOf() === new String('q').valueOf() 
      
     ) {
       QLatter = true;
       QLatterTester = true;
       QcheckNbMsg = 0;
       CheckLastMessage = 'q';
       Qstart = true;
     }
     else if(!CheckLastMessage !== 'q'){
       QLatter = false;
     }
      if (
       new String(msg.charAt(i)).valueOf() === new String('k').valueOf() ||
       new String(msg.charAt(i)).valueOf() === new String('K').valueOf()
     ) {
       KLatter = true;
       KLatterTester = true;
       KcheckNbMsg = 0;
       CheckLastMessage = 'k';
       Kstart = true;
     } 
     else if(CheckLastMessage = 'k'){
       KLatter = false;
      // Kstart = false;
     }
     
      
      if (
      new String(msg.charAt(i)).valueOf() === new String('j').valueOf() ||
       new String(msg.charAt(i)).valueOf() === new String('J').valueOf() 
     ) {
       JLatter = true;
       JLatterTester = true;
       JcheckNbMsg = 0;

     //  console.log(msgToWrongChannel)
     } 
     else {
       JLatter = false;
     }
    } 
    
    }
    
   var msgToWrongChannel = '';

   if(!QLatter && QLatterTester && QcheckNbMsg === parseInt(process.env.TELEGRAM_NUMBER_MSG, 10)) {
     QLatterTesterSender = true;
     msgToWrongChannel += 'Q';
    } else if(QLatterTester){//&& Qstart
     QcheckNbMsg++;
     QLatterTesterSender = false;
    } 

    if(!JLatter && JLatterTester && JcheckNbMsg === parseInt(process.env.TELEGRAM_NUMBER_MSG, 10)) {
     JLatterTesterSender = true;
     msgToWrongChannel += 'J';
     
    } else if(JLatterTester){//&& Qstart
     JcheckNbMsg++;
     JLatterTesterSender = false
    } 
      
    if(!KLatter && KLatterTester && KcheckNbMsg === parseInt(process.env.TELEGRAM_NUMBER_MSG, 10)) {
     KLatterTesterSender = true;
     msgToWrongChannel += ' K';
    } else if(KLatterTester){
     KcheckNbMsg++;
     KLatterTesterSender = false;
    } 

    
    msgToWrongChannel += '.. Not Found 😭😭';
     
  if(KLatterTesterSender) {
     KLatterTesterSender = false;
     KLatterTester = false;
     KcheckNbMsg = 0;
    // Kstart = false;
     if (QLatterTesterSender) {
       QLatterTesterSender = false;
       QcheckNbMsg = 0;
       QLatterTester = false;
     //  Qstart = false;
      }
       if(JLatterTesterSender) {
       JLatterTesterSender = false;
       JcheckNbMsg = 0;
       JLatterTester = false;
       //Jstart = false;
      }
      //console.log(msgToWrongChannel)
     await sendMsgToErrorCheckingChannel(msgToWrongChannel);
    } else if (QLatterTesterSender) {
     QLatterTesterSender = false;
     QcheckNbMsg = 0;
     QLatterTester = false;
     //Qstart = false;
    if(KLatterTesterSender) {
       KLatterTesterSender = false;
       KLatterTester = false;
       KcheckNbMsg = 0;
     //  Kstart = false;
     }
     if(JLatterTesterSender) {
       JLatterTesterSender = false;
       JcheckNbMsg = 0;
       JLatterTester = false;
      // Jstart = false;
      }
      //console.log(msgToWrongChannel)
     await sendMsgToErrorCheckingChannel(msgToWrongChannel);
    }  else if(JLatterTesterSender) {
     JLatterTesterSender = false;
     JcheckNbMsg = 0;
     JLatterTester = false;
   //  Jstart = false;
     if(KLatterTesterSender) {
       KLatterTesterSender = false;
       KLatterTester = false;
       KcheckNbMsg = 0;
     //  Kstart = false;
     }
     if (QLatterTesterSender) {
      // Qstart = false;
       QLatterTesterSender = false;
       QcheckNbMsg = 0;
       QLatterTester = false;
      }
      console.log(msgToWrongChannel)
     await sendMsgToErrorCheckingChannel(msgToWrongChannel);
   
     return;
    }

  } catch(e) {
    console.log(e)
    return;
   // console.log(e)
  }*/
 }


async function sendMsgToErrorCheckingChannel(msg) {
  try {
    return await bot.sendMessage(tSubscryberChekingError, msg);
  }catch(e) {
   // console.log(e)
  }
}
function checkIfLetter(text) {
  
  for(var i of cardValueArr2) {
  //  console.log(text !== i)
 // console.log(cardValueArr)
 // console.log(text === i)
    if(text === i) return true;
  }
  
  return false;
}
startCheck();






