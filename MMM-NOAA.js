/* Magic Mirror
 * Module: MMM-NOAA
 * By cowboysdude and snille
 */
Module.register("MMM-NOAA", {

    // Module config defaults.
    defaults: {
        updateInterval: 30 * 60 * 1000, // every 10 minutes
        animationSpeed: 0,
        initialLoadDelay: 875, //  delay
        retryDelay: 1500,
        maxWidth: "100%",
        rotateInterval: 20 * 1000,
        apiKey: "",
        pws: "KNYELMIR13",
        lat: "",
        lon: "",
        ampm: true,
        dformat: true,
        showClock: true,
        useAir: false,
        airKEY: "",
        showGreet: false,
        name: "",

        langFile: {
            "en": "en-US",
            "de": "de-DE",
            "sv": "sv-SE",
            "es": "es-ES",
            "fr": "fr-FR",
          "zh_cn": "zh-CN"
        }
    },

    // Define required scripts.
    getScripts: function() {
        return ["moment.js"];
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            sv: "translations/sv.json",
            de: "translations/de.json",
            es: "translations/es.json",
            fr: "translations/fr.json",
          zh_cn: "translations/zh_cn.json"
        };
    },

    getStyles: function() {
        return ["MMM-NOAA.css"];
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);
        this.config.lang = this.config.lang || config.language; //automatically overrides and sets language :)
        this.config.units = this.config.units || config.units;
        this.sendSocketNotification("CONFIG", this.config);

        // Set locale.
        this.url = "http://api.wunderground.com/api/" + this.config.apiKey + "/forecast10day/conditions/q/pws:" + this.config.pws + ".json";
        this.forecast = {};
        this.today = "";
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    processNoaa: function(data) {
        this.current = data.current_observation;
        this.forecast = data.forecast.simpleforecast.forecastday;
        this.loaded = true;
    },

    processSRSS: function(data) {
        this.srss = data.results;
console.log(this.srss);
    },

    processAIR: function(data) {
        this.air = data.data.current.pollution;
console.log(this.air);
    },

    scheduleCarousel: function() {
        console.log("Scheduling rotating Weather forecast...");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
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
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        if (notification === "SRSS_RESULTS") {
            this.processSRSS(payload);
        }
        if (notification === "AIR_RESULTS") {
            this.processAIR(payload);
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

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.classList.add("wrapper");
            wrapper.innerHTML = this.translate("GATHERING WEATHER STUFF");
            wrapper.className = "bright light small";
            return wrapper;
        }

        var current = this.current;

        var d = new Date();
        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var month = d.getUTCMonth() + 1; //months from 1-12
        var day = d.getUTCDate();
        var year = d.getUTCFullYear();
        if (this.config.dformat == true) {
            var newdatea = this.translate(days[d.getDay()]) + " " + month + "/" + day + "/" + year;
        } else {
            var newdatea = this.translate(days[d.getDay()]) + " " + day + "/" + month + "/" + year;
        }
        var n = d.getHours();


        if (this.config.showClock == true) {
            var CurTime = document.createElement("div");
            CurTime.classList.add("large", "fontClock");
            CurTime.innerHTML = this.getTime();
            wrapper.appendChild(CurTime);
        }

        if (this.config.showGreet == true) {
            var Greet = document.createElement("div");
            if (this.config.name != "") {
                if (n < 12) {
                    Greet.classList.add("bright", "medium", "amclock", "imgDesInv2");
                    Greet.innerHTML = this.translate("Good Morning ") + this.config.name + "!";
                } else if (n > 12 && n < 18) {
                    Greet.classList.add("bright", "medium", "eclock", "imgDesInv2");
                    Greet.innerHTML = this.translate("Good Afternoon ") + this.config.name + "!";
                } else if (n > 18 && n < 24) {
                    Greet.classList.add("bright", "medium", "pmclock", "imgDesInv2");
                    Greet.innerHTML = this.translate("Good Evening ") + this.config.name + "!";
                }
            } else {
                if (n < 12) {
                    Greet.classList.add("bright", "medium", "amclock", "imgDesInv2");
                    Greet.innerHTML = this.translate("Good Morning!");
                } else if (n > 12 && n < 18) {
                    Greet.classList.add("bright", "medium", "eclock", "imgDesInv2");
                    Greet.innerHTML = this.translate("Good Afternoon!");
                } else if (n > 18 && n < 24) {
                    Greet.classList.add("bright", "medium", "pmclock", "imgDesInv2");
                    Greet.innerHTML = this.translate("Good Evening!");
                }
            }
            wrapper.appendChild(Greet);
        }

        var CurDate = document.createElement("div");
        CurDate.classList.add("medium", "fontClock");
        CurDate.innerHTML = newdatea;
        wrapper.appendChild(CurDate);

        var crtLogo = document.createElement("div");
        var crtIcon = document.createElement("img");
        crtIcon.classList.add("imgDesInv");
        crtIcon.src = "modules/MMM-NOAA/images/" + current.icon + ".png";
        crtLogo.appendChild(crtIcon);
        wrapper.appendChild(crtLogo);

        var curCon = document.createElement("div");
        curCon.classList.add("xsmall", "bright");
        curCon.innerHTML = this.translate("Currently: ") + current.weather;
        wrapper.appendChild(curCon);


        var cTempHigh = document.createElement("div");
        cTempHigh.classList.add("xsmall", "bright");
        if (this.config.units != "metric") {
            if (current.temp_f > 80) {
                cTempHigh.innerHTML = this.translate("Current Temp: ") + "<font color=#7dfafd>" + Math.round(current.temp_f) + "&#730;</font>";
            } else {
                cTempHigh.innerHTML = this.translate("Current Temp: ") + Math.round(current.temp_f) + "&#730;";
            }
        } else {
            if (current.temp_c > 26) {
                cTempHigh.innerHTML = this.translate("Current Temp: ") + "<font color=#7dfafd>" + Math.round(current.temp_c) + "&#730;</font>";
            } else {
                cTempHigh.innerHTML = this.translate("Current Temp: ") + Math.round(current.temp_c) + "&#730;";
            }
        }
        wrapper.appendChild(cTempHigh);

        var cpCondition = document.createElement("div");
        cpCondition.classList.add("xsmall", "bright");
        if (current.UV >= 0 && current.UV < 3) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#ABFBAE>" + this.translate("Safe") + "</font>";
        } else if (current.UV > 2 && current.UV < 6) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#FDF877>" + this.translate("Moderate") + "</font>";
        } else if (current.UV > 5 && current.UV < 8) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#FECA62>" + this.translate("High") + "</font>";
        } else if (current.UV > 7 && current.UV < 11) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#FE0F0F>" + this.translate("Very High") + "</font>";
        } else if (current.UV >= 11) {
            cpCondition.innerHTML = this.translate("UV Index: ") + current.UV + " ~ <font color=#E6E6FA>" + this.translate("Extreme") + "</font>";
        }
        wrapper.appendChild(cpCondition);

        if (this.config.useAir != false) {
            var aqius = this.air.aqius;
            var aqi = document.createElement("div");
            aqi.classList.add("xsmall", "bright");
            if (aqius < 51) {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#66FF00>" + aqius + "</font>";
            } else if (aqius > 50 && aqius < 101) {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#f2f735>" + aqius + "</font>";
            } else if (aqius > 100 && aqius < 151) {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#f5700c>" + aqius + "</font>";
            } else if (aqius > 150 && aqius < 201) {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#ff1313>" + aqius + "</font>";
            } else {
                aqi.innerHTML = this.translate("Air Quality Index: ") + "<font color=#800000>" + aqius + "</font>";
            }
            wrapper.appendChild(aqi);
        }


        var reHumid = current.relative_humidity.substring(0, 2);
        var ccurHumid = document.createElement("div");
        ccurHumid.classList.add("xsmall", "bright");
        if (reHumid > 80) {
            ccurHumid.innerHTML = this.translate("Humidity: ") + "<b><font color=red>" + current.relative_humidity + "</font></b>";
        } else {
            ccurHumid.innerHTML = this.translate("Humidity: ") + current.relative_humidity;
        }
        wrapper.appendChild(ccurHumid);


        var wind = document.createElement("div");
        wind.classList.add("xsmall", "bright");
        if (this.config.units != "metric") {

            if (current.wind_mph > 0) {
                wind.innerHTML = this.translate("Wind: ") + current.wind_mph + " mph ~ " + this.translate("From: ") + current.wind_dir;
            } else {
                wind.innerHTML = this.translate("Wind: 0");
            }
        } else {
            if (current.wind_kph > 0) {
                wind.innerHTML = this.translate("Wind: ") + current.wind_kph + " kph ~ " + this.translate("From: ") + current.wind_dir;
            } else {
                wind.innerHTML = this.translate("Wind: 0");
            }
        }
        wrapper.appendChild(wind);

        var bP = document.createElement("div");
        bP.classList.add("xsmall", "bright");
        if (current.pressure_trend === "+") {
            bP.innerHTML = "Barometer: " + current.pressure_in + " " + " <img src=modules/MMM-NOAA/images/up.png width=5% height=5%>";
        } else if (current.pressure_trend === "-") {
            bP.innerHTML = "Barometer: " + current.pressure_in + " " + "  <img src=modules/MMM-NOAA/images/down.png width=5% height=5%>";
        } else {
            bP.innerHTML = "Barometer: " + current.pressure_in + " " + "  <img src=modules/MMM-NOAA/images/even.png width=5% height=5%>";
        }
        wrapper.appendChild(bP);

       var srss = this.srss;

        var date = new Date(null);
        date.setSeconds(srss.day_length);
        var dayLength = date.toISOString().substr(11, 8);
        var longpieces = dayLength.toString().split(":");
        var dHours = longpieces[0];
        var dMins = longpieces[1];

        var Dlength = document.createElement("div");
        Dlength.classList.add("xsmall", "bright", "font");
        Dlength.innerHTML = this.translate("Amount of <font color=yellow>Daylight</font>");
        wrapper.appendChild(Dlength);

        var Tlength = document.createElement("div");
        Tlength.classList.add("xsmall", "bright");
        Tlength.innerHTML = dHours + " " + this.translate(" hours ") + " " + dMins + " " + this.translate(" minutes ") + "<br><br>";
        wrapper.appendChild(Tlength);



        if (this.config.lat != "" && this.config.lon != "") {
            
            var sunrise = srss.sunrise;
            var sunset = srss.sunset;
            var utcsunrise = moment.utc(sunrise).toDate();
            var utcsunset = moment.utc(sunset).toDate();
            var sunrise = this.config.ampm == true ? moment(utcsunrise).local().format("h:mm A") : moment(utcsunrise).local().format("h:mm");
            var sunset = this.config.ampm == true ? moment(utcsunset).local().format("h:mm A") : moment(utcsunset).local().format("h:mm");


            var Rdate = document.createElement("div");
            if (n < 12) {
                Rdate.classList.add("bright", "small", "amclock", "imgDesInv2");
            } else if (n > 12 && n < 21) {
                Rdate.classList.add("bright", "small", "eclock", "imgDesInv2");
            } else {
                Rdate.classList.add("bright", "small", "pmclock", "imgDesInv2");
            }
            Rdate.innerHTML = "<img src='modules/MMM-NOAA/images/sunrise1.png' width=10%; height=10%;> " + sunrise + " &nbsp;&nbsp;&nbsp;<img src='modules/MMM-NOAA/images/sunset1.png' width=10%; height=10%;> " + sunset + "<br><br>";
            wrapper.appendChild(Rdate);
        }




        var keys = Object.keys(this.forecast);
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }
            var noaa = this.forecast[keys[this.activeItem]];

            var sDiv = document.createElement("div");
            sDiv.classList.add("small", "bright");
            sDiv.innerHTML = this.translate("~~~ Forecast ~~~<br/>");
            wrapper.appendChild(sDiv);

            var newDate = document.createElement("div");
            newDate.classList.add("xsmall", "bright", "font");
            var myDate = this.translate(noaa.date.weekday) + " " + noaa.date.month + "/" + noaa.date.day + "/" + noaa.date.year;
            newDate.innerHTML = myDate;
            wrapper.appendChild(newDate);

            var artLogo = document.createElement("div");
            var artIcon = document.createElement("img");
            artIcon.classList.add("imgDesInv");
            artIcon.src = "modules/MMM-NOAA/images/" + noaa.icon + ".png";
            artLogo.appendChild(artIcon);
            wrapper.appendChild(artLogo);

            var UpCondition = document.createElement("div");
            UpCondition.classList.add("xsmall", "bright", "font");
            UpCondition.innerHTML = this.translate(noaa.conditions);
            wrapper.appendChild(UpCondition);

            var TempHigh = document.createElement("div");
            TempHigh.classList.add("xsmall", "bright", "font");
            if (this.config.units != "metric") {
                TempHigh.innerHTML = this.translate("High: ") + noaa.high.fahrenheit + "&#730; &nbsp;&nbsp;&nbsp;" + this.translate("Low: ") + noaa.low.fahrenheit + "&#730;";
            } else {
                TempHigh.innerHTML = this.translate("High: ") + noaa.high.celsius + "&#730; &nbsp;&nbsp;&nbsp;" + this.translate("Low: ") + noaa.low.celsius + "&#730;";
            }
            wrapper.appendChild(TempHigh);

            var CurHumid = document.createElement("div");
            CurHumid.classList.add("xsmall", "bright", "font");
            CurHumid.innerHTML = this.translate("Humidity: ") + noaa.avehumidity + "%";
            wrapper.appendChild(CurHumid);


        }
        return wrapper;
    },

});
