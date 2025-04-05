//image source list
let imageList = [ 
"https://via.placeholder.com/64?text=1",
"https://via.placeholder.com/64?text=2",
"https://via.placeholder.com/64?text=3",
"https://via.placeholder.com/64?text=4",
"https://via.placeholder.com/64?text=5",
"https://via.placeholder.com/64?text=6",
"https://via.placeholder.com/64?text=7",
"https://via.placeholder.com/64?text=8",
"https://via.placeholder.com/64?text=9",
"https://via.placeholder.com/64?text=10"
];
//artist name list
let artistList = [
    "Lil Cactus",
    "DJ Toast",
    "Echo Blaze",
    "Nova Drift",
    "Captain Lo-Fi",
    "Pixel Panda",
    "The Synth Surfer",
    "Chrome Ghost",
    "Sapphire Waves",
    "Cloud Raver"
  ];
//song title list
let titleList = [
    "Neon Dreams",
    "Ocean Static",
    "Burn the Sky",
    "Starlight Fade",
    "Digital Mirage",
    "Velvet Shadows",
    "Echo Chamber",
    "Ghost in the Disco",
    "Flicker Phase",
    "Retro Pulse"
  ];
//output ul for the html
let mainList = document.querySelector('.song-list');
//generate function the uses aname for artist, sname for song, and img for image source
function generate(aname, img, sname){
    //generate all elements needed
    let songElement = document.createElement('li');
    let image = document.createElement('img');
    let info = document.createElement('div');
    let title = document.createElement('div');
    let artist = document.createElement('div');
    //attach all elements to respective classes for styling
    songElement.className = "song-item";
    image.className = "album-art"; image.alt = sname; image.src = img;
    info.className = "song-info";
    title.className = "song-title";
    artist.className = "artist-name";
    //adjust the innerHTML for the output
    title.innerHTML = sname;
    artist.innerHTML = aname;
    //add the a
    info.appendChild(title); 
    info.appendChild(artist)
    songElement.appendChild(image); 
    songElement.appendChild(info);
    mainList.appendChild(songElement);
};

for (let i = 0; i < titleList.length; i++){
    generate(artistList[i], imageList[i], titleList[i])
}