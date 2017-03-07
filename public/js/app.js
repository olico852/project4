// // save data from an object into cookies
// document.cookie = JSON.stringify(cookiesData)
//
// // loads data from all cookies into an object if cookie exists
// if (document.cookie) cookiesData = JSON.parse(document.cookie)

var Interactor=function(a){this.__init__(a)};Interactor.prototype={__init__:function(a){var b=this;return b.interactions="boolean"!=typeof a.interactions||a.interactions,b.interactionElement="string"==typeof a.interactionElement?a.interactionElement:"interaction",b.interactionEvents=Array.isArray(a.interactionEvents)===!0?a.interactionEvents:["mouseup","touchend"],b.conversions="boolean"!=typeof a.conversions||a.conversions,b.conversionElement="string"==typeof a.conversionElement?a.conversionElement:"conversion",b.conversionEvents=Array.isArray(a.conversionEvents)===!0?a.conversionEvents:["mouseup","touchend"],b.endpoint="string"==typeof a.endpoint?a.endpoint:"/interactions",b.async="boolean"!=typeof a.async||a.async,b.debug="boolean"!=typeof a.debug||a.debug,b.records=[],b.session={},b.loadTime=new Date,b.__initializeSession__(),b.__bindEvents__(),b},__bindEvents__:function(){var a=this;if(a.interactions===!0)for(var b=0;b<a.interactionEvents.length;b++)for(var c=a.interactionEvents[b],d=document.getElementsByClassName(a.interactionElement),e=0;e<d.length;e++)d[e].addEventListener(c,function(b){b.stopPropagation(),a.__addGueInteraction__(b,"interaction")});if(a.conversions===!0)for(var b=0;b<a.conversionEvents.length;b++)for(var c=a.conversionEvents[b],d=document.getElementsByClassName(a.conversionElement),e=0;e<d.length;e++)d[e].addEventListener(c,function(b){b.stopPropagation(),a.__addGuestInteraction__(b,"conversion")});return window.onbeforeunload=function(b){a.__sendGuestInteractions__()},a},__addGuestInteraction__:function(a,b){var c=this,d={type:b,event:a.type,targetTag:a.target.nodeName,targetClasses:a.target.className,content:a.target.innerText,clientPosition:{x:a.clientX,y:a.clientY},screenPosition:{x:a.screenX,y:a.screenY},createdAt:new Date};return c.records.push(d),c.debug&&(c.__closeSession__(),console.log("Session:\n",c.session)),c},__initializeSession__:function(){var a=this;return a.session={loadTime:a.loadTime,unloadTime:new Date,language:window.navigator.language,platform:window.navigator.platform,port:window.location.port,clientStart:{name:window.navigator.appVersion,innerWidth:window.innerWidth,innerHeight:window.innerHeight,outerWidth:window.outerWidth,outerHeight:window.outerHeight},page:{location:window.location.pathname,href:window.location.href,origin:window.location.origin,title:document.title},endpoint:a.endpoint},a},__closeSession__:function(){var a=this;return a.session.unloadTime=new Date,a.session.interactions=a.records,a.session.clientEnd={name:window.navigator.appVersion,innerWidth:window.innerWidth,innerHeight:window.innerHeight,outerWidth:window.outerWidth,outerHeight:window.outerHeight},a},__sendGuestInteractions__:function(){var a=this,b=new XMLHttpRequest;return a.__closeSession__(),b.open("POST",a.endpoint,a.async),b.setRequestHeader("Content-Type","application/json; charset=UTF-8"),b.send(JSON.stringify(a.session)),a}};


// Mobile Detection Method
window.ismobile = function() {
    var mobile = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return mobile;
};

// Setup Events by Device Type
if (window.ismobile()) {
    var interactionEventsArray = ["touchend"],
        conversionEventsArray = ["touchstart"];
} else {
    var interactionEventsArray = ["mouseup"],
        conversionEventsArray = ["mousedown"];
}

// Initialize Interactor
var interactor = new Interactor({
    interactions            : true,
    interactionElement      : "interaction",
    interactionEvents       : interactionEventsArray,
    conversions             : true,
    conversionElement       : "conversion",
    conversionEvents        : conversionEventsArray,
    endpoint                : '/usage/interactions',
    async                   : true,
    debug                   : true
});

// Empty Data Model for VM Initialization
var model       = {
    interactions    : [
        {
            type            : "",
            event           : "",
            targetTag       : "",
            targetClasses   : "",
            content         : "",
            clientPosition  : {
                x               : 0,
                y               : 0
            },
            screenPosition  : {
                x               : 0,
                y               : 0
            },
            createdAt       : ""
        }
    ],
    conversions     : [
        {
            type            : "",
            event           : "",
            targetTag       : "",
            targetClasses   : "",
            content         : "",
            clientPosition  : {
                x               : 0,
                y               : 0
            },
            screenPosition  : {
                x               : 0,
                y               : 0
            },
            createdAt        : ""
        }
    ],
    loadTime        : "",
    unloadTime      : "",
    language        : "",
    platform        : "",
    port            : "",
    clientStart     : {
        name            : "",
        innerWidth      : 0,
        innerHeight     : 0,
        outerWidth      : 0,
        outerHeight     : 0
    },
    clientEnd       : {
        name            : "",
        innerWidth      : 0,
        innerHeight     : 0,
        outerWidth      : 0,
        outerHeight     : 0
    },
    page            : {
        location        : "",
        href            : "",
        origin          : "",
        title           : ""
    },
    endpoint        : ""
};

// Bind GuestInteraction & Conversion Classes to VM Update
var buttons = document.querySelectorAll(".interaction, .conversion");

// Mapping for GuestInteractions & Conversions Array
var mapping = {
    'interactions': {
        key: function (data) {
            return ko.utils.unwrapObservable(data.id);
        }
    },
    'conversions': {
        key: function (data) {
            return ko.utils.unwrapObservable(data.id);
        }
    }
}

// Map ViewModel
var viewmodel = ko.mapping.fromJS(model, mapping);

// Apply Bindings
ko.applyBindings(viewmodel, document.getElementById("wrapper"));

// Init Session Data
ko.mapping.fromJS(interactor.session, viewmodel);

// Update View Model on Button Click
var historydata = document.querySelector(".history-data");
for(var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function (e) {
        ko.mapping.fromJS(interactor.session, viewmodel);
        historydata.style.display = "block";
    });
}


// function saveIt(searchTerms) {
// var x = document.forms['searchBox'].words.value
//   console.log('x is ', x);
//   if (!x) {
//   } else {
//     createCookie(searchTerms, x, 10)
//   }
// }
//
// function createCookie(name, value, days)
// {
//   if (days) {
//     var date = new Date();
//     date.setTime(date.getTime()+(days*24*60*60*1000));
//     var expires = "; expires="+date.toGMTString();
//     }
//   else var expires = "";
//   document.cookie = name+"="+value+expires+"; path=/";
// }
//
// function readCookie(name)
// {
//   var ca = document.cookie.split(';');
//   var nameEQ = name + "=";
//   for(var i=0; i < ca.length; i++) {
//     var c = ca[i];
//     while (c.charAt(0)==' ') c = c.substring(1, c.length); //delete spaces
//     if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
//     }
//   return null;
// }
//
// function eraseCookie(name)
// {
//   createCookie(name, "", -1);
// }
