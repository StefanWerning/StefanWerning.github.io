
// include code to get part of an image from https://editor.p5js.org/jeffThompson/sketches/oLiww5UE9

let video;
let codeReader;
let scannedCode = "Scanning for Barcode...";
let detectedCountry = "";
let productstr = "no product info";

// --- NEW: Card Array ---
let cards = []; // This will hold all our generated card objects

let mysound;
let img;
let myimg;
let boardimg;
let col;

function preload () {
  mysound = loadSound("beep.mp3");
  img = loadImage('all_the_sprites_grey.png');
  boardimg = loadImage('Chessboard_5x5_green.jpg');
  myimg = createImage(32,32);
}

// New variable to hold our generated RPG stats
let stats = null;

// --- NEW: Player Variables ---
const playerColors = [
  [255, 0, 0],    // Player 1: Red
  [0, 255, 0],    // Player 2: Green
  [0, 0, 255],    // Player 3: Blue
  [255, 255, 0]   // Player 4: Yellow
];
let currentPlayerIndex = 0; // Starts with Player 1 (Index 0)
let nextTurnBtn;

const elements = [
  "Fire", "Fire", "Fire", "Water", "Water", "Earth", "Earth", "Wind"
];

// Tolkien-esque Syllable Arrays
const startSyllables = [
  "Ar", "Ara", "Bor", "Celeb", "Dor", "El", "Elen", "Éo", "Fin", "Gal", 
  "Gil", "Gon", "Gond", "Khaz", "Minas", "Mith", "Mor", "Orod", "Thrand", 
  "Tir", "Umli", "Val", "Zirak"
];

const endSyllables = [
  "andir", "ath", "born", "dil", "dûr", "dûm", "gund", "iel", "ion", "ir", 
  "ith", "lith", "mir", "ond", "rim", "rond", "ros", "uin", "wen", "wyn"
];

function setup() {
  createCanvas(1920, 1080);
  
  document.oncontextmenu = () => false; // prevent right-click menu
  
  // --- NEW: Next Turn Button ---
  nextTurnBtn = createButton('Next Player Turn');
  nextTurnBtn.position(20, 20); // Position it in the top left
  nextTurnBtn.style('font-size', '20px');
  nextTurnBtn.style('padding', '10px');
  nextTurnBtn.style('cursor', 'pointer');
  
  // When the button is pressed, cycle to the next player
  nextTurnBtn.mousePressed(() => {
    currentPlayerIndex = (currentPlayerIndex + 1) % playerColors.length;
  });
  
  frameRate(15);
  //angleMode(DEGREES);
  // 1. Create a video capture using the laptop webcam
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); 
  
  col = color(128, 128, 128);
  
  // 2. Initialize ZXing Multi-format reader
  codeReader = new ZXing.BrowserMultiFormatReader();
  
  // 3. Start continuous scanning
  codeReader.decodeFromVideoDevice(undefined, video.elt, (result, err) => {
    if (result) {
      scannedCode = result.getText();
      mysound.play();
      productstr="";
      // Look up the country
      let prefix = scannedCode.substring(0, 3);
      detectedCountry = getCountryFromGS1(prefix);
      getProductName(scannedCode);
      // --- NEW RPG STAT GENERATION ---
      // Turn the barcode string into an integer (safe up to 15 digits in JS)
      let seed = parseInt(scannedCode, 10);
      
      // Set the seed so the same barcode always yields the same random numbers
      randomSeed(seed);
      
      // --- NEW: Generate Name ---
      // p5.js random() function can automatically pick a random element from an array!
      let generatedName = random(startSyllables) + random(endSyllables);
      if (scannedCode.length>8) myimg = img.get(int(random(0,15))*32, int(random(0,16))*32,32,32);
      myimg.resize(64, 64);
      col=color(random(100,255), random(80,235), random(60,215),220);
      //col=(150, 220, 50,220);
      let generatedElement = random(elements);
      let tmp = random(elements);
      if (tmp != generatedElement) {generatedElement=generatedElement+"/"+tmp;}
      
      // Generate numbers between 1 and 20 (inclusive)
      stats = {
        name: generatedName,
        strength: floor(random(1, 21)),
        defense: floor(random(1, 21)),
        speed: floor(random(1, 21)),
        power: floor(random(1, 21)),
        element: generatedElement
      };
      // --- NEW: Generate Card Image and add to array ---
      // --- NEW: Generate Card Image and add to array ---
      let cardImage = createCardGraphic(stats, playerColors[currentPlayerIndex]);
      
      cards.push({
        img: cardImage,
        x: mouseX - 100, // Center the 200x200 card on the mouse
        y: mouseY - 100,
        isDragging: false,
        offsetX: 0,
        offsetY: 0,
        rotation: currentPlayerIndex,      
        wasDragged: false // Tracks if the mouse moved while holding it
      });
      
      
    }
  });
}

function draw() {
  background(0);
  
  // Draw the webcam video to the canvas
  if (video) {
    //image(video, 20, height-500, 640, 480);
    image(video, 0,0, 640, 480);
  }
  image(boardimg, width-1040,40, 1000, 1000);
  
  imageMode(CENTER); // Draw from center to make rotation math easy
  
  for (let card of cards) {
    push();
    // Move the grid to the exact center point of the card
    translate(card.x + 100, card.y + 100); 
    // Rotate by 90 degrees (HALF_PI) for each click
    rotate(HALF_PI * card.rotation); 
    // Draw the image at 0,0 (which is now the translated center)
    image(card.img, 0, 0); 
    pop();
  }
  
  imageMode(CORNER); // Reset back to default so video/board draw normally
    
  // Draw a semi-transparent black banner at the bottom
  fill(0, 180);
  rect(0, 500, 640, 100);
  
  // Display the scanned code and corresponding country
  fill(255);
  textSize(14);
  textAlign(CENTER, CENTER);
  text(`Barcode: ${scannedCode}`, 320, 510);
  fill(100, 255, 100); // Light green text for the country
  text(`Origin Country: ${detectedCountry}`, 320, 530);
  text(productstr, 320, 550);  
  
  let currentColor = playerColors[currentPlayerIndex]; 
  
  stroke(currentColor[0], currentColor[1], currentColor[2]);
  strokeWeight(30); // Make the border thick and visible
  noFill(); // Don't fill the inside of the rectangle
  
  // Draw the rectangle around the edge of the canvas
  rect(0, 0, width, height);
  
  // Reset stroke settings so it doesn't affect the next frame
  noStroke(); 
  strokeWeight(0);
}


function getProductName(barcode) {
  // The Open Food Facts API endpoint for a specific product
  let url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
  
  // Fetch the data from the API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // The API returns a status of 1 if the product is found
      if (data.status === 1) { 
        let productName = data.product.product_name;
        let brand = data.product.brands;
        
        //console.log(`Found it! This is: ${brand} - ${productName}`);
        productstr=`${brand} - ${productName}`;
        
        // You could save this to a global variable here to draw it on your canvas!
      } else {
        //console.log("Product not found in the Open Food Facts database.");
        productstr="No food.";
      }
    })
    .catch(error => {
      console.error("Error communicating with the API:", error);
    });
}

// GS1 Country Code mapping function 
// Based on: https://en.wikipedia.org/wiki/List_of_GS1_country_codes
function getCountryFromGS1(prefixStr) {
  let code = parseInt(prefixStr, 10);
  
  // US & Canada
  if (code >= 0 && code <= 139) return "US / Canada";
  
  // Europe
  if (code >= 300 && code <= 379) return "France & Monaco";
  if (code === 380) return "Bulgaria";
  if (code === 383) return "Slovenia";
  if (code === 385) return "Croatia";
  if (code === 387) return "Bosnia and Herzegovina";
  if (code >= 400 && code <= 440) return "Germany";
  if (code >= 460 && code <= 469) return "Russia";
  if (code === 474) return "Estonia";
  if (code === 475) return "Latvia";
  if (code === 477) return "Lithuania";
  if (code === 481) return "Belarus";
  if (code === 482) return "Ukraine";
  if (code === 484) return "Moldova";
  if (code >= 500 && code <= 509) return "United Kingdom";
  if (code >= 520 && code <= 521) return "Greece";
  if (code === 529) return "Cyprus";
  if (code === 531) return "North Macedonia";
  if (code === 535) return "Malta";
  if (code === 539) return "Ireland";
  if (code >= 540 && code <= 549) return "Belgium & Luxembourg";
  if (code === 560) return "Portugal";
  if (code === 569) return "Iceland";
  if (code >= 570 && code <= 579) return "Denmark, Faroe Islands & Greenland";
  if (code === 590) return "Poland";
  if (code === 594) return "Romania";
  if (code === 599) return "Hungary";
  if (code >= 640 && code <= 649) return "Finland";
  if (code >= 700 && code <= 709) return "Norway";
  if (code >= 730 && code <= 739) return "Sweden";
  if (code >= 760 && code <= 769) return "Switzerland & Liechtenstein";
  if (code >= 800 && code <= 839) return "Italy, San Marino & Vatican City";
  if (code >= 840 && code <= 849) return "Spain & Andorra";
  if (code === 858) return "Slovakia";
  if (code === 859) return "Czech Republic";
  if (code >= 870 && code <= 879) return "Netherlands";
  if (code >= 900 && code <= 919) return "Austria";
  
  // Asia
  if (code >= 450 && code <= 459) return "Japan";
  if (code >= 490 && code <= 499) return "Japan";
  if (code === 471) return "Taiwan";
  if (code === 489) return "Hong Kong";
  if (code >= 690 && code <= 699) return "China";
  if (code === 880) return "South Korea";
  if (code === 884) return "Cambodia";
  if (code === 885) return "Thailand";
  if (code === 888) return "Singapore";
  if (code === 890) return "India";
  if (code === 893) return "Vietnam";
  if (code === 899) return "Indonesia";
  if (code === 955) return "Malaysia";

  // Oceania
  if (code >= 930 && code <= 939) return "Australia";
  if (code >= 940 && code <= 949) return "New Zealand";

  // Middle East & Africa
  if (code >= 600 && code <= 601) return "South Africa";
  if (code === 611) return "Morocco";
  if (code === 613) return "Algeria";
  if (code === 616) return "Kenya";
  if (code === 622) return "Egypt";
  if (code === 628) return "Saudi Arabia";
  if (code === 629) return "United Arab Emirates";
  if (code === 729) return "Israel";

  // Americas
  if (code === 740) return "Guatemala";
  if (code === 744) return "Costa Rica";
  if (code === 746) return "Dominican Republic";
  if (code === 750) return "Mexico";
  if (code === 759) return "Venezuela";
  if (code === 770) return "Colombia";
  if (code === 773) return "Uruguay";
  if (code === 775) return "Peru";
  if (code === 777) return "Bolivia";
  if (code === 779) return "Argentina";
  if (code === 780) return "Chile";
  if (code >= 789 && code <= 790) return "Brazil";

  // Non-Geographical & Special Codes
  if (code >= 200 && code <= 299) return "Restricted distribution (Internal use)";
  if (code >= 977 && code <= 979) return "Books (ISBN) / Serials (ISSN)";
  if (code === 980) return "Refund receipts";
  if (code >= 981 && code <= 984) return "GS1 coupons";
  
  return "Unknown / Not found in Database";
}

function createCardGraphic(stats, playerColor) {
  // Create a 200x200 off-screen graphic buffer
  let pg = createGraphics(200, 200);
  const boxSize = 200;
  const centerpoint = boxSize / 2;
  const edgePadding = 15;

  // 1. Draw Background and Player-Colored Border
  pg.fill(0, 180);
  pg.stroke(playerColor[0], playerColor[1], playerColor[2]); // Current player color
  pg.strokeWeight(6); // Border thickness
  pg.rect(3, 3, boxSize - 6, boxSize - 6); // Offset slightly so border isn't cut off

  // Set common text properties
  pg.noStroke();
  pg.textSize(16);
  pg.textAlign(CENTER, CENTER);
  pg.fill(255);

  // A. TOP (Faces Up)
  pg.push();
  pg.translate(centerpoint, edgePadding + 5);
  pg.rotate(PI);
  pg.text(`${stats.strength}`, 0, 0);
  pg.pop();

  // B. RIGHT (Faces Right)
  pg.push();
  pg.translate(boxSize - edgePadding - 5, centerpoint);
  pg.rotate(-HALF_PI);
  pg.text(`${stats.speed}`, 0, 0);
  pg.pop();

  // C. BOTTOM (Faces Down)
  pg.push();
  pg.translate(centerpoint, boxSize - edgePadding - 5);
  pg.rotate(-PI);
  pg.text(`${stats.defense}`, 0, 0);
  pg.pop();

  // D. LEFT (Faces Left)
  pg.push();
  pg.translate(edgePadding + 5, centerpoint);
  pg.rotate(HALF_PI);
  pg.text(`${stats.power}`, 0, 0);
  pg.pop();

  // Draw the name in a nice gold color
  pg.fill(255, 215, 0);
  pg.text(`Name: ${stats.name}`, 0, 110, boxSize, 20);
  
  // Element text and coloring
  let tmp = stats.element.substr(0, stats.element.indexOf("/"));
  switch (tmp) {
    case "Fire": pg.fill(255, 20, 20); break;
    case "Water": pg.fill(10, 30, 255); break;
    case "Earth": pg.fill(150, 75, 0); break;
    default: pg.fill(150, 150, 150);
  }
  
  tmp = stats.element.substring(stats.element.lastIndexOf('/') + 1);
  switch (tmp) {
    case "Fire": pg.stroke(255, 20, 20); break;
    case "Water": pg.stroke(10, 30, 255); break;
    case "Earth": pg.stroke(150, 75, 0); break;
    default: pg.stroke(150, 150, 150);
  }
  
  pg.strokeWeight(3);
  pg.text(`Element/s: ${stats.element}`, 0, 135, boxSize, 25);
  pg.tint(col);
  pg.image(myimg, 100-32, 30);
  pg.noTint();

  
  return pg; // Return the finished image!
}

// --- NEW: Advanced Mouse Interaction Functions ---

function mousePressed() {
  for (let i = cards.length - 1; i >= 0; i--) {
    let card = cards[i];
    if (mouseX > card.x && mouseX < card.x + 200 && mouseY > card.y && mouseY < card.y + 200) {
      
      if (mouseButton === RIGHT) {
        // Right-Click: Delete the card
        cards.splice(i, 1);
        return false; // Prevent default behavior
      } 
      else if (mouseButton === LEFT) {
        // Left-Click: Prepare to drag or rotate
        card.isDragging = true;
        card.wasDragged = false; // Reset the drag tracker
        card.offsetX = card.x - mouseX;
        card.offsetY = card.y - mouseY;
        
        // Move the clicked card to the end of the array so it renders on top
        cards.push(cards.splice(i, 1)[0]);
        break; // Only interact with one card at a time
      }
    }
  }
  return false; // Suppresses default browser behaviors
}

function mouseDragged() {
  for (let card of cards) {
    if (card.isDragging) {
      card.x = mouseX + card.offsetX;
      card.y = mouseY + card.offsetY;
      card.wasDragged = true; // Mark that the mouse actually moved
    }
  }
  return false; 
}

function mouseReleased() {
  for (let card of cards) {
    if (card.isDragging) {
      card.isDragging = false;
      
      // If we clicked and released without moving the mouse, rotate it!
      if (!card.wasDragged) {
        card.rotation = (card.rotation + 1) % 4; // Cycles 0, 1, 2, 3
      }
    }
  }
  return false;
}