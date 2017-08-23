// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


/**
 * RIGHT NOW must load it manually the first time and put the frame in the window URL
 *
 */
// TODO:??? I could potentially make all this work in a background process and just prompt user for username and password at the start
// TODO: even better, I could ask for course id too and do everything in background :)

var numberOfRefreshes = 0;
var numberOfExpirations = 0;

chrome.alarms.create("5min", {
    delayInMinutes: 1,
    periodInMinutes: 1
});
chrome.extension.getBackgroundPage().console.log('Alarm loaded');
//chrome.storage.sync.set({'EMPLID': null,'ENRL_REQUEST_ID': null, 'STRM':null},function () {});
var strm = 0

// get STRM value as message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "worktimer-notification")
      chrome.notifications.create('worktimer-notification', request.options, function() { });
    if ('options' in request){
        strm = request.options.message

        chrome.storage.sync.set({'STRM': strm}, function () {
            chrome.extension.getBackgroundPage().console.log("Saving STRM");
        });
        console.log("Loaded STRM and will use for reload")
    }


    sendResponse();
});


chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "5min") {
        chrome.storage.sync.get({'STRM':null}, function (data) {
            strm = data['STRM'];
            //chrome.extension.getBackgroundPage().console.log('Attempting EMPLID retrieval %s', empId);

            do_page_refresh(strm)
        });
    }

});

function do_page_refresh(strm) {

    var bkg = chrome.extension.getBackgroundPage();

    bkg.console.log("strm=" + strm);

    var baseURL = "https://cs.oasis.asu.edu/psc/asucsprd_ss/EMPLOYEE/PSFT_ASUCSPRD/c/SA_LEARNER_SERVICES.SSR_SSENRL_CART.GBL?STRM=" + strm +"&ACAD_CAREER=GRAD&Page=SSR_SSENRL_ADD&Action=A&INSTITUTION=ASU00&golink=Y"
    /*var baseURL = 'https://cs.oasis.asu.edu/psc/asucsprd_ss/EMPLOYEE/PSFT_ASUCSPRD/c/' +
                    'SA_LEARNER_SERVICES.SSR_SSENRL_ADD.GBL?Page=SSR_SSENRL_ADD_C&Action=U&ACAD_CAREER=GRAD&' +
                    'EMPLID=' + empId + '&INSTITUTION=ASU00&STRM=' + strm +
                    '&TargetFrameName=None'*/

    // loop through all windows and tabs looking for page to reload
    chrome.windows.getAll(null, function (wins) {
        for (var j = 0; j < wins.length; ++j) {
            chrome.tabs.getAllInWindow(wins[j].id, function (tabs) {

                //bkg.console.log(tabs)
                for (var i = 0; i < tabs.length; ++i) {

                    if ((tabs[i].url.indexOf("oasis.asu.edu/addclass/") > -1)
                        || (tabs[i].url.indexOf("SA_LEARNER_SERVICES.SSR_SSENRL_ADD.GBL") > -1)) {

                        chrome.tabs.update(tabs[i].id, {url: baseURL});
                        numberOfRefreshes = numberOfRefreshes + 1;
                        bkg.console.log("number of refreshes of class add page: %d for strm=%s", numberOfRefreshes, strm);
                    }
                    if (tabs[i].url.indexOf("cmd=expire") > -1) {
                        chrome.tabs.update(tabs[i].id, {url: baseURL});
                        numberOfExpirations = numberOfExpirations + 1;
                        bkg.console.log("number of resets after expiration: %d for strm=%s", numberOfExpirations, strm);
                    }

                }
            });
        }
    });

}



/*
function saveValues(href){
    chrome.extension.getBackgroundPage().console.log(href);

        var url = new URL(href);
        var save_data = {}
        if (href.indexOf('EMPLID') > -1 ) {
            save_data['EMPLID'] = url.searchParams.get("EMPLID");
        } else{
            return;
        }
        if (href.indexOf('ENRL_REQUEST_ID') > -1 ) {
            save_data['ENRL_REQUEST_ID'] = url.searchParams.get("ENRL_REQUEST_ID");
        } else{
            return;
        }
        if (href.indexOf('STRM') > -1 ) {
            save_data['STRM'] = url.searchParams.get("STRM");
        } else{
            return;
        }

        chrome.extension.getBackgroundPage().console.log(save_data)

        chrome.storage.sync.set(save_data, function () {
            chrome.extension.getBackgroundPage().console.log("Saving data");
        });

        //found = true;

}*/
// this code should grab employee id (aka student id) the first time and save it.
/*chrome.storage.sync.get({'EMPLID': null,'ENRL_REQUEST_ID': null, 'STRM':null}, function (data) {
    var empId = data['EMPLID'];
    var enrollRequestId = data['ENRL_REQUEST_ID'];
    var strm = data['STRM'];

    //if (empId === null || enrollRequestId === null || strm === null) {
    var found = false;
    chrome.extension.getBackgroundPage().console.log(empId, enrollRequestId, strm);

    // iterate through all windows and tabs
    // always update values if found in URL
    chrome.windows.getAll(null, function (wins) {
        for (var j = 0; j < wins.length; ++j) {
            chrome.tabs.getAllInWindow(wins[j].id, function (tabs) {
                for (var i = 0; i < tabs.length; ++i) {
                    if (tabs[i].url.indexOf("asu.edu") > -1 && found === false) {
                        //chrome.extension.getBackgroundPage().console.log(tabs[i])
                        saveValues(tabs[i].url)

                       /!* chrome.storage.sync.set(save_data, function () {
                            chrome.extension.getBackgroundPage().console.log("Attempting to save EMPLID ");
                        });*!/

                        //found = true;
                    }

                }
            });
        }
    });


});*/

/*chrome.browserAction.onClicked.addListener(function(tab) {
 chrome.tabs.executeScript(null, {
 code: "document.forms[0]['q'].value='Hello World!'"
 })
 });
 // When the extension is installed or upgraded ...
 chrome.runtime.onInstalled.addListener(function() {
 // Replace all rules ...
 chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
 // With a new rule ...
 chrome.declarativeContent.onPageChanged.addRules([
 {
 // That fires when a page's URL contains a 'g' ...
 conditions: [
 new chrome.declarativeContent.PageStateMatcher({
 pageUrl: { urlContains: 'g' },
 })
 ],
 // And shows the extension's page action.
 actions: [ new chrome.declarativeContent.ShowPageAction() ]
 }
 ]);
 });
 });*/