var START_DOWNLOAD_CONTEXT_MENU = 'startDownloadingContextMenu';

var showStartDownloadingContextMenu = function() {
  chrome.contextMenus.create({
    title: 'Download SoundCloud track',
    contexts: ['page'],
    id: START_DOWNLOAD_CONTEXT_MENU,
    documentUrlPatterns: ['*://soundcloud.com/*']
  });
};

var onBeforeRequestHandler = function(details) {
  var mp3 = details.url;

  console.info('Downloading mp3:', mp3);

  chrome.downloads.download({url: mp3});

  stopInterceptingMp3Requests();
};

var startInterceptingMp3Requests = function() {
  console.info('Registering Mp3 intercept handler');

  chrome.webRequest.onBeforeRequest.addListener(
    onBeforeRequestHandler,
    {urls: ['*://*/*.mp3?*']},
    []);
};

var stopInterceptingMp3Requests = function() {
  console.info('Removing Mp3 intercept handler');

  chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestHandler);
};

showStartDownloadingContextMenu();

chrome.contextMenus.onClicked.addListener(
  function(menuItem, tab) {
    if (menuItem.menuItemId === START_DOWNLOAD_CONTEXT_MENU) {
      startInterceptingMp3Requests();

      chrome.tabs.executeScript(tab.id, {
        code: 'window.location.reload();'
      });
    }
  });
