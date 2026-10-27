// node shot2.js url out W H transparent
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const [,,url,out,W,H,tr]=process.argv;const b=await chromium.launch({args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:+W,height:+H}});p.on('pageerror',e=>console.log('ERR',e.message));await p.goto(url);await p.waitForTimeout(800);
await p.screenshot({path:out,omitBackground:tr==='1',type:out.endsWith('jpg')?'jpeg':'png',quality:out.endsWith('jpg')?88:undefined});await b.close()})();
