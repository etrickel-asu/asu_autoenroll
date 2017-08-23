// this does automatic login, it isn't totally necessary but 
// it is nice when you get logged out.  
var loginAttempts = 0;
var enrollAttempts = 0;
var my_pw = "super_secret_password"
var username = "etrickel"


function getAllFrames(win, urls) {
    try {
        if (win.frames.length > 0) {
            urls.push(win.location.href);
            return getAllFrames(win.frames[0], urls)
        } else {
            urls.push(win.location.href);
        }
    } catch (e) {
        console.log(e)
    }


    return urls
}

// get STRM from sub-frame and send to background page for reloading
if (window.location.href.indexOf("go.oasis.asu.edu/addclass") > -1) {
    allFrames = getAllFrames(window, [])


    for (var i = 0; i < allFrames.length; i++) {
        fr = allFrames[i];
        if (fr.indexOf("STRM") > -1) {
            var url = new URL(fr);
            var strm = url.searchParams.get("STRM")

            chrome.runtime.sendMessage({type: "notification", options: {
                type: "basic",
                title: "Test",
                message: strm
            }});

        }

    }

}

var s = document.createElement('script');
//console.log("adding 2nd script")
s.src = chrome.extension.getURL('script.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);


