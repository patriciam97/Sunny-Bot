# Sunny-Bot

## What is Sunny-Bot?

Using the data collected from my [web crawler](https://github.com/patriciam97/Web-Crawler),I have developed a visualisation page, where the user can explore the PV systems installed in a country specified by him.

### What information does Sunny-Bot hold?
The information across all PV Systems varies.

Information includes :

  -Location <br />
  -System Power <br />
  -CO2 avoided <br />
  -Modules <br />
  -Inverter <br />
  -Description <br />
  -Monthly Readings and many more! <br />

Some profiles include a lot of information, but some are very poor.

### Running it

The page automatically first loads the results for Cyprus.<br />
The user can see some general information for the country selected through the “About” button.  Such information includes how many systems are installed and the total system power of all those systems in that country.<br />
The user can select the country he is interested in, or search for a specific PV system.
 Markers clustering is used for a better visualisation.<br />
The more the user zooms in the map, the maps become more detailed.<br />

<img src="https://github.com/patriciam97/Sunny-Bot/blob/master/photo1.png?raw=true" alt="photo"/>
<img src="https://github.com/patriciam97/Sunny-Bot/blob/master/photo2.png?raw=true" alt="photo"/>

Clicking on a marker, the user can see the full information for that specific PV system. <br />
The title is the name of the specific PV system. If a photo is available, it will be located at the top right corner of the modal. <br />
The user can explore at most 3 tabs.<br />
The “Details”  tab shows the information collected, except from the monthly readings, which can be found at the “Monthly Readings” tab.<br /> The “Statistics” tab shows the monthly readings in a graphical representation. <br />

<img src="https://github.com/patriciam97/Sunny-Bot/blob/master/photo3.png?raw=true" alt="photo"/>
<img src="https://github.com/patriciam97/Sunny-Bot/blob/master/photo4.png?raw=true" alt="photo"/>
<img src="https://github.com/patriciam97/Sunny-Bot/blob/master/photo5.png?raw=true" alt="photo"/>


### Technologies Used
-Slack: Communication with my mentor. <br />
-Trello: Organizing Project Progress. <br />
-Git: Code Versioning. <br />
-Java (JSoup lib): WebCrawler <br />
-MongoDB: Storage <br />
-HTML, CSS, JavaScript, Node js: Visualization through web interface  <br />
-GetBootstrap, SweetAlert2 ,Highcharts, Leaflet maps: Visualization page <br />
