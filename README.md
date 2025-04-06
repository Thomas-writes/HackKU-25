Base Folders - [.firebase, public]
  .firebase - We used .firebase to host a domain to test our code without using localhost:3000
  public - public is the folder containing almost all the code needed to run spot-a-song, it holds all our JavaScript, html, css, and images.


  public - [Folder(output), cassette imgs, index.html, styles.css, loading.html, loading.css, playlist.js, script.js]
    cassette imgs - We had a couple of images saved for various parts of our proejct, those being: Our logo, loading image, and spotify cover. These images are all variations
                    of a cassette tape to represent the music we were finding. Our group member, Emmie Hurd, drew and designed these images using a tablet and Figma.                 
    index.html - This file stored our html data for our starting page, having our input, images, advanced search options, and more.    
    styles.css - This file stored the css data for our starting page, all of our colors, element properties, and more went down in here.   
    loading.html - This file stored our html data for our loading page, our loading page is our placeholder while we generate the music playlsit to be made based off the user input. 
    loading.css - This file stored our css data for our loading page, in this css page we also stored our animation for our loading bar.  
    playlist.js -     script.js - Script.js is where a majority of our backend work happened. In this file you can find the use of the gemini API & spotify API, along with data formatting, animations,
                other properties such as opening our other pages.
    Folder(output) - This stores our output data, holding all the data that is generated from our Gemini API and Spotify API.
      output.html - This file stored our html data for our final page, we also stored some JavaScript scripts in here in order to create objects that stored the Spotify API data.
      output.css - This file stored our css data for our final page, lots of formatting went into here, but no animation can be found in this file.
Files - [.firebaserc, .gitignore, firebase.json]
  .firebaserc & firebase.json - Both used to host and store information for our domain.
  .gitignore - Ignores out dependency
