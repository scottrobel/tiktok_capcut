const fs = require('fs');
let { Builder, By, Key, until } = require('selenium-webdriver');
let chrome = require('selenium-webdriver/chrome');
let path = require('path');
let axios = require('axios'); // Import Axios for downloading files
const ffmpeg = require('fluent-ffmpeg');
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });
// Get the absolute path to the ChromeDriver executable in the current directory
let chromeDriverPath = path.resolve(__dirname, 'chromedriver');
// Configure Chrome options
let chromeOptions = new chrome.Options();
chromeOptions.addArguments('--start-maximized'); // Maximize the Chrome window
const { WebcastPushConnection } = require('tiktok-live-connector');
server.on('connection', (ws) => {
  async function clickElementMultipleTimes(driver, elementSelector, times) {
    await driver.sleep(5500);
    for (let i = 0; i < times; i++) {
      let element = await driver.findElement(By.css(elementSelector));
      await element.click();
      console.log(`Clicked element ${i + 1} times.`);

      // Add a 0.3-second delay
    }
  }
  async function CreateVideoFromTemplate(driver, link, fileURL) {
    // Ensure link is provided
    if (!link) {
      console.error('Link not provided.');
      return;
    }

    // Execute JavaScript in the browser context to open a new window with the specified link
    await driver.executeScript(`window.open("${link}", "_blank", "noopener,noreferrer")`);

    // Get handles for all open windows
    let windowHandles = await driver.getAllWindowHandles();

    // Switch to the newly opened window
    template_card_window_handle_id = windowHandles[windowHandles.length - 1]
    await driver.switchTo().window(template_card_window_handle_id); // Assuming the new window is at index 1
    let useTemplateSelector = ".lv-template-detail-layout button"
    let useTemplateButton = await driver.wait(until.elementLocated(By.css(useTemplateSelector)), 8000);
    await useTemplateButton.click();
    await driver.switchTo().window(template_card_window_handle_id);
    await driver.close()
    windowHandles = await driver.getAllWindowHandles();
    template_editor_window_handle_id = windowHandles[windowHandles.length - 1]
    await driver.switchTo().window(template_editor_window_handle_id);
    // Wait for the "OK" button to appear and click it
    if (windowHandles.length == 2) {
      okButtonSelector = '.guide-modal-footer-btn.guide-modal-footer-next-btn';
      okButton = await driver.wait(until.elementLocated(By.css(okButtonSelector)), 17000);
      if (okButton) {
        await okButton.click();
        console.log('OK button clicked.');
      } else {
        console.log('OK button not found.');
      }
    }
    await driver.sleep(5000);
    let BatchReplace = await driver.wait(until.elementLocated(By.css('#timeline-quick-replace-btn')), 8000);
    await BatchReplace.click();
    // Click the "Project" tab
    let projectTab = await driver.findElement(By.css('[data-ssr-i18n-value="Project"]'));
    await projectTab.click();
    console.log('Project tab clicked.');
    windowHandles = await driver.getAllWindowHandles();
    // Wait for the file input element to load
    let fileInputSelector = 'input[type="file"]';
    let fileInput = await driver.wait(until.elementLocated(By.css(fileInputSelector)), 8000);

    if (fileInput) {
      // Download the file from the URL and save it locally
      let response = await axios.get(fileURL, { responseType: 'arraybuffer' });
      let fileName = 'downloaded_file.jpeg'; // Change this to the desired filename
      let filePath = path.resolve(__dirname, fileName);
      require('fs').writeFileSync(filePath, Buffer.from(response.data));

      // Upload the downloaded file
      await fileInput.sendKeys(filePath);
      console.log('File uploaded.');
    } else {
      console.log('File input not found.');
    }
    if (windowHandles.length == 2) {
      // Wait for the "OK" button to appear and click it
      okButtonSelector = '.guide-modal-footer-btn.guide-modal-footer-next-btn';
      okButton = await driver.wait(until.elementLocated(By.css(okButtonSelector)), 8000);
      if (okButton) {
        await okButton.click();
        console.log('OK button clicked.');
      } else {
        console.log('OK button not found.');
      }
    }
    await clickElementMultipleTimes(driver, '.card-item--media_card', 10);
    let ExportButton = await driver.findElement(By.css('#export-video-btn'));
    await ExportButton.click()
    // Click the "Export" button
    let exportButton = await driver.wait(until.elementLocated(By.css('.material-export-modal-footer button')), 8000);
    await exportButton.click();
    // Switch back to the original window (if needed)
    await driver.switchTo().window(windowHandles[0]); // Switch back to the first window
  }

  async function main(link, fileURL) {
    // Create a new WebDriver instance with Chrome
    let driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .setChromeService(new chrome.ServiceBuilder(chromeDriverPath))
      .build();

    try {
      // Navigate to Google
      await driver.get('https://www.capcut.com/login');
      let emailInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Enter email"]')));
      let passwordInput = await driver.wait(until.elementLocated(By.css('input[placeholder="Enter password"]')));
      await emailInput.sendKeys('robelrain@gmail.com');
      await passwordInput.sendKeys('1mckenna');
      // Locate and click the "Sign in" button
      let signInButton = await driver.findElement(By.css('.lv-btn.lv-btn-primary.lv-btn-size-large.lv-btn-shape-square.lv_sign_in_panel-sign-in-button'));
      await signInButton.click();

      // You can interact with the webpage here if needed.
      await driver.sleep(5000); // 5000 milliseconds (5 seconds)

      // Open a new window with a link
      await CreateVideoFromTemplate(driver, link, fileURL);
      let windowHandles = await driver.getAllWindowHandles();
      await driver.switchTo().window(windowHandles[windowHandles.length - 1]);
      while (windowHandles.length > 1) {
        let videoElement = await driver.wait(until.elementLocated(By.css('video')), 60000);
        let downloadButton = await driver.wait(until.elementLocated(By.css(".index-module_lv_share-choosePage-platform-row__w0xAm > :last-child")), 10000);
        await downloadButton.click();
        await driver.sleep(2000);
        // Get the list of files in the download directory.
        downloadPath = "/home/scott/Downloads/"
        const files = fs.readdirSync(downloadPath);
        // Find the most recently downloaded file by sorting the files by their creation time.
        const sortedFiles = files.map(file => ({
          name: `${downloadPath}/${file}`,
          time: fs.statSync(`${downloadPath}/${file}`).ctime,
        })).sort((a, b) => b.time - a.time);
        // The most recently downloaded file will be at the beginning of the sortedFiles array.
        const mostRecentFile = sortedFiles[0];
        const currentEpoch = Math.floor(Date.now() / 1000);
        let newFileLocation = `${process.cwd()}/videos/${currentEpoch}.mp4`
        fs.rename(mostRecentFile['name'], newFileLocation, (err) => {
          if (err) {
            console.error(`Error moving file: ${err}`);
          } else {
            console.log('File moved successfully!');
          }
        })
        await driver.close();
        windowHandles = await driver.getAllWindowHandles();
        await driver.switchTo().window(windowHandles[windowHandles.length - 1]);
        await driver.close();
        return newFileLocation;
      }
    } catch (error) {
      windowHandles = await driver.getAllWindowHandles();
      windowsAmount = windowHandles.length;
      index = 0
      while(index < windowsAmount){
        await driver.switchTo().window(windowHandles[index]);
        await driver.close()
        index+=1
      }
      console.error('An error occurred:', error);
    }
  };


  //endgoal is to have a slide of videos that consists of the most recent 5 gifters
  //I will take turns playing one random video from each gifter if there is one.
  //the gifter that the video is from is not random, the videos will cycle through 
  //each of the most recent gifter and choose a random video out of the videos for that gifter
  //one of the 5 should just be a series of video templates informing people
  //that if they donate their face will appear
  //for this in the background I need a loop to create videos from an array of 
  //100 templates, the user that the video gets made of should be whatever user
  //has the least amount of videos for them
  //when a new user donates it should delete the least recent user from the
  //stack  and all of their videos
  templates = [
  "https://www.capcut.com/templates/Jijay-7106179623431572738",
  "https://www.capcut.com/templates/7133873425923312897",
  "https://www.capcut.com/templates/Are-you-single-7195149111316712709",
  "https://www.capcut.com/templates/Boys-look-at-this-7149389943570222341",
  "https://www.capcut.com/templates/OP-x-WB-7240690505099545861",
  "https://www.capcut.com/templates/scary-7215399491694808322",
  "https://www.capcut.com/templates/Do-you-have-a-bf-7212345079254748422",
  "https://www.capcut.com/templates/who-started-racism-7239112968443563269", 
  "https://www.capcut.com/templates/boom-7204748970185346305",
  "https://www.capcut.com/templates/Family-Guy-Meme-7250253436737080581", 
  "https://www.capcut.com/templates/Lying-Dog-Meme-7236965791315381509",
  "https://www.capcut.com/templates/Look-at-this-7226773235239505153",
  "https://www.capcut.com/templates/IMA-SLIDE-IN-clip-7210500190359391493",
  "https://www.capcut.com/templates/WARNINGscary-7246155392391187717",
  "https://www.capcut.com/templates/greenscreen-7070146350402276609",
  "https://www.capcut.com/templates/HAHAH-7201355795114560773", 
  "https://www.capcut.com/templates/Memes-7229930968482712834",
  "https://www.capcut.com/templates/Family-Guy-Paint-7233870905515019525",
  "https://www.capcut.com/templates/TikTok-green-screen-7214646643281448198",
  "https://www.capcut.com/templates/Cow-meme-7202288203947085062",
  "https://www.capcut.com/templates/7263925463536471302",
  "https://www.capcut.com/templates/7177768090573229338"]
  mostRecentGifters = [
    {
      username: 'efrengarcia0702',
      profilePhoto: 'https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-0068-tx/f4d86d936e57fc4f1de07681762504a2~c5_100x100.webp?x-expires=1694419200&x-signature=ax8dxi6MhSv0bTVQt1ZyHQxpPcw%3D',
      videos: fs.readdirSync('./videos').map((file) => path.join(__dirname, './videos', file))
    }
  ]
  //first part of this project im going to need 20 or so templates
  //and 5 tiktok profile photos
  //im going to create an endless loop that
  //finds what user has the least amount of videos
  //and uses the template at index % templatesLinks.length
  //then stores it with the user
  function deleteVideos(videoFiles) {
    videoFiles.forEach(filename => {
      fs.unlink(filename, err => {
        if (err) {
          console.error(`Error deleting ${filename}: ${err}`);
        } else {
          console.log(`Deleted ${filename}`);
        }
      });
    });
  }
  function getVideoLength(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration);
        }
      });
    });
  }


  videoMaker = async () => {
    console.log("VIDEO MAKER STARTED")
    index = 0
    while (true) {
      if (mostRecentGifters.length > 0) {
        templateIndex = index % templates.length
        templateLink = templates[templateIndex]
        const gifterWithLeastVideos = mostRecentGifters.reduce((minGifter, gifter) =>
          gifter.videos.length < minGifter.videos.length ? gifter : minGifter
        );
        newVideoFilePath = await main(templateLink, gifterWithLeastVideos['profilePhoto'])
        if (newVideoFilePath) {
          gifterWithLeastVideos.videos.push(newVideoFilePath)
        }
        index += 1
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  gifterManager = async () => {
    console.log("GIFT MANAGER STARTED")
    // Username of someone who is currently live
    let tiktokUsername = "@kylecapener";
    let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);
    tiktokLiveConnection.connect().then(state => {
      console.info(`Connected to roomId ${state.roomId}`);
    }).catch(err => {
      console.error('Failed to connect', err);
    })
    tiktokLiveConnection.on('gift', data => {
      let userAlreadyInArray = mostRecentGifters.some(obj => obj.username === data.uniqueId);
      if (!userAlreadyInArray) {
        mostRecentGifters.unshift({ username: data.uniqueId, profilePhoto: data.profilePictureUrl, videos: [] })
        console.log(mostRecentGifters)
        if (mostRecentGifters.length > 15) {
          deletedGifter = mostRecentGifters.pop();
          deleteVideos(deletedGifter.videos);
        }
      }
    })
  }
  videoQueueManager = async () => {
    loopIndex = 0
    while (true) {
      if (mostRecentGifters.length > 0 && mostRecentGifters.some(item => item.videos.length > 0)) {
        userIndex = loopIndex % mostRecentGifters.length
        //increase the user index until it points to a user with videos
        while (mostRecentGifters[userIndex].videos.length == 0) {
          loopIndex += 1
          userIndex = loopIndex % mostRecentGifters.length
        }
        user = mostRecentGifters[userIndex];
        randomVideo = user.videos[Math.floor(loopIndex /  mostRecentGifters.length) % user.videos.length];
        ws.send(randomVideo);
        console.log(randomVideo)
        let videoLength = await getVideoLength(randomVideo)
        await new Promise(resolve => setTimeout(resolve, videoLength * 1000));
        loopIndex += 1
      } else {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // console.log("Working!")
    }
    //wait for mostRecentGifters to not be empty
    //queue one video first from the user at index % mostRecentGifters
    //wait until the duration of that video has surpassed 
    //pick a random video from the next one and stream it
  }
  gifterManager()
  videoQueueManager()
  videoMaker()
});