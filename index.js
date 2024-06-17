import WebSocketManager from "./socket.js";
const socket = new WebSocketManager("127.0.0.1:24050");

// Cache DOM elements upfront
const elements = {
    title: document.querySelector(".title"),
    diff: document.querySelector(".diff"),
    HP: document.querySelector(".HP"),
    OD: document.querySelector(".OD"),
    SR: document.querySelector(".SR"),
    BPM: document.querySelector(".BPM"),
    PP: document.querySelector(".PP"),
    allDivs: document.querySelector("*"),
    image: document.querySelector("img")
};

// Initialize cache
const cache = {
    map: {},
    stats: {},
    directPath: {},
    state: 0
};

//  avoid unnecessary DOM updates
function updateCache(object, property, newValue) {
    if (object[property] !== newValue) {
        object[property] = newValue;
        return true;
    }
    return false;
}

function updateDOM() {
    elements.title.innerText = `${cache.map.artist ?? ''} - ${cache.map.title ?? ''}`;
    elements.diff.innerText = `${cache.map.mapper}'s ${cache.map.diff ?? ''} ${cache.map.mod ? `+${cache.map.mod}` : ''}`;
    elements.HP.innerText = `HP: ${cache.stats.HP ?? '0'}`;
    elements.OD.innerText = `OD: ${cache.stats.OD ?? '0'}`;
    elements.SR.innerText = `SR: ${cache.stats.SR ?? '0'}`;
    elements.BPM.innerText = `BPM: ${cache.stats.BPM ?? '0'}`;
    elements.PP.innerText = `PP: ${cache.stats.PP ?? '0'}`;
    elements.allDivs.style.transition = 'opacity 500ms';
    elements.allDivs.style.opacity = cache.state === 2 ? 1 : 0;
    elements.image.setAttribute('src', cache.directPath.beatmapBackground || '');
}

function handleData(data) {
    const { beatmap, play, state } = data;
    const { title, artist, version: diff, mapper, stats } = beatmap;
    const { hp, od, stars, bpm } = stats;
    const { pp, mods } = play;

    // rounding numbers
    const BPM = bpm?.common ? bpm.common.toFixed(0) : null;
    const PP = pp ? pp.current.toFixed(0) : null;
    const HP = hp?.converted ? hp.converted.toFixed(2) : null;
    const OD = od?.converted ? od.converted.toFixed(2) : null;
    const SR = stars?.total ? stars.total.toFixed(2) : null;
    
    const updates = [ 
        updateCache(cache.map, 'title', title),
        updateCache(cache.map, 'artist', artist),
        updateCache(cache.map, 'diff', diff),
        updateCache(cache.map, 'mapper', mapper),
        updateCache(cache.map, 'mod', mods.name),
        updateCache(cache.stats, 'HP', HP),
        updateCache(cache.stats, 'OD', OD),
        updateCache(cache.stats, 'SR', SR),
        updateCache(cache.stats, 'BPM', BPM),
        updateCache(cache.stats, 'PP', PP),
        updateCache(cache.directPath, 'beatmapBackground', `http://127.0.0.1:24050/Songs/${data.directPath.beatmapBackground.replace(/#/g, '%23').replace(/%/g, '%25').replace(/ /g, '%20')}?a=${Date.now()}`), // ?a= prevents unnecessary caching of img
        updateCache(cache, 'state', state?.number)
    ];

    if (updates.some(Boolean)) {
        updateDOM();
    }
}

socket.api_v2((data) => {
    try {
        handleData(data);
    } catch (error) {
        console.error('Error handling data:', error);
    }
});
