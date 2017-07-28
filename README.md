# MMM-NOAA

**Weather for your mirror**

## Examples

![](fun.png), ![](c.png),

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

    {
        disabled: false,
        module: 'MMM-NOAA',
        position: 'top_right',
        config: {
            apiKey: "YOUR API KEY",          // https://www.wunderground.com/weather/api  select the middle plan... 
			maxWidth: "100%",        // Suggest leaving it at 100%
			show: "F",               // "F" = Fahrenheit info / "C" = Celsius info
			pws: "KNYELMIR13",       // go here to find your pws: https://www.wunderground.com/wundermap
			lat: "42.089796",        // need this for sunrise/sunset  if left blank none will show  -- find them here: http://www.latlong.net/
			lon: "-76.807734",       // need this for sunrise/sunset  if left blank none will show
        }
    },
	
## Start your mirror . . . enjoy!
