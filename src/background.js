var START_DOWNLOADING_CONTEXT_MENU_ID = 'startDownloadingContextMenu';
var STOP_DOWNLOADING_CONTEXT_MENU_ID = 'stopDownloadingContextMenu';

// Track files downloaded to prevent duplicates.
var downloadedFiles = [];

var showStartDownloadingContextMenu = function() {
  try {
    chrome.contextMenus.remove(STOP_DOWNLOADING_CONTEXT_MENU_ID);
  } catch (error) {}

  chrome.contextMenus.create({
    title: 'SoundClouDownload all Mp3s',
    contexts: ['page'],
    id: START_DOWNLOADING_CONTEXT_MENU_ID
  });
};

var showStopDownloadingContextMenu = function() {
  try {
    chrome.contextMenus.remove( START_DOWNLOADING_CONTEXT_MENU_ID);
  } catch (error) {}

  chrome.contextMenus.create({
    title: 'Stop SoundClouDownloading',
    contexts: ['page'],
    id: STOP_DOWNLOADING_CONTEXT_MENU_ID
  });
};

var onBeforeRequestHandler = function(details) {
  var mp3 = details.url;

  console.info('Caught request, stopping playback...');

  soundCloudDOMHelper.getPauseButton().click();

  if (downloadedFiles[mp3]) {
    console.info('Already downloaded this song; skipping...');

    return;
  }

  downloadedFiles[mp3] = true;

  console.info('Downloading mp3:', mp3);

  chrome.downloads.download({url: mp3});
};

var startInterceptingMp3Requests = function() {
  chrome.webRequest.onBeforeRequest.addListener(
    onBeforeRequestHandler,
    {urls: ['*://*/*.mp3?*']},
    []);
};

var stopInterceptingMp3Requests = function() {
  chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestHandler);
};

var findAndRestartSoundCloudTabs = function(url) {
  console.log('Looking for SoundCloud tabs...');

  chrome.tabs.query({
    active: true,
    currentWindow: true,
    url: url
  },
  function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];

      console.log('Restarting tab #' + tab.index + ' at ' + tab.url);

      chrome.tabs.executeScript(tab.id, {
        code: 'window.location.reload();'
      });
    }
  });
};

// Helper methods for interacting with SoundCloud DOM
var soundCloudDOMHelper = {
  hasListenContext: function() {
    return this.getListenContext().length > 0;
  },
  getListenContext: function() {
    return $('.sound.single.listenContext');
  },
  getPlayButton: function() {
    return this.getListenContext().find('button[title="Play"]');
  },
  getPauseButton: function() {
    return this.getListenContext().find('button[title="Pause"]');
  }
};

showStartDownloadingContextMenu();

chrome.contextMenus.onClicked.addListener(
  function(data) {
    if (data.menuItemId === START_DOWNLOADING_CONTEXT_MENU_ID) {
      showStopDownloadingContextMenu();
      startInterceptingMp3Requests();
      findAndRestartSoundCloudTabs(data.pageUrl);

    } else if (data.menuItemId === STOP_DOWNLOADING_CONTEXT_MENU_ID) {
      showStartDownloadingContextMenu();
      stopInterceptingMp3Requests();
    }
  });
