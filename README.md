# MMM-NOAA

**Weather for your mirror**
  Also UV index and Air Quality Index.  [Warning AQI may not work in all areas if not then disable see config options].

## Examples

![](en.png) ![](fr.png) ![](es.png) ![](sv.png) ![](de.png) ![](cn.png)

If you do not enter a name in the config.js file it will just say either "Good Morning", "Good Afternoon" or "Good Evening".   With a name.  **** NEW UPDATE:  loads in 1/2 the time, new config options and different format! **** [See image above]

## Your terminal installation instructions

* `git clone https://github.com/cowboysdude/MMM-NOAA` into the `~/MagicMirror/modules` directory.

* Run `npm install` in the `~MagicMirror/modules/MMM-NOAA` directory.

## Get your free API key here

https://www.wunderground.com/weather/api

* Select the middle plan

## Get your PWS from here

 https://www.wunderground.com/wundermap
 
 * For your config.js entry for precise localized weather 

## Config.js entry and options

Will automatically select translation file and either F or C by reading your defaults from the config.js file [at the top]
Will default to EN if NO translation file is found.

    {
        disabled: false,
        module: 'MMM-NOAA',
        position: 'top_right',
        config: {
		apiKey: "YOUR API KEY",          // https://www.wunderground.com/weather/api  select the middle plan... 
		useAir: false,             //set to false if you do not want to use Air Quality Index
		airKey: "YOUR API KEY",  //IF you want Air Quality Index
		pws: "KNYELMIR13",       // go here to find your pws: https://www.wunderground.com/wundermap
		lat: "42.089796",        // need this for sunrise/sunset  if left blank none will show  -- find them here: http://www.latlong.net/
		lon: "-76.807734",       // need this for sunrise/sunset  if left blank none will show
		showClock: true,            //Hides or shows clock
		dformat: true,             //for M/D/YYYY format, false for D/M/YYYY
		format: "12",             // 12 or 24 hour format.. will default to 12 hour if none selected.
		ampm: true,                 //to show AM and PM on Sunrise/Sunset time
		showGreet: false,          //deafult is false - to show greeting under clock and above date
		name: "",                  // Your name
		showWind: false,
		showDate: false,
	}
    },
	
## Start your mirror . . . enjoy! 
