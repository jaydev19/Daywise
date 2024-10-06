chrome.runtime.onInstalled.addListener(() => {
    console.log('To-Do List Manager installed');
  });
  
  function sendNotification(title, message) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon_128.png',
      title: title,
      message: message,
      priority: 2,
    });
  }
  
  
  chrome.alarms.create('reminder', { delayInMinutes: 1 }); 
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'reminder') {
      sendNotification('Task Reminder', 'You have tasks to complete!');
    }
  });
  