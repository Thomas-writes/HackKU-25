import { titleArray, artistArray, albumArray, spotifyURLArray, imageArray, main } from '../spotify_search.js';
// Call the main function to populate the arrays

async function initialize() {
  
  await main();

  //image source list
  let imageList = imageArray;
  //artist name list
  let artistList = artistArray;
  //song title list
  let titleList = titleArray;
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
      image.className = "album-art"; image.src = img;
      info.className = "song-info";
      title.className = "song-title";
      artist.className = "artist-name";
      image.style.height="100px"
      image.style.width="100px"
      //adjust the innerHTML for the output
      title.innerHTML = sname;
      artist.innerHTML = aname;
      title.style.color = "#143150"
      title.style.paddingLeft = "10px"
      title.style.fontSize="20px"
      artist.style.color = "#C2EFB3"
      artist.style.paddingLeft = "15px"
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
}
document.getElementById('generation').addEventListener('click', initialize);