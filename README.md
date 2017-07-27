# MMM-NOAA
Weather for your mirror

Instructions:

Terminal Window instructions:

    Go to:
    ~MagicMirror/modules
    git clone "https://github.com/cowboysdude/MMM-NOAA"

    Go to:
    ~MagicMirror/modules/MMM-NOAA
     Run:  npm install

    Go to:
     Config.js -- Example config...
     
      Config options:
      apiKey: Get yourself a key here:   https://www.wunderground.com/weather/api
      maxWidth: Suggest leaving it at 100%
      show:  Show F or C Temps and info. 
      
      

            {
            disabled: false,
            module: 'MMM-NOAA',
            position: 'top_right',
            config: {
		  apiKey: "YOUR API KEY",  //https://www.wunderground.com/weather/api  select the middle plan... 
		   maxWidth: "100%",
		   show: "F",
		   place: "NY/Elmira,  //example UK/London
		   lat: "",  //need this for sunrise/sunset  if left blank none will show
		   long: ""   //need this for sunrise/sunset  if left blank none will show
		}
		}

Start mirror...enjoy!

