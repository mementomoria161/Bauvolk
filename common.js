/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// GENERAL ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////




// GENERAL VARIABLES

var TIMEOUT_IDS = []


// COMPONENT LOADING

var componentsloaded = 0
var componentsneeded = 0

var LOADED = {              // SEQUENCE MATTERS
    controls: {
        init: false,
        func: init_controls,
    },
    databanner: {
        init: false,
        func: init_cookies,
    },
    footer: {
        init: false,
        func: init_footer,
    },
    header: {
        init: false,
        func: init_header,
    }
}


function load_components(components) {
	componentsneeded = components.length
	
	for (let i = 0; i < components.length; i++) {
		fetchHTML("components/" + components[i] + ".html", components[i])
	}
}


async function fetchHTML(URL, ID) {
	fetch(URL)
	.then(response => response.text())
	.then(value => {loadElement(ID, value)});
}


function loadElement(ID, HTML) {
        
    if (document.readyState == "loading") {
        setTimeout(loadElement, 20, ID, HTML);
    }
    else {
        document.getElementById(ID).innerHTML = HTML
        LOADED[ID].init = true;

        componentsloaded++
        if(componentsloaded >= componentsneeded) {
			init()
		}
    }
}


// INIT

function init() {

    if(typeof pre_init  === "function") {
        pre_init()
    }

    for (let key in LOADED) {
        if(LOADED[key].init) {
            LOADED[key].func()
        }      
    }

    init_scrollbar()
    init_language()
    init_pwa()
    init_options()
    set_audio_positions()

    if(typeof suf_init  === "function") {
        suf_init()
    }

    history.pushState({}, '', window.location.href)
    show_body()
}


function init_header() {
    init_abo()
    init_highlights()
    window.addEventListener("resize", openmenufix)
    document.getElementById("header").addEventListener("pointerleave", pointer_close_menu)
}


function init_footer() {
    create_layout_list()
    limit_buttons(layoutCurrent, LAYOUT_LIST, "to-top", "to-bottom")
    document.getElementById("content").addEventListener("scroll", autosetlayout)
    init_footnotes()
}


window.onpopstate = function(event){

    if(fullscreen_menu && window.innerWidth < 800) {
        event.preventDefault()
        history.pushState({}, '', window.location.href)
        history.forward()
        close_menu()
    }
    else if(INDEX_OPEN){
        event.preventDefault()
        history.pushState({}, '', window.location.href)
        history.forward()
        hide_slide_index()
    }
    else {
        history.back()
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// PWA ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var PWA_PROMPT;

window.addEventListener('beforeinstallprompt', (e) => {
    document.getElementById('install-app').style.display = "inline";
    PWA_PROMPT = e;
});

function init_pwa() {
    document.getElementById('install-app').addEventListener('click', async () => {
        if (PWA_PROMPT !== null) {
            PWA_PROMPT.prompt();
            const { outcome } = await PWA_PROMPT.userChoice;
            if (outcome === 'accepted') {
                PWA_PROMPT = null;
                document.getElementById('install-app').style.display = "none";
            }
        }
    });

    // document.getElementById("notifications").addEventListener("click", () => {
    //     Notification.requestPermission().then((result) => {
    //         if (result === "granted") {
    //             issue_notification("ISSUE I", "A new ISSUE has just been released!", "https://bauvolk.org/images/issues/issue-i-illustration.WebP");
    //         }
    //     });
    // });
}



// function issue_notification(issue, body, img) {
//     let options = {
//       body: body,
//       icon: img,
//     };
//     new Notification(issue, options);
//     setTimeout(issue_notification, 30000);
// }


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////// SCROLL & WINDOW /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// SCROLLBAR FOR INDEX

function init_scrollbar() {
    document.getElementById("content").addEventListener("scroll", () => {
        reset_scrollbar('--scrollbar-color', '--color-text', "scrollbar", 3000)
    });

    if(document.getElementById("slide-index")) {
        document.getElementById("slide-index").addEventListener("scroll", () => {
            reset_scrollbar('--scrollbar-color-index', '--color-text-index', "scrollbar_index", 10000)
        })
    }
}

function init_progressbar() {
    document.getElementById("content").addEventListener("scroll", progressbar)
}

function progressbar() {
    let content = document.getElementById("content");
    let viewHeight = content.getBoundingClientRect().height;
    let scroll = content.scrollTop;
    let height = content.scrollHeight - viewHeight;
    let progress = Math.min((scroll / height) * 100, 100);

    document.documentElement.style.setProperty('--progress-var', "-webkit-linear-gradient(left, white, white " + progress + "%, #750000 " + progress + "%, #750000 100%)");
}

function reset_scrollbar(color_var, color_default, timeoutID, time) {

    color_default = getComputedStyle(document.documentElement).getPropertyValue(color_default)
    document.documentElement.style.setProperty(color_var, color_default);

    clearTimeout(TIMEOUT_IDS[timeoutID])
    TIMEOUT_IDS[timeoutID] = setTimeout(hide_scrollbar, time, color_var);
}



function hide_scrollbar(color_var) {
    document.documentElement.style.setProperty(color_var, 'transparent');
}



function reset_scroll() {
    document.getElementById("content").scrollTop = 0;
    document.documentElement.scrollTop = 0;
    setTimeout(hide_scrollbar, 1, '--scrollbar-color');
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// LIB ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// RESSETTING

function limit_buttons(current, list, first, last) {
    
    if (current==0) {
        disable(first)
    }
    else {
        enable(first)
    }
    
    if (current>=list.length-1) {
        disable(last)
    }
    else {
        enable(last)
    }
}

function disable(element) {
    element = document.getElementById(element)
    element.disabled = true;
    element.style.color = "lightgrey";
}

function enable(element) {
    element = document.getElementById(element)
    element.disabled = false;
    element.style.color = "white";
}


// OPTIONS

function init_options() {
    let options = document.getElementsByClassName("option")

    for (let i = 0; i < options.length; i++)
    {
        options[i].addEventListener("click", reset_selection)
    }
}

function reset_selection() {
    window.getSelection().removeAllRanges();
}


// SCROLLING

function smooth_scroll(ID) {
    document.getElementById(ID).scrollIntoView({behavior: 'smooth'})
}



// ID CREATION

function makeid(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (let i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
}



// VIDEO PAUSER

function pause_videos() {
	var frames = document.getElementsByTagName("iframe")

	for (let i = 0; i < frames.length; i++)
	{
        if(frames[i].getAttribute('data-source') == "youtube") {
            frames[i].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
        }
	}
}



// DISPLAY BODY

function show_body() {
    let bodyelements = document.body.children
    
    for (let i = 0; i < bodyelements.length; i++) {
        bodyelements[i].style.visibility = "visible"
        // console.log(bodyelements[i])
    }
}



// STRING EDITING

const SUPERSCRIPT_LIST = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹']

function tosuperscript(num) {
    num = num.toString()
    let nums = num.split('')

    for (let i = 0; i < nums.length; i++){
        nums[i] = SUPERSCRIPT_LIST[nums[i]]
    }

    return nums.join()
}

function remove_after(string, character) {
    if(string.includes(character)) {
        string = string.slice(0, string.indexOf(character))
    }
}



// SHARE LINK


function share(button, index, language) {
    if ('share' in navigator) {
        share_api(index, language, button)
    } 
    else {
        copy_link(button, SHARE_DATA[index].url)
    }
}

async function share_api(index, language, button) {
    
    let share_source = SHARE_DATA[index]
    let share_object = {}
    share_object.url = share_source.url

    if(language == "de") {
        share_object.title = share_source.title_de
        share_object.text = share_source.abstract_de
    }
    else if(language == "en") {
        share_object.title = share_source.title_en
        share_object.text = share_source.abstract_en
    }
    else {
        copy_link(button, SHARE_DATA[index].url)
    }


    try {
        await navigator.share(share_object);
    } catch (err) {
        console.log(err)
    }
}

function copy_link(button, url) {

    navigator.clipboard.writeText(url);

    if(button.getAttribute("data-text-replaced") == "true") {return}
    
    let textOriginal = button.innerHTML
    let textReplace = '<span lang="de">Link kopiert!</span><span lang="en">Copied link!</span>'

    button.innerHTML = textReplace;
    button.setAttribute("data-text-replaced", "true")

    setTimeout(function(){
        button.innerHTML = textOriginal;
        button.setAttribute("data-text-replaced", "")
        reset_language()
    }, 3000);

    reset_language()
}






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////// BACK-END ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////







/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////// LANGUAGE ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function init_language() {

    reset_language()

    if(typeof seteagerload === "function") {
        document.getElementById("lang-de").addEventListener("click", seteagerload);
        document.getElementById("lang-en").addEventListener("click", seteagerload);
    }
}


function reset_language() {
    if(localStorage.getItem("bauvolk_language") == null){
        localStorage.setItem("bauvolk_language", "de")
    }
    
	set_language(localStorage.getItem("bauvolk_language"))
}


function set_language(language) {
	document.querySelectorAll('[lang="de"], [lang="en"]').forEach((item) => {item.hidden = true;})
    document.querySelectorAll('#lang-de, #lang-en').forEach((item) => {item.style.textDecoration = "none";})
	document.getElementById("lang-" + language).style.textDecoration = "underline"
	document.querySelectorAll('*:lang(' + language + '):not(br)').forEach((item) => {item.hidden = false;})

    if(META && META[language]) {
        document.title = META[language]
    }
    
    stop_audio()
	localStorage.setItem("bauvolk_language", language);
}






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// COOKIES ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////



var datainfoshown = false;

function init_cookies() {
    
    if(localStorage.getItem("bauvolk_cookies") == "true"){
        showcookiecontent();
    }
    else {
        hidecookiecontent();
    }
    
}

function cookies(choice) {
    document.getElementById("databanner").style.display = "none";

    if(choice) {
        localStorage.setItem("bauvolk_cookies", choice);
    }

    init_cookies();
}


function show_databanner() {
    document.getElementById("databanner").style.display = "block";
}


// CLEARING

window.addEventListener("beforeunload", clear_cookies_third_party);


function clear_cookies_third_party() {

    let fpcookies = {}

    for (let [key, value] of Object.entries(localStorage)) {
        if(key.includes("bauvolk_")) {fpcookies[key] = value}    
    }

    clear_cookies()

    for (let [key, value] of Object.entries(fpcookies)) {
        localStorage.setItem(key, value)
    }
}


function clear_cookies() {
    sessionStorage.clear();
    localStorage.clear();

    var cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}


// SHOWING/HIDING COOKIECONTENT

function showcookiecontent() {
    var frames = document.getElementsByTagName("iframe")
    
    for (let i = 0; i < frames.length; i++)
    {
        let frame = frames[i]

        if(frame.getAttribute('data-source') == "youtube") {
            frame.style.display = "none"
            frame.frameborder = "0"
            frame.title = "YouTube video player"
            frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            frame.setAttribute('allowfullScreen', '')

            let thumbnail = document.createElement("img")

            thumbnail.src = "https://img.youtube.com/vi/" + frame.getAttribute('data-id') + "/mqdefault.jpg"
            thumbnail.classList.add("thumbnail");
            thumbnail.classList.add(frame.className);

            frame.parentNode.insertBefore(thumbnail, frame)
        }
        else if(frame.getAttribute('data-source') == "spotify") {
            frame.removeAttribute("sandbox")
            frame.width = "700"
            frame.height = "232"
            frame.style.borderRadius = "12px"
            frame.frameborder = "0"
            frame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            frame.setAttribute('allowfullScreen', '')
            frame.src = "https://open.spotify.com/embed/episode/" + frame.getAttribute('data-id') + "?utm_source=generator&theme=0"
            frame.style.display = "block"
        }
        else if(frame.getAttribute('data-source') == "spotify-playlist") {
            frame.removeAttribute("sandbox")
            frame.width = "700"
            frame.height = "700"
            frame.style.borderRadius = "12px"
            frame.frameborder = "0"
            frame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            frame.setAttribute('allowfullScreen', '')
            frame.src = "https://open.spotify.com/embed/playlist/" + frame.getAttribute('data-id') + "?utm_source=generator&theme=1"
            frame.style.display = "block"
        }
        else {
            frame.removeAttribute("sandbox")
            frame.frameborder = "0"
            frame.src = frame.innerHTML
            frame.innerHTML = ""
            frame.style.display = "block"
        }
    }
    
    var cookiedisclaimers = document.getElementsByClassName("cookiedisclaimer")

    for (let i = 0; i < cookiedisclaimers.length; i)
    {
        cookiedisclaimers[i].remove();
    }

    datainfoshown = false;
    clear_cookies_third_party()

    if(document.getElementById("slides")){load_slide_frames()}
}



function hidecookiecontent() {
    
    if(datainfoshown) {return}
        
    var frames = document.getElementsByTagName("iframe")
    
    for (let i = 0; i < frames.length; i++)
    {
        var cookiedisclaimer = document.createElement("span");
        cookiedisclaimer.innerHTML = "<span lang='de'>Dieser Inhalt erfordert die <span style='text-decoration: underline; cursor: pointer;' onclick='show_databanner()'>Zustimmung zu Cookies</span>.</span><span lang='en'>This content requires your <span style='text-decoration: underline; cursor: pointer;' onclick='show_databanner()'>consent to the use of cookies</span>.</span>";
        cookiedisclaimer.className = "cookiedisclaimer";
        
        frames[i].style.display = "none"
        frames[i].parentNode.insertBefore(cookiedisclaimer, frames[i])
        
        datainfoshown = true;
    }
}


// FRAME LOADING

function load_slide_frames() {
    load_frame(document.getElementById(SLIDE_LIST[slide_current]).getElementsByTagName("iframe"), 0, slide_current)
}


function load_frame(frames, current, slide) {
    if(localStorage.getItem("bauvolk_cookies") == "true" && current < frames.length && slide == slide_current) {

        if(frames[current].getAttribute('data-source') == "youtube" && frames[current].getAttribute('data-loaded') != "true") {
            let frame = frames[current]
            let thumbnail = frame.previousSibling
            
            frame.removeAttribute("sandbox")

            if(frame.getAttribute('data-list') !== null) {
                frame.src = "https://www.youtube-nocookie.com/embed/" + frame.getAttribute('data-id') + "?modestbranding=1&enablejsapi=1" + "?list=" + frame.getAttribute('data-list')
            }
            else if (frame.getAttribute('data-timestamp') !== null){
                frame.src = "https://www.youtube-nocookie.com/embed/" + frame.getAttribute('data-id') + "?modestbranding=1&enablejsapi=1" + "?t=" + frame.getAttribute('data-timestamp')
            }
            else {
                frame.src = "https://www.youtube-nocookie.com/embed/" + frame.getAttribute('data-id') + "?modestbranding=1&enablejsapi=1"
            }
            
            frame.onload = function(){
                thumbnail.remove();
                frame.style.display = "block"
                frame.setAttribute('data-loaded', 'true')
                load_frame(frames, current + 1 , slide)
            };
            
        }
        else {
            // if( frames[current].getAttribute('data-loaded') == "true") {
            //     console.log("skipped load - was loaded")
            // }
            load_frame(frames, current + 1 , slide)
        }
    }
    // else if(slide != slide_current) {
    //     console.log("load aborted")
    // }
    clear_cookies_third_party()
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// AUDIO //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////




function set_audio_positions() {
    let audios = document.getElementsByTagName("audio");
    for (let i = 0; i < audios.length; i++ ) {
        audios[i].currentTime = localStorage.getItem("bauvolk_audio_" + audios[i].src);
    }
}


window.addEventListener("beforeunload", save_audio_positions);

function save_audio_positions() {
    let audios = document.getElementsByTagName("audio");
    for (let i = 0; i < audios.length; i++ ) {
        localStorage.setItem("bauvolk_audio_" + audios[i].src, audios[i].currentTime);
    }
}


function stop_audio() {
    let audios = document.getElementsByTagName("audio");
    for (let i = 0; i < audios.length; i++ ) {
        audios[i].pause();
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////// ABO //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// ABO LIB

const MAIL_MSG = {
    "subscribe": {
        initial: {msg: '<span lang="de">Abonnieren</span><span lang="en">Subscribe</span>', disabled: false, func: null},
        success: {msg: '<span lang="de">Abonniert!</span><span lang="en">Subscribed!</span>', disabled: true, func: reset_mail_info},
        error: {msg: '<span lang="de">FEHLER!</span><span lang="en">ERROR!</span>', disabled: false, func: null}
    },
    "unsubscribe": {
        initial: {msg: '<span lang="de">Deabonnieren</span><span lang="en">Unsubscribe</span>', disabled: false, func: null},
        success: {msg: '<span lang="de">Deabonniert.</span><span lang="en">Unsubscribed.</span>', disabled: true, func: null},
        error: {msg: '<span lang="de">FEHLER!</span><span lang="en">ERROR!</span>', disabled: false, func: null}
    },
    "confirm": {
        initial: {msg: '', disabled: false, func: null},
        success: {msg: '<span lang="de">Deine E-mail wurde erfolgreich bestätigt!</span><span lang="en">Your E-Mail has been confirmed successfully!</span>', disabled: true, func: null},
        error: {msg: '<span lang="de">Etwas ist bei der Bestätigung schiefgelaufen.<br>Bitte versuche es noch einmal, oder schreibe Nachricht an <a href="mailto:BAUVOLK@riseup.net">BAUVOLK@riseup.net</a></span><span lang="en">Something went wrong during the confirmation process.<br>Please try again, or message us at <a href="mailto:BAUVOLK@riseup.net">BAUVOLK@riseup.net</a></span>', disabled: false, func: null}
    },
    "order": {
        initial: {msg: '<span lang="de">Bestellen & Bezahlen</span><span lang="en">Order & Pay</span>', disabled: false, func: null},
        success: {msg: '<span lang="de">Bestellen & Bezahlen</span><span lang="en">Order & Pay</span>', disabled: false, func: null},
        error: {msg: '<span lang="de">FEHLER!</span><span lang="en">ERROR!</span>', disabled: false, func: null}
    }
}

function change_text(element, type, variation) {
    
    let settings = MAIL_MSG[type][variation]
    
    element.innerHTML = settings.msg;

    if(settings.disabled) {
        element.disabled = settings.disabled;
    }

    if(settings.func) {
        settings.func();
    }

    reset_language() //needed bc it changes DOM
}


function make_table(data) {
    let table = {}

    for (let [key, value] of data) {
        table[key] = value
    }

    return table
}


function fetch_mail(content, element, type) {
    
    fetch("https://formsubmit.co/ajax/6d2bd15bcc3410a47e44b78943d390d0", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(content)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            change_text(element, type, "success")
        })
        .catch(error => {
            console.log(error);
            change_text(element, type, "error")
        });
}


// ABO

function submit_email(event) {
	event.preventDefault()
    console.log(event.target)
    
    let data = new FormData(event.target)
    data.append('Code', makeid(40));
    let button = event.target.getElementsByClassName("email-btn")[0]
    fetch_mail(make_table(data), button, "subscribe")
}


function remove_email(event) {
    event.preventDefault()

    let data = new FormData(event.target)
    let button = event.target.getElementsByClassName("email-btn")[0]
    fetch_mail(make_table(data), button, "unsubscribe")
}


function confirm_email(event) {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    
    let table = {}
    table["Code"] = params.code;
    table["_subject"] = "Bestätigungsmail"
    table["_captcha"] = true
    table["_template"] = "box"

    let element = document.getElementById("email-confirm-info")
    fetch_mail(table, element, "confirm")
}


function input_remove_email() {
    let element = document.getElementById("email-deabo-btn")
    change_text(element, "unsubscribe", "initial")
}

function input_mail(element) {
    let form = element.parentElement.parentElement.parentElement
    let mail_info = form.getElementsByClassName("mail-info")[0]
    let mail_button = form.getElementsByClassName("email-btn")[0]
    let mail_checkbox = form.getElementsByClassName("mail-checkbox")[0]

    change_text(mail_button, "subscribe", "initial")

    if(element.value == "") {
        mail_checkbox.checked = false
	    mail_info.style.display = "none"
    }
    else {
        mail_button.disabled = false
	    mail_info.style.display = "block"
    }
}

// EMAIL INFO

function reset_mail_info() {
    document.querySelectorAll(".mail-checkbox").forEach((item) => {item.checked = false})
    document.querySelectorAll(".mail-info").forEach((item) => {item.style.display = "none"})
}

// SWITCH ABO TYPE

function init_abo() {
    if(localStorage.getItem("bauvolk_abo") == null) {localStorage.setItem("bauvolk_abo", "email")}
	set_abo(localStorage.getItem("bauvolk_abo"))

    // LISTENERS

    document.querySelectorAll(".email-form").forEach((item) => {item.addEventListener('submit', function(event){submit_email(event)})})
    document.querySelectorAll(".email-form").forEach((item) => {item.addEventListener('input',  function(event){input_mail(event.target)})})
    
    if(document.getElementById("email-deabo-form")) {
        document.getElementById("email-deabo-form").addEventListener('submit', function(event){remove_email(event)})
        document.getElementById("email-deabo-form").addEventListener('input', input_remove_email);
    }
}

function set_abo(type) {

    document.querySelectorAll(".email-form").forEach((item) => {item.style.display = "none"})
    document.querySelectorAll(".telegram-form").forEach((item) => {item.style.display = "none"})
    document.querySelectorAll(".instagram-form").forEach((item) => {item.style.display = "none"})

    document.querySelectorAll(".email-opt").forEach((item) => {item.style.textDecoration = "none"})
    document.querySelectorAll(".telegram-opt").forEach((item) => {item.style.textDecoration = "none"})
    document.querySelectorAll(".instagram-opt").forEach((item) => {item.style.textDecoration = "none"})

    document.querySelectorAll("." + type + "-form").forEach((item) => {item.style.display = "flex"})
    document.querySelectorAll("." + type + "-opt").forEach((item) => {item.style.textDecoration = "underline"})

	localStorage.setItem("bauvolk_abo", type);	
}

const MAX_FONT_SIZE = 26

function fit_font_size(input) {
    
    if(is_overflown(input)) {
        while (is_overflown(input)){
            if(font_size <= 12) {break}
            font_size--
            input.style.fontSize = font_size + 'px'
        }
    } 
    else {
        font_size = MAX_FONT_SIZE;
        input.style.fontSize = font_size + 'px'

        while (is_overflown(input)){
            if(font_size <= 12) {break}
            font_size--
            input.style.fontSize = font_size + 'px'
        }
    }	
  }
  
  function is_overflown(element) {
    console.log(element.scrollWidth, element.clientWidth)
      return element.scrollWidth > element.clientWidth;
  }




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////// NAV //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// MENUS /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// DROPMENU

var menu_open = false;
var fullscreen_menu = false
var windowwidth = window.innerWidth;


function openmenufix() {
	if (window.innerWidth!=windowwidth) {

		windowwidth = window.innerWidth;

		close_menu()

		if (window.innerWidth <= 800 && !menu_open) {
			document.getElementById("openmenu").style.display = "inline";
		}
		else {
			document.getElementById("openmenu").style.display = "none";
		}
	}
}


function check_menu_origin(origin) {
    if(origin.getElementsByClassName("dropanchor").length == 0  || origin.getElementsByClassName("dropmenu").length == 0) {
        origin = origin.parentElement
        return check_menu_origin(origin)
    }
    else {
        return origin
    }
}


function open_menu(ID) {
    
    document.getElementById("menu-area").style.display = "block";
    // document.getElementById("menu-expanded").style.display = "none";
    document.getElementById("menu-issues").style.display = "none";
    document.getElementById("menu-kanon").style.display = "none";
    document.getElementById("menu-etc").style.display = "none";

    document.getElementById("menu-area").style.width = document.getElementById("headerbox").offsetWidth

    if(ID == "expanded") {
        // document.getElementById("menu-expanded").style.display = "block";
        document.getElementById("menu-etc").style.display = "flex";
    }
    else {
        document.getElementById(ID).style.display = "flex";
    }

    if (window.innerWidth <= 800) {
        // document.getElementById("content").style.display = "none"; 
        // if(document.getElementById("footer")) {
        //     document.getElementById("footer").style.display = "none";
        // }
        // if(document.getElementById("databanner")) {
        //     document.getElementById("databanner").style.display = "none";
        // }
		// document.getElementById("logo").style.display = "none";
        document.getElementById("openmenu").style.display = "none";
		document.getElementById("closemenu").style.display = "inline";
        fullscreen_menu = true
    }

    menu_open = true
}

function close_menu() {
    document.getElementById("menu-area").style.display = "none";
    document.getElementById("menu-issues").style.display = "none";
    document.getElementById("menu-kanon").style.display = "none";
    document.getElementById("menu-etc").style.display = "none";


    if (window.innerWidth <= 800) {
		document.getElementById("closemenu").style.display = "none";
		document.getElementById("openmenu").style.display = "inline";
	}

    fullscreen_menu = false
	menu_open = false
}

function pointer_close_menu() {
    if (window.innerWidth > 800) {
        for (let value of ["email-input", "mail-checkbox", "email-btn"]) {

            if(document.getElementById("header").getElementsByClassName(value)[0] === document.activeElement) {return}
        }

        close_menu()
    }
}

// NAVIGATION HIGHLIGHT

const highlights = {
    "": ["highlight-issues", "highlight-issues-expanded"],
    "/": ["highlight-issues", "highlight-issues-expanded"],
    "/heft-i": ["highlight-issues", "highlight-issues-expanded"],
    "/kanon": ["highlight-kanon", "highlight-kanon-expanded"],
    "/deabonnieren": ["etc"],
    "/impressum": ["etc", "highlight-impressum"],
    "/datenschutz": ["etc", "highlight-datenschutz"],
}


function init_highlights() {

    let window_url = window.location.href.toLowerCase()

    remove_after(window_url, "#")
    remove_after(window_url, "?")

    for (let [URLsnippet, IDs] of Object.entries(highlights)) {
        if (window_url == ("https://www.bauvolk.org" + URLsnippet).toLowerCase()) {
            for (let i = 0; i < IDs.length; i++ ) {
                console.log("window: " + window_url + "   snippet: " + URLsnippet + " -> " + IDs[i])

                let element = document.getElementById(IDs[i])
                // element.style.fontWeight = "700"
                element.style.textDecoration = "underline";  
            }
            return
        }
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// VERTICAL NAVIGATION ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var LAYOUT_LIST = []

function create_layout_list() {
    let sections = document.getElementById("content").children

    for (let i = 0; i < sections.length; i++ ) {
        LAYOUT_LIST.push(sections[i].id)
    }
}

var layoutCurrent = 0

function hoch() {

    if(layoutCurrent > 0) {
        layoutCurrent = layoutCurrent - 1
        smooth_scroll(LAYOUT_LIST[layoutCurrent])
        limit_buttons(layoutCurrent, LAYOUT_LIST, "to-top", "to-bottom")
    }
}

function runter() {

    if(layoutCurrent < LAYOUT_LIST.length - 1) {
        layoutCurrent = layoutCurrent + 1
        smooth_scroll(LAYOUT_LIST[layoutCurrent])
        limit_buttons(layoutCurrent, LAYOUT_LIST, "to-top", "to-bottom")
    }
}


function autosetlayout() {
	
	let scrollmargin = 150
    let scrollheight = document.getElementById("content").scrollTop
    let offsetheight = document.getElementById("content").offsetHeight

    layoutCurrent = 0;

    for (let i = 0; i < LAYOUT_LIST.length; i++) {

        let offsetTop = document.getElementById(LAYOUT_LIST[i]).offsetTop

        if(scrollheight >= offsetTop - scrollmargin || scrollheight >= offsetTop - offsetheight && i == LAYOUT_LIST.length - 1){
            layoutCurrent = i;
        }

    }

    limit_buttons(layoutCurrent, LAYOUT_LIST, "to-top", "to-bottom")
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////// CONTROLS //////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// INIT

var SLIDE_LIST = []
var slide_current = 0

function init_controls() {
    let slidesList = document.getElementById("slides").children
    for (let i = 0; i < slidesList.length; i++) {
        let slideID = 'slide'+ (i+1)
        slidesList.item(i).setAttribute('id', slideID);
        SLIDE_LIST.push(slideID);
    }

    for (let i = 0; i < SLIDE_LIST.length; i++) {

		let slide = document.getElementById(SLIDE_LIST[i])
        let slide_index = document.getElementById('slide-index')

        slide_index.insertAdjacentHTML('beforeend', index_template(slide, i));
    }
    
    display_slide(slide_current)

    if(typeof AUTOHIDE_CONTROLS == "variable") {
        document.getElementById("controls").addEventListener("mousemove", initautohidecontrols)
    }

    document.querySelectorAll("#slide-index, #slide-current, #letztes, #nächstes").forEach((item) => {item.addEventListener("mouseenter", entercontrols)})
    document.querySelectorAll("#slide-index, #slide-current, #letztes, #nächstes").forEach((item) => {item.addEventListener("mouseleave", leavecontrols)})

    update_slide_height()
    window.addEventListener("resize", update_slide_height)
}



function update_slide_height() {
    let interface_height = document.getElementById("navigation").offsetHeight + document.getElementById("controls").offsetHeight + 30
    document.documentElement.style.setProperty('--max-slide-height', 'min(55vh, calc(100vh - ' + interface_height + 'px))'); ;
}







// SLIDE SELECTION

function letztes() {
    if(slide_current>=0) {
        if(typeof display_combined === "function") {
            display_combined(null, slide_current - 1)
        }
        else {
            display_slide(slide_current - 1)
        }
    }
}


function nächstes() {
    if(slide_current<=SLIDE_LIST.length-1) {
        if(typeof display_combined === "function") {
            display_combined(null, slide_current + 1)
        }
        else {
            display_slide(slide_current + 1)
        }
    }
}


function display_slide(slide_index) {

    document.getElementById(SLIDE_LIST[slide_current]).style.display = "none";
    document.getElementById(SLIDE_LIST[slide_index]).style.display = "flex";
    slide_current = slide_index;

    let timeline = document.getElementById(SLIDE_LIST[slide_current]).getElementsByClassName("timeline")[0]
    let timeline_btns = document.getElementById("timeline-btns")
    let timeline_lines = timeline_btns.getElementsByClassName("event-line")

    for (let i = 0; i < timeline_lines.length; i++) {
        timeline_lines[i].style.display = "none"
    }

    if(timeline) {
        if(timeline.hasAttribute("data-timeline-index")) {
            let timeline_index = timeline.getAttribute("data-timeline-index")

            timeline_btns.style.display = "flex"
            timeline_lines[timeline_index].style.display = "flex"
        }
        else {
            timeline_btns.style.display = "none"
        }
    }
    else {
        timeline_btns.style.display = "none"
    }

    if(typeof highlight_title === "function") {
        highlight_title(slide_current)
    }

    if(typeof index_title_template === "function") {
        document.getElementById("slide-title").innerHTML = index_title_template(slide_current)
    }
    
    if(typeof OVERRIDE_TITLE_TEXT !== "undefined") {
        document.getElementById("slide-current").innerHTML = OVERRIDE_TITLE_TEXT
    }
    else {
        document.getElementById("slide-current").innerHTML = (slide_current + 1) + "/" + SLIDE_LIST.length
    }
    

    reset_language()
    load_slide_frames()
    limit_buttons(slide_current, SLIDE_LIST, "letztes", "nächstes")
    reset_scroll()
    pause_videos()
    hide_slide_index()
}


// SLIDE INDEX

var INDEX_OPEN = false

function toggle_slide_index() {
    if(INDEX_OPEN) {
        hide_slide_index()
    } 
    else {
        display_slide_index()
    }
}

function display_slide_index() {
    var indexitems = document.getElementsByClassName("indexitem")
    for (let i = 0; i < indexitems.length; i++) {
        // indexitems[i].style.fontWeight = "400"
        indexitems[i].style.textDecoration = "none"; 
    }

    // document.getElementById("slide-current").disabled = true;
    // document.getElementById("index"+slide_current).style.fontWeight = "700"
    // document.getElementById("index"+slide_current).style.textDecoration = "underline"; 
    document.getElementById("timeline-btns").style.display = "none";
    document.getElementById("slide-title").style.display = "none";
    document.getElementById(SLIDE_LIST[slide_current]).style.display = "none";
    document.getElementById("slide-index").style.display = "flex";

    INDEX_OPEN = true
}

function hide_slide_index() {
    if(document.getElementById(SLIDE_LIST[slide_current]).getAttribute("data-timeline-index")) {
        document.getElementById("timeline-btns").style.display = "flex";
    }

    // document.getElementById("slide-current").disabled = false;
    document.getElementById("slide-title").style.display = "block";
    document.getElementById("slide-index").style.display = "none";
    document.getElementById(SLIDE_LIST[slide_current]).style.display = "flex";
    
    INDEX_OPEN = false
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// AUTO HIDING CONTROLS //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// CONTROL AUTO HIDING


var oncontrols = false;

function initautohidecontrols() {
    document.addEventListener("mousemove", timecontrols);
    document.getElementById("controls").removeEventListener("mousemove", initautohidecontrols);
}

function hidecontrols() {
    document.getElementById("controls-inner").style.visibility = "hidden";
}

// timer start

function timecontrols() {
    if(oncontrols) {return}

    document.getElementById("controls-inner").style.visibility = "visible";
    clearTimeout(TIMEOUT_IDS["controls"])
    TIMEOUT_IDS["controls"] = setTimeout(hidecontrols, 8000);
}

function entercontrols() {
    clearTimeout(TIMEOUT_IDS["controls"])
    oncontrols = true;
}

function leavecontrols() {
    timecontrols();
    oncontrols = false;
}






/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// FUNCTIONALITY /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////// FOOTNOTES ///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function init_footnotes() {
    for (let i = 0; i < FOOTNOTE_LIST.length; i++) {
        document.querySelectorAll("[data-footnote='" + (i+1) + "']").forEach((footnote) => {
            footnote.className = 'footnote';
            footnote.tabIndex = '0'
            footnote.innerHTML = tosuperscript(i+1)
            footnote.addEventListener("mouseenter", selectfootnote)
            footnote.insertAdjacentHTML('beforeend', footnote_template(i));
        })
    }

    if(localStorage.getItem("bauvolk_cookies") != "true"){
        hidecookiecontent();
    }

    window.addEventListener("resize", footnote_horizontal_bounds)
    document.addEventListener("click", focusfootnote)
}

function footnote_template(i) {

    let note_info = FOOTNOTE_LIST[i]
    let note = tosuperscript(i+1) + ' <span lang="de">' + note_info.text_de + '</span><span lang="en">' + note_info.text_en + '</span>'

    if(note_info.embed_source == "youtube" || note_info.embed_source == "spotify") {
        note = note + '<br><br><iframe class="footnotevideo" src="about:blank" data-source=' + note_info.embed_source + ' data-id=' + note_info.embed_id + ' sandbox></iframe>'
    }
    else if (note_info.embed_url){
        note = note + '<br><br><iframe class="footnotevideo" src="about:blank" sandbox loading="lazy">' + note_info.embed_url + '</iframe>'
    }

    return '<span class="note">' + note + '</span>'
}



var footnotefocused = "none";

function focusfootnote(event) {
    if(event.target.className == "footnote") {
        selectfootnote(event)
    }
    else if(footnotefocused != "none") {
        if(!footnotefocused.contains(event.target)) {
            resetfootnote()
            pause_videos();
        }
    }
}

function selectfootnote(event) {

    if(footnotefocused != "none") {
        resetfootnote()
    }

    footnotefocused = event.target;

    footnotefocused.style.color = "#750000";
    
    footnotefocused.childNodes[1].style.zIndex = "19";
    footnotefocused.childNodes[1].style.display = "inline";
    
    footnote_horizontal_bounds() 

    load_frame(footnotefocused.getElementsByTagName("iframe"), 0, slide_current)
}

function resetfootnote() {
    footnotefocused.style.color = "black";

    let note = footnotefocused.childNodes[1]
    note.style.zIndex = "0";
    note.style.display = "none";
    note.style.left = "";
    note.style.right = "";

    footnotefocused = "none";
}

function footnote_horizontal_bounds() {

    if(footnotefocused == "none"){return}
    

    let note = footnotefocused.childNodes[1]

    note.style.left = "";
    note.style.right = "";

    let windowWidth = document.getElementById("content").offsetWidth
    let noteWidth = note.offsetWidth
    let noteY = note.getBoundingClientRect().left
    let noteYoffset = parseInt(getComputedStyle(note).getPropertyValue("left"), 10)
    let margin = 20

    if(windowWidth < 800){
        note.style.left = "";
        note.style.right = "";
    }
    else if(noteY + noteWidth < windowWidth - margin) {
        note.style.left = noteYoffset + "px"
        note.style.right = "unset"
        // console.log("right")
    }
    else if(noteY + 0.5 * noteWidth < windowWidth - margin && (noteY - 2 * noteYoffset - 0.5 * noteWidth) > 0 + margin) {
        note.style.left = -0.5 * noteWidth + "px"
        note.style.right = "unset"
        // console.log("center")
    }
    else if((noteY - 2 * noteYoffset - noteWidth) > 0 + margin) {
        note.style.left = "unset"
        note.style.right = noteYoffset + "px"
        // console.log("left")
    }
}



// var container;
// var scene;
// var camera;
// var renderer;
// var model;
// let isHovering = false;
// let autoRotate = true;
// const ROTATION_SPEED_AUTO = 0.0035;
// const ROTATION_SPEED_AUTO_ADJUSTMENT = 0.005;
// const ROTATION_SPEED_MULTIPLIER = 0.1;
// const ROTATION_SPEED_MULTIPLIER_MOUSE = 0.1
// const ROTATION_SPEED_MULTIPLIER_TOUCH = 0.01
// let targetRotation = { x: 0, y: 0 };
// let currentRotation = { x: 0, y: Math.PI };
// let touchStartX = 0;
// let touchStartY = 0;
// let touchMoveX = 0;
// let touchMoveY = 0;

// function renderer_setup() {
    
//     container = document.getElementById('canvas-container');
//     scene = new THREE.Scene();
//     camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
//     renderer = new THREE.WebGLRenderer({ alpha: true, antialias:true});
//     renderer.setSize(container.clientWidth, container.clientWidth);
//     window.addEventListener("resize", () => { renderer.setSize(container.clientWidth, container.clientWidth); });
//     container.appendChild(renderer.domElement);

//     container.addEventListener('mousemove', (event) => {
//         if (isHovering) {
//             targetRotation.y = model.rotation.y + event.movementX * ROTATION_SPEED_MULTIPLIER_MOUSE;
//             targetRotation.x = model.rotation.x + event.movementY * ROTATION_SPEED_MULTIPLIER_MOUSE;
//         }
//     });

//     container.addEventListener('mouseenter', () => {
//         isHovering = true;
//         autoRotate = false;
//         targetRotation.x = model.rotation.x;
//         targetRotation.y = model.rotation.y;
//     });

//     container.addEventListener('mouseleave', () => {
//         isHovering = false;
//         autoRotate = false;
//     });

//     container.addEventListener('touchstart', (event) => {
//         if (event.touches.length === 1) {
//             touchStartX = event.touches[0].clientX;
//             touchStartY = event.touches[0].clientY;
//             isHovering = true;
//             autoRotate = false;
//         }
//     });

//     container.addEventListener('touchmove', (event) => {
//         if (event.touches.length === 1) {
//             touchMoveX = event.touches[0].clientX;
//             touchMoveY = event.touches[0].clientY;
//             targetRotation.y = model.rotation.y + (touchMoveX - touchStartX) * ROTATION_SPEED_MULTIPLIER_TOUCH;
//             targetRotation.x = model.rotation.x + (touchMoveY - touchStartY) * ROTATION_SPEED_MULTIPLIER_TOUCH;
//             touchStartX = touchMoveX;
//             touchStartY = touchMoveY;
//         }
//     });

//     container.addEventListener('touchend', (event) => {
//         if (event.touches.length === 0) {
//             isHovering = false;
//             autoRotate = false;
//         }
//     });

//     const loader = new GLTFLoader();
//     loader.load(MODEL[localStorage.getItem("bauvolk_language")], (gltf) => {
//         model = gltf.scene;

//         model.traverse((child) => {
//             if (child.isMesh) {
//                 let material = child.material;
//                 if (material.map) {
//                     material.map.generateMipmaps = false;
//                     material.map.magFilter = THREE.LinearFilter;
//                     material.map.minFilter = THREE.LinearFilter;
//                 }
//             }
//         })
        
//         model.scale.set(0.65, 0.65, 0.65);
//         model.rotation.y = Math.PI;
//         scene.add(model);
//     });

//     camera.position.z = 3;
//     const ambientLight = new THREE.AmbientLight(0x404040, 50);
//     scene.add(ambientLight);
//     animate();
// }

// function smoothRotation(current, target, lerpFactor) {
//     return current + (target - current) * lerpFactor;
// }

// function animate() {
//     requestAnimationFrame(animate);

//     if (model) {
//         if (autoRotate) {
//             model.rotation.y += ROTATION_SPEED_AUTO;
//         } else {
//             model.rotation.x = smoothRotation(model.rotation.x, targetRotation.x, ROTATION_SPEED_MULTIPLIER);
//             model.rotation.y = smoothRotation(model.rotation.y, targetRotation.y, ROTATION_SPEED_MULTIPLIER);
//         }

//         if (!isHovering) {
//             autoRotate = true;
//             targetRotation.x = 0;
//             model.rotation.x = smoothRotation(model.rotation.x, targetRotation.x, ROTATION_SPEED_AUTO_ADJUSTMENT);
//         }
//     }

//     renderer.render(scene, camera);
// }
