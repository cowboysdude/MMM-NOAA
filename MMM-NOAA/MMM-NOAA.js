/* Magic Mirror
 * Module: MMM-NOAA
 * By cowboysdude and snille 
        modified by barnosch
 */
var c = 0;
var l = 1;
var loco = "";

Module.register("MMM-NOAA", {

    // Module config defaults.
    defaults: {
        updateInterval: 10 * 60 * 1000, // every 10 minutes
        animationSpeed: 0,
        initialLoadDelay: 8000,
        maxWidth: "100%",
        apiKey: "",
        airKey: "",
	loco1: "Erdweg",
	loco2: "New York",
	loco3: "brrrrrrr",
	pws: "XXX",
	pws1: "KNYELMIR13",
	pws2: "KNYELMIR13",
	pws3: "KNYELMIR13",

        langFile: {
            "en": "en-US",
            "de": "de-DE",
            "sv": "sv-SE",
            "es": "es-ES",
            "fr": "fr-FR",
            "zh_cn": "zh-CN",
            "da": "da",
            "nl": "nl-NL",
            "nb": "nb-NO"
        },


        langTrans: {
            "en": "EN",
            "de": "DL",
            "sv": "SW",
            "es": "SP",
            "fr": "FR",
            "zh_cn": "CN",
            "da": "DK",
            "nl": "NL",
            "nb": "NO",
        },

	levelTrans: {
        	"1":"green",
		"2":"yellow",
		"3":"orange",
		"4":"red",
	}				

    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            da: "translations/da.json",
            sv: "translations/sv.json",
            de: "translations/de.json",
            es: "translations/es.json",
            fr: "translations/fr.json",
            zh_cn: "translations/zh_cn.json",
            nl: "translations/nl.json",
            nb: "translations/nb.json"
        };
    },

    getUrl: function() {
        var url = null;
        var days = this.config.days;
        var lang = this.config.langTrans[config.language];

        url = "http://api.wunderground.com/api/" + this.config.apiKey + "/forecast/lang:" + lang + "/conditions/q/pws:" + this.config.pws + ".json";

        return url;

    },


    getStyles: function() {
        return ["MMM-NOAA.css", "weather-icons.css"];
    },
    getScripts: function() {
        return ["moment.js"];
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.config.lang = this.config.lang || config.language; //automatically overrides and sets language :)
        this.config.units = this.config.units || config.units;
        this.sendSocketNotification("CONFIG", this.config);

        // Set locale.  
        var lang = this.config.langTrans[config.language];
	l = 1;
	loco = this.config.loco1;
	this.config.pws = this.config.pws1;
        this.url = this.getUrl();
        this.forecast = {};
        this.air = {};
        this.srss = {};
        this.alert = [];
	this.amess = [];
        this.map = [];
        this.city = {};
        this.clphase = {};
        this.current = {};
        this.today = "";
        this.scheduleUpdate();
    },


    processNoaa: function(data) {
	c = 0;
        this.current = data.current_observation;
        this.forecast = data.forecast.simpleforecast.forecastday;
        this.city = this.current.display_location.city;
    },

    processSRSS: function(data) {
        this.srss = data.results;
    },

    processAIR: function(data) {
        this.air = data.data.current.pollution;
    },

    processAlert: function(data) {
	this.alert = data;
	this.amess[c] = this.alert;
	c = c + 1;
    },

    processMoon: function(data) {
        this.moon = data;
        console.log(this.moon);
    },

    secondsToString: function(seconds) {
        var srss = this.srss.day_length;
        var numhours = Math.floor((srss % 86400) / 3600);
        var numminutes = Math.floor(((srss % 86400) % 3600) / 60);
        if (numminutes > 0) {
            return numhours + this.translate(" hours ") + numminutes + this.translate(" minutes ");
        } else {
            return numhours + this.translate(" hours ");
        }
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getNOAA();
        }, this.config.updateInterval);
        this.getNOAA(this.config.initialLoadDelay);
    },

    getNOAA: function() {
        this.sendSocketNotification("GET_NOAA", this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "NOAA_RESULT") {
            this.processNoaa(payload);
        }
        if (notification === "SRSS_RESULTS") {
            this.processSRSS(payload);
        }
        if (notification === "AIR_RESULTS") {
            this.processAIR(payload);
        }
        if (notification === "ALERT_RESULTS") {
            this.processAlert(payload);
        }
        if (notification === "MAP_RESULTS") {
            this.processMap(payload);
        }

        this.updateDom(this.config.animationSpeed);
    },

    /////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_NOAA') {
            this.hide(100);
            this.updateDom(300);
        } else if (notification === 'SHOW_NOAA') {
            this.show(1000);
            this.updateDom(300);
        }
    },

    getTime: function() {
        var format = config.timeFormat;
        var location = config.language;
        var langFile = this.config.langFile;

        var time = new Date();
        if (format === 12) {
            time = time.toLocaleString(langFile[location], {
                hour: "numeric",
                minute: "numeric",
                hour12: true
            });
        } else {
            time = time.toLocaleString(langFile[location], {
                hour: "numeric",
                minute: "numeric",
                hour12: false
            });
        }
        return time;
    },

    secondsToString: function(seconds) {
        var srss = this.srss.day_length;
        var numhours = Math.floor((srss % 86400) / 3600);
        var numminutes = Math.floor(((srss % 86400) % 3600) / 60);
        if (numminutes > 0) {
            return numhours + ":" + numminutes;
        } else {
            return numhours + this.translate(" hours ");
        }
    },

    doact: function() {
		l = l + 1;
		if (l == 4) {l = 1};
		var lang = this.config.langTrans[config.language];

		switch (l) {
		case 1:
			loco = this.config.loco1;
			this.config.pws = this.config.pws1;
			break;
		case 2:
			loco = this.config.loco2;
			this.config.pws = this.config.pws2;
			break;
		case 3:
			loco = this.config.loco3;
			this.config.pws = this.config.pws3;
			break;
		}
		this.url = "http://api.wunderground.com/api/" + this.config.apiKey + "/forecast/lang:" + lang + "/conditions/q/pws:" + this.config.pws + ".json";
	        this.sendSocketNotification("CONFIG", this.config);
		this.getNOAA();
		this.updateDom(300);	
	},

    getDom: function() {


        var wrapper = document.createElement("div");

	var loc = document.createElement("div");
	loc.innerHTML = loco;
	loc.style.cursor = "pointer";
	loc.className = "button";
	loc.addEventListener("click", () => this.doact());
	wrapper.appendChild(loc);


        var current = this.current;

        var d = new Date();
        var n = d.getHours();

        var curCon = document.createElement("div");
        curCon.classList.add("small", "bright", "img");
        curCon.setAttribute('style', 'line-height: 105%;');
        if (n < 18 && n > 6) {
            curCon.innerHTML = current.weather + "<img class = 'icon2' src='modules/MMM-NOAA/images/" + current.icon + ".png'>";
        } else {
            curCon.innerHTML = current.weather + "<img class = 'icon2' src='modules/MMM-NOAA/images/nt_" + current.icon + ".png'>";
        }
        wrapper.appendChild(curCon);

        var cur = document.createElement("div");
        cur.classList.add("large", "bright");
        cur.setAttribute('style', 'line-height: 5%;');
        cur.setAttribute("style", "padding-bottom:15px;");
	if (this.config.units != "metric") {
		if (current.temp_f > 80) {
			cur.innerHTML = "<font color=#7dfafd>" + Math.round(current.temp_f) + "&deg;";
		} else {
			ccur.innerHTML = Math.round(current.temp_f) + "&deg;";
		}
	} else {
		if (current.temp_c > 26) {
			cur.innerHTML = "<font color=#7dfafd>" + Math.round(current.temp_c) + "&deg;";
		} else {
			cur.innerHTML = Math.round(current.temp_c) + "&deg;";
		}
	}
        wrapper.appendChild(cur);

        var top = document.createElement("div");

        var weatherTable = document.createElement("table");
        weatherTable.classList.add("table");
 
        var hRow = document.createElement("tr");
        var hsecond = document.createElement("th");
        hsecond.setAttribute("colspan", 4);
        hsecond.setAttribute("style", "text-align:center");
        hsecond.classList.add("rheading");
        hsecond.innerHTML = this.translate("Atmospheric Conditions");
        hRow.appendChild(hsecond);
        weatherTable.appendChild(hRow);

        var forecastRow = document.createElement("tr");

        var second = document.createElement("th");
        var tempSymbol = document.createElement("i");
        tempSymbol.classList.add("wi", "wi-humidity", "font", "fontac");
        second.appendChild(tempSymbol);
        forecastRow.appendChild(second);


        var third = document.createElement("th");
        var currentHSymbol = document.createElement("i");
        currentHSymbol.classList.add("wi", "wi-barometer", "font", "fontac");
        third.appendChild(currentHSymbol);
        forecastRow.appendChild(third);

        var fourth = document.createElement("th");
        var currentWindSymbol = document.createElement("i");
        currentWindSymbol.classList.add("wi", "wi-day-fog", "font", "fontac");
        fourth.appendChild(currentWindSymbol);
        forecastRow.appendChild(fourth);

        weatherTable.appendChild(forecastRow);


        console.log(current);

        var TDrow = document.createElement("tr");
        TDrow.classList.add("xsmall", "bright");
        TDrow.setAttribute('style', 'line-height: 30%;');

        var td2 = document.createElement("td");
        td2.innerHTML = current.relative_humidity;
        TDrow.appendChild(td2);
        weatherTable.appendChild(TDrow);

        var td3 = document.createElement("td");
	if (this.config.units != "metric") {
	        if (current.pressure_trend != 0) {
        	    td3.innerHTML = current.pressure_in + " " + current.pressure_trend;
	        } else {
        	    td3.innerHTML = current.pressure_in + " S";
	        }
	} else {
        	if (current.pressure_trend != 0) {
	            td3.innerHTML = current.pressure_mb + " " + current.pressure_trend + " hPa";
	        } else {
	            td3.innerHTML = current.pressure_mb + " ~ hPa";
        	}
	}
        TDrow.appendChild(td3);
        weatherTable.appendChild(TDrow);

        var td5 = document.createElement("td");
        td5.innerHTML = current.visibility_mi;
        TDrow.appendChild(td5);
        weatherTable.appendChild(TDrow);


        top.appendChild(weatherTable);
        wrapper.appendChild(top);

        var SSRow = document.createElement("tr");
        var jumpy = document.createElement("th");
        jumpy.setAttribute("colspan", 4);
        jumpy.classList.add("rheading");
        jumpy.innerHTML = this.translate("Sunrise/Sunset");
        SSRow.appendChild(jumpy);
        weatherTable.appendChild(SSRow);

        var midRow = document.createElement("tr");


        var sunup = document.createElement("th");
        var SUSymbol = document.createElement("i");
        SUSymbol.classList.add("wi", "wi-sunrise", "font", "fontss");
        sunup.appendChild(SUSymbol);
        midRow.appendChild(sunup);


        var dayHour = document.createElement("th");
        dayHour.classList.add("xsmall", "bright", "fontss");
        dayHour.innerHTML = this.translate("Hours of Light");
        midRow.appendChild(dayHour);

        var sunDown = document.createElement("th");
        var SDSymbol = document.createElement("i");
        SDSymbol.classList.add("wi", "wi-sunset", "font", "fontss");
        sunDown.appendChild(SDSymbol);
        midRow.appendChild(sunDown);

        weatherTable.appendChild(midRow);

        var srss = this.srss;
        var sunrise = srss.sunrise;
        var sunset = srss.sunset;
        var utcsunrise = moment.utc(sunrise).toDate();
        var utcsunset = moment.utc(sunset).toDate();
        var sunrise = this.config.ampm == true ? moment(utcsunrise).local().format("h:mm A") : moment(utcsunrise).local().format("H:mm");
        var sunset = this.config.ampm == true ? moment(utcsunset).local().format("h:mm A") : moment(utcsunset).local().format("H:mm");


        var Midrow = document.createElement("tr");
        Midrow.classList.add("xsmall", "bright");
        Midrow.setAttribute('style', 'line-height: 30%;');

        var SU = document.createElement("td");
        SU.innerHTML = sunrise;
        Midrow.appendChild(SU);
        weatherTable.appendChild(Midrow);

        var DL = document.createElement("td");
        DL.innerHTML = this.secondsToString();
        Midrow.appendChild(DL);
        weatherTable.appendChild(Midrow);

        var SD = document.createElement("td");
        SD.innerHTML = sunset;
        Midrow.appendChild(SD);
        weatherTable.appendChild(Midrow);

        weatherTable.appendChild(Midrow);

        var CRow = document.createElement("tr");
        var ccolumn = document.createElement("th");
        ccolumn.setAttribute("colspan", 4);
        ccolumn.classList.add("rheading");
        ccolumn.innerHTML = this.translate("AQI/UV/Wind");
        CRow.appendChild(ccolumn);
        weatherTable.appendChild(CRow);

        var otherRow = document.createElement("tr");

        var airq = document.createElement("th");
        var aqSymbol = document.createElement("i");
        aqSymbol.classList.add("wi", "wi-smoke", "font", "fontauw");
        airq.appendChild(aqSymbol);
        otherRow.appendChild(airq);

        var uvcol = document.createElement("th");
        var uvSymbol = document.createElement("i");
        uvSymbol.classList.add("wi", "wi-day-sunny", "font", "fontauw");
        uvcol.appendChild(uvSymbol);
        otherRow.appendChild(uvcol);

        var windcol = document.createElement("th");
        var currentWindSymbol = document.createElement("i");
        currentWindSymbol.classList.add("wi", "wi-strong-wind", "font", "fontauw");
        windcol.appendChild(currentWindSymbol);
        otherRow.appendChild(windcol);

        weatherTable.appendChild(otherRow);

        var nextRow = document.createElement("tr");
        nextRow.classList.add("xsmall", "bright");


        var aqius = this.air.aqius;
        var aqicol = document.createElement("td");
        aqicol.innerHTML = aqius;
        nextRow.appendChild(aqicol);
        weatherTable.appendChild(nextRow);

        var uvcol = document.createElement("td");
        uvcol.innerHTML = current.UV;
        nextRow.appendChild(uvcol);
        weatherTable.appendChild(nextRow);

        var wincol = document.createElement("td");
        wincol.innerHTML = current.wind_mph;
        nextRow.appendChild(wincol);
        weatherTable.appendChild(nextRow);

        weatherTable.appendChild(nextRow);
        wrapper.appendChild(weatherTable);

        ////// FORECAST ROWS ///////////////////////////////// 

        var ForecastTable = document.createElement("table");
        ForecastTable.classList.add("table")
        ForecastTable.setAttribute('style', 'line-height: 20%;');


        var FCRow = document.createElement("tr");
        var jumpy = document.createElement("th");
        jumpy.setAttribute("colspan", 4);
        jumpy.classList.add("rheading");
        jumpy.innerHTML = this.translate("4 Day Forecast");
        FCRow.appendChild(jumpy);
        ForecastTable.appendChild(FCRow);

        var d = new Date();
        var weekday = new Array(7);
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

        var n = this.translate(weekday[d.getDay()]);


        var nextRow = document.createElement("tr");
        for (i = 0; i < this.forecast.length; i++) {
            var noaa = this.forecast[i];
            var wdshort = document.createElement("td");
            wdshort.classList.add("xsmall", "bright");
            wdshort.setAttribute("style", "padding:11px");
            if (this.translate(noaa.date.weekday_short) == n) {
                wdshort.innerHTML = this.translate("Today");
            } else {
                wdshort.innerHTML = this.translate(noaa.date.weekday_short);
            }
            nextRow.appendChild(wdshort);
            ForecastTable.appendChild(nextRow);
        }

        var foreRow = document.createElement("tr");
        for (i = 0; i < this.forecast.length; i++) {
            var noaa = this.forecast[i];
            var fore = document.createElement("td");

            fore.setAttribute("colspan", "1");
            fore.innerHTML = "<img src='modules/MMM-NOAA/images/" + noaa.icon + ".png' height='22' width='28'>";
            foreRow.appendChild(fore);
            ForecastTable.appendChild(foreRow);
        }

        var tempRow = document.createElement("tr");
        for (i = 0; i < this.forecast.length; i++) {
            var noaa = this.forecast[i];
            var temper = document.createElement("td");
            temper.setAttribute("colspan", "1");
            temper.classList.add("xsmall", "bright");
            if (this.config.units != "metric") {
              temper.innerHTML = noaa.high.fahrenheit + "/" + noaa.low.fahrenheit;
	    } else {
              temper.innerHTML = noaa.high.celsius + "/" + noaa.low.celsius;
	    }
            tempRow.appendChild(temper);
            ForecastTable.appendChild(tempRow);

        }

        wrapper.appendChild(ForecastTable);

        //////////////////END FORECAST ROWS///////////////////////

	var alert = this.amess[0];

	if (c != 0){			
			
		var Alert = [];
		var Level = [];
	        var ATable = document.createElement("table");
	        ATable.classList.add("table")
	        ATable.setAttribute('style', 'line-height: 20%;');
	        var aFCRow = document.createElement("tr");
	        var ajumpy = document.createElement("th");
	        ajumpy.setAttribute("colspan", 4);
	        ajumpy.setAttribute("style", "text-align:center");
	        ajumpy.classList.add("rheading");
	        ajumpy.innerHTML = this.translate("Weather Warning");
	        aFCRow.appendChild(ajumpy);
	        ATable.appendChild(aFCRow);
 
		for(var i = 0; i < c; i++){

			var alert = this.amess[i];
			Alert[i] = document.createElement("th");
			Alert[i].classList.add("bright", "xsmall");
		        Alert[i].setAttribute("style", "line-height: 170%;");
			Alert[i].innerHTML = "<marquee scrollamount="+"20"+" scrolldelay="+"300"+"><font color=" + this.config.levelTrans[alert.level] +">" + alert.desc + "</marquee><br>";
			ATable.appendChild(Alert[i]);
		}
		wrapper.appendChild(ATable);

	}


	if (this.config.timeFormat === 12) {
	        var doutput = moment().format("MM/DD/YYYY");
        	var tinput = document.lastModified;
	        var toutput = (moment(tinput.substring(10, 16), 'HH:mm').format('hh:mm a'));
	} else {
	        var doutput = moment().format("DD/MM/YYYY");
        	var tinput = document.lastModified;
	        var toutput = (moment(tinput.substring(10, 16), 'HH:mm').format('HH:mm'));
	}
        var mod = document.createElement("div");
        mod.classList.add("xxsmall", "bright");
        mod.setAttribute('style', 'line-height: 170%;');
        mod.innerHTML = "[" + this.translate("Last Updated") + ": " + doutput + " " + toutput + "]";
        wrapper.appendChild(mod);
        return wrapper;
    },
});
