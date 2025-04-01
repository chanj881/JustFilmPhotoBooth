// access the video element, canvas, countdown, buttons
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const resetButton = document.getElementById('reset');
const countdownDisplay = document.getElementById('countdown');
const downloadStripButton = document.getElementById('download-strip');

// Frame selector
const frameSelector = document.querySelectorAll('.frame-option');

// Default frame
let selectedFrame = 'frame1';  // Default frame is frame1

// Set up the event listener for each frame option
frameSelector.forEach(option => {
    option.addEventListener('click', () => {
        // Remove the 'selected' class from all options
        frameSelector.forEach(opt => opt.classList.remove('selected'));
        
        // Add the 'selected' class to the clicked frame option
        option.classList.add('selected');
        
        // Update the selected frame value
        selectedFrame = option.getAttribute('data-frame');
        
        console.log(`Selected frame: ${selectedFrame}`);  // Debugging log to see the selected frame
    });
});


let countdownTimer;
let countdownValue = 3;
let photoCount = 0;  
let capturedPhotos = [];  // store captured photo data URLs temporarily

// taking photo function
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Error accessing the camera: ", err);
        });
}

// starting countdown function
function startCountdownForEachPhoto() {
    countdownDisplay.style.display = 'block'; // displaying countdown
    countdownValue = 3; // reset countdown value
    photoCount = 0; // reset photo counter
    capturedPhotos = [];  // reset captured photos array

    countdownTimer = null;

    // capturing multiple photos aka 4
    captureNextPhoto();
}

// function to capture photos with 3 sec countdown in between
function captureNextPhoto() {
    countdownTimer = setInterval(() => {
        countdownDisplay.textContent = countdownValue;
        countdownValue--;

        // take picture at 0 zero
        if (countdownValue < 0) {
            clearInterval(countdownTimer);  // stop countdown
            capturePhoto();  // take picture
            if (photoCount < 4) { // next countdown for next picture
                countdownValue = 3;
                captureNextPhoto();
            } else {
                // hide countdown when done
                countdownDisplay.style.display = 'none';

                // display frame selection and download button after
                document.getElementById('frame-selection').style.display = '';
                document.getElementById('download-strip').style.display = '';
            }
        }
    }, 1000);  // updating countdown seconds
}


// function to remember photos
function capturePhoto() {
    // trigger shutter effect after each countdown
    triggerShutterEffect();

    // video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // image url
    const dataURL = canvas.toDataURL();
    
    // storing captured photos
    capturedPhotos.push(dataURL);
    
    photoCount++;

    // stop after 4 pictures
    if (photoCount >= 4) {
        clearInterval(countdownTimer);  // stop countdown
    }
}


// Reset the app to the initial state
function resetApp() {
    capturedPhotos = []; // clear pictures that were taken/start over
    photoCount = 0; // reset the photo count
}

// function to download picture with custom frame designs
// Function to download the photo strip with custom frame designs
function downloadPhotoStrip() {
    const canvasStrip = document.createElement('canvas');
    const ctx = canvasStrip.getContext('2d');
    
    const stripHeight = 480 * 4;  // Total height of the photo strip (4 photos)
    canvasStrip.width = 640;  // Width of the canvas
    canvasStrip.height = stripHeight;  // Height of the canvas

    let loadedImagesCount = 0;

    // Function to load images
    function loadAndDrawImage(index, imgSrc) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, index * 480, 640, 480);  // Draw each photo at the right position
            loadedImagesCount++;

            // Apply the frame once all images are loaded
            if (loadedImagesCount === 4) {
                applyFrame(ctx, canvasStrip);  // Apply selected frame after all images are loaded
                
            }
        };
        img.src = imgSrc;  // Load each captured photo
    }

    // Load and draw the captured photos
    capturedPhotos.forEach((photo, index) => {
        loadAndDrawImage(index, photo);
    });
}


// function to apply custom frames
function applyFrame(ctx, canvasStrip) {
    const frame = new Image();
    const frameSrc = `images/${selectedFrame}.png`;  // Use the selected frame dynamically

    console.log("Trying to load frame:", frameSrc);  // Log the frame path to check

    frame.src = frameSrc;

    frame.onload = () => {
        console.log("Frame loaded successfully!");  // This logs when the frame is fully loaded
        ctx.drawImage(frame, 0, 0, canvasStrip.width, canvasStrip.height);  // Apply the frame to the entire canvas
        const link = document.createElement('a');
        link.href = canvasStrip.toDataURL('image/png');
        link.download = 'JustFilm.png';  // Photo strip filename
        link.click();
    };

    frame.onerror = () => {
        console.error("Error loading the frame image. Please check the path.");
    };
}



// event listeners for capture and reset buttons
captureButton.addEventListener('click', () => {
    startCountdownForEachPhoto();  // starting the countdown when clicking start button
});

resetButton.addEventListener('click', () => {
    window.location.reload();
});


downloadStripButton.addEventListener('click', () => {
    downloadPhotoStrip();  // download the photo strip as PNG
});

// initialize the video stream on page load
startVideo();

// accessing the flash element
const flash = document.getElementById('flash');

// function to trigger flash/shutter
function triggerShutterEffect() {
    // showing flash
    flash.style.opacity = 1;

    // adding shutter animation
    flash.style.animation = 'shutter 0.2s ease-out'; 

    // reset after animation
    setTimeout(() => {
        flash.style.opacity = 0;
        flash.style.animation = ''; // reset the animation
    }, 200); // the duration of the animation (200ms)
}

// function to capture a single photo then store in memory
function capturePhoto() {
    // trigger shutter effect
    triggerShutterEffect();

    // draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // image url to canvas
    const dataURL = canvas.toDataURL();
    
    // store captured pictures
    capturedPhotos.push(dataURL);
    
    // photo count increments
    photoCount++;

    // stop after 4 pictures
    if (photoCount >= 4) {
        clearInterval(countdownTimer);  // stop countdown
    }
}

