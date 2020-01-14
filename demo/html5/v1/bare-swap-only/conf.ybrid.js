/**
 * conf.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2019 nacamar GmbH
 */

const scheme = 'https';
const host = 'stagecast.ybrid.io';

//### Available demos ####

//### 1. Shows adaptivity capabilities by modulating outgoing bandwidth up and down between 32 and 192 kbps 
const path = '/adaptive-demo';

//### 2. Shows ad injection capabilities, including pre-stream ad injection and in-stream ad-injection 
//const path = '/ad-injection-demo';

//### 3. Since both demos above are based on Ybrid's playlist support, this third demo uses a real DABiS800 
//       Signal ingested by a playout system located in Switzerland :-) 
//const path = '/dabis/icecast/fixed';

// whether companion ads shall pop up or not.
const showCompanions = false;
