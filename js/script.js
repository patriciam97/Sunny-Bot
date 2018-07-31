//global variables
var country,prevcountry;;
var systemnames=[];
var coordinates=[];
var map; 
//usernames needed for extraction of lat,lng coordinates from geonames database.
var username1="patriciam97";
var username2="s1616316";
var username=username1;
var initialised=false; //boolean variable that shows if the map has been initialised or not
var submitB=false; // if the user has submited a form
var maxSystemPower=0;
var minSystemPower;
var markers =  L.markerClusterGroup(
    {
        spderfyOnMaxZoom:true,
    }
);
var marker;
var name="";
var tables=[]; //tables used for monthly readings
var pagination; //used for the monthly readings
var str;
var chart; //chart for the monthly readings

//if the profile modal has been closed
$("#profclose").click(function(){
    //restore this classes in order to always show the details tab first 
    document.getElementById("detailstab").classList.add("active");
    document.getElementById("details").classList.add("active");
    document.getElementById("details").classList.add("show");
    $(".imagelink").attr("src","");
    if(document.getElementById("readingstab").classList.contains("active")){
        document.getElementById("readingstab").classList.remove("active");
        document.getElementById("readingsli").classList.remove("active");
        document.getElementById("readings").classList.remove("active");
        document.getElementById("readings").classList.remove("show");
    }
    if(document.getElementById("statisticstab").classList.contains("active")){
        document.getElementById("statisticstab").classList.remove("active");
        document.getElementById("statisticsli").classList.remove("active");
        document.getElementById("statistics").classList.remove("active");
        document.getElementById("statistics").classList.remove("show");
    }
});

//this function connects to the geonames geographical database to extract the latitude and longitude coordinates for the country selected
function getCoordinates(c) {
    if(c!="ALL"){
        $.ajax({
            type: "GET" ,
            url: "http://api.geonames.org/search?q=" + c + "&username="+username , 
            dataType: "xml" ,
            success: function(xml) {
                lat = $(xml).find('lat').first().text(); 
                lng = $(xml).find('lng').first().text();
                    if(initialised==false){ //if tha map has still not being initialised
                        myMap(lat,lng,8);  //calls this function in order to set up the map
                        initialised=true;
                    }else{
                        moveMap(lat,lng); //calls this function in order to focus on the new coordinates
                    }               
                },
            error:function(){ 
                //if we face any errors, it means that the limit of requests have been reached(since we have a free account)
                //we change to another account I had create and run again this function
               if(username==username1){
                   username=username2;
               }else{
                   username=username1;
               }
               getCoordinates();
            }
            });       
        }else{ //if the user selected "ALL" these are the average coordinates of the center of the earth.
        if(initialised==false){
            myMap(37.688,35.438,2); 
        }else{
           moveMap(37.688,35.438,2);
        }
    }
}

//this function initialises the map
function myMap(lat,lng,zoomfactor) {
   map = L.map('mapid',{
    minZoom: 0,
    maxZoom: 17,
    zoomControl:false
   }).setView([lat,lng], zoomfactor);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(map);
    allPVS(); //we then run this function to extract all systems located in this country, from our database
}

//this function changes the center of the map , after it has been initialised
function moveMap(lat,lng,zoomfactor){
    map.panTo([lat,lng],zoomfactor);
    if(submitB==false){ // if not submited a search for a specific PV system
        allPVS();
    }else{
        //else search for that specific PV system
        findPVSystem(name);
        submitB=false;
    }
}

//this function is used once the user submits the form
function submit(){
     $('#Searching_Modal').modal("show");
    markers.clearLayers();
    name=document.getElementById("pvname").value;
    if(name!=""){
        submitB=true;
    }
    getCountry(); 
}

//this function extracts the country selected by the user and then calls another function to extract the coordinates for that country
function getCountry(){
    prevcountry=country;
    var countries= document.getElementById("countries");
    country= countries.options[countries.selectedIndex].value;
    if (country=="ALL" && submitB==false){
        // if the user selects all countries, we show this message to the user
        swal({title: 'Are you sure?',
            text:"It might take a bit to load the results.", 
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!'
            }).then(result => {
            if (result.value) {
              // handle Confirm button click
              getCoordinates(country);
            } else {
              // handle dismissals
              //go back to the previous country selected
              country=prevcountry;
              countries.value=country;
              getCoordinates(country);
            }
          })
    }else{
        //we extract the coordinates for that country
     getCoordinates(country);
    }
}

//this function is run at the start
function startProgram(){
    $('#Searching_Modal').modal("show");
    document.getElementById("countries").value="CYPRUS";
    getCountry();
}

//this function is used to extract the information of a selected PV System from the api
function findPVSystem(name){
    
    var link="http://localhost:8000/api/pvs/name/"+name;
    var lat,lng;
    var city="";
    var id="";
    var systemname="";
    var power="";
    console.log("Searching for "+ name);

    $.ajax({
        type: "GET",
        crossDomain: true,
        url: link,
        dataType: "json" ,
        success: function(result){
            getPVS(result); 
        },
        error:function(){ 
            swal({
                type: 'error',
                title: 'Oops...',
                text: 'No such system!',
            })
           document.getElementById("pvname").value="";
           submit();
        }        
    });
}

//this function checks what information is available fromt the result of the searching
function getPVS(result){
    var i=0;
    var totalsystempower=0;
    var counter=result.length;

    $.each(result, function(index,pv){ 
        //for each pv system we have extracted fron the database
        if(pv.Country!=country && country!="ALL"){ //if the country is not what the user has selected and country is not "ALL"
            counter--;
        }else{
        // Get Coordinates 
        var crd=pv.Coordinates;
        if(crd!=null){
        var res = crd.toString().split(',',2);
        lat=res[0];
        lng=res[1]; 
        }else{
            lat=0;
            lng=0;
        }
        //Get id
        id=pv._id;
        //get system power
        totalsystempower=parseFloat(totalsystempower)+parseFloat(pv.SystemPower);
        if (maxSystemPower<pv.SystemPower){
            maxSystemPower=pv.SystemPower;
        }
        if(minSystemPower>pv.SystemPower){
            minSystemPower=pv.SystemPower;
        }
        //initialise its marker 
        marker =L.marker( [lat,lng]).on('click', function(){
            getProfile(pv._id,pv.System,"<table><tr> <td class=\"mylabel\">City: </td> <td> "+pv.City+"</td></tr> <tr> <td class=\"mylabel\">Zip Code: </td> <td> "+pv.ZipCode+"</td></tr> <tr> <td class=\"mylabel\">System Power: </td> <td> "+pv.SystemPower+"kmh</td></tr>");
        }); 
        markers.addLayer(marker);
        }
        });
        if(result.length==0 || counter==0){ //if no results
            swal({
              type: 'error',
              title: 'Oops...',
              text: 'No systems avaiable!',
          })
           document.getElementById("pvname").value="";
           country=prevcountry;
           countries.value=country;
           submit();
        }

        totalsystempower=(parseFloat(totalsystempower).toFixed(4))+" kWp";
        map.addLayer(markers); //add markers to the map
        //change the information that will be displayed in the About modal
        $(".about-title").html(country); 
        $("#about").html("<table><tr> <td class=\"mylabel\">Total PV Systems:  </td><td>"+(result.length)+"</td></tr> <tr> <td class=\"mylabel\">Total System Power:  </td><td>"+totalsystempower+"</td></tr></table>");
        $('#Searching_Modal').modal("hide");

}

//this function extracts the information for a specific PV system
function getProfile(id,system,str2){
    var table;
    var yr;
    var str1=str2;
    var datalines=[];
    var unit;
    $("#proflabel").html(system);

    $.ajax({
        type: "GET",
        crossDomain: true,
        url:"http://localhost:8000/api/pvs/id/"+id,
        dataType: "json" ,
        success: function(pv) {
                    if(pv.Image!=null){ //if image is not null
                        var link;
                      if(pv.Image.toString().includes("blank")==false){  //and not blank
                          //if the image is not blank
                        link="https://www.sunnyportal.com"+pv.Image+".jpg";
                      }
                      $(".imagelink").attr("src",link); 
                    }
                    if(pv.Operator!=null){ //if Operator exists
                        str1=str1+"<tr> <td class=\"mylabel\">Operator: </td> <td>"+pv.Operator+"</td></tr>";
                    }
                    if(pv.StartDate!=null){ // if Starting Date exists
                        str1=str1+"<tr> <td class=\"mylabel\">Start Date: </td> <td>"+pv.StartDate+"</td></tr>";
                    }
                    if(pv.SystemAnnualProduction!=null){ // if  System Annual Production exists
                        str1=str1+"<tr> <td class=\"mylabel\">Annual Production: </td> <td> "+pv.SystemAnnualProduction+"</td></tr>";
                    }
                    if(pv.CO2!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">CO2: </td> <td> "+pv.CO2+"</td></tr>";
                    }
                    if(pv.Azimuth!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Azimuth: </td> <td> "+pv.Azimuth+"</td></tr>";
                    }
                    if(pv.Inclination!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Inclination: </td> <td> "+pv.Inclination+"</td></tr>";
                    }
                    if(pv.Modules!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Modules: </td> <td> "+pv.Modules+"</td></tr>";
                    }
                    if(pv.Inverter!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Inverter: </td> <td> "+pv.Inverter+"</td></tr>";
                    }
                    if(pv.Sensors!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Sensors: </td> <td> "+pv.Sensors+"</td></tr>";
                    }
                    if(pv.readingsUnit!=null){
                        unit=pv.readingsUnit;
                    }
                    if(pv.descinfo!=null && pv.descinfo!="" && pv.descinfo!==undefined){
                        str1=str1+"<tr> <td class=\"mylabel\">Description: </td> <td> "+pv.descinfo+"</td></tr>";
                    }

                    if(pv.monthlyReadings.length!=0){
                        months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        pagination="<div><nav aria-label=\"Page navigation\"><ul class=\"pagination\">";
                        yr=new Date().getFullYear()+1;
                        c=0;
                        var limit=156;
                        for(x=0;x<pv.monthlyReadings.length;x=x+12){
                                var year;
                                var datapoints=[];
                                d=0;
                                yr=yr-1;
                                if(x<limit){
                                    pagination=pagination+"<li id=\""+yr+"\"onclick=\"getPaging("+yr+","+(pv.monthlyReadings.length/12)+")\" \"class=\"page-item\"><a class=\"page-link\" href=\"#\">"+yr+"</a></li>"
                                }else{
                                    limit=limit*2;
                                    pagination=pagination+"</ul></nav></div>"+"<br><div><nav aria-label=\"Page navigation\"><ul class=\"pagination\">";
                                    pagination=pagination+"<li id=\""+yr+"\"onclick=\"getPaging("+yr+","+(pv.monthlyReadings.length/12)+")\" \"class=\"page-item\"><a class=\"page-link\" href=\"#\">"+yr+"</a></li>"

                                }
                                    table="<table class=\"table table-striped text-center\" ><thead> <tr class=\"text-center\"> <th scope=\"col\">Year</th><th scope=\"col\">Month</th> <th scope=\"col\">Production("+pv.readingsUnit+")</th> </tr> </thead> <tbody>";
                                for(i=x;i<x+12;i++){
                                    var date = new Date(pv.monthlyReadings[i].timestamp);
                                    var value= pv.monthlyReadings[i].value;
                                    locale = "en-us",
                                    month = date.toLocaleString(locale, { month: "long" });
                                    year= date.getFullYear();
                                    table=table+"<tr><th scope=\"row\">"+year+"</th><td>"+month+"</td><td>"+parseFloat(value)+"</td></tr>";
                                    datapoints[d]=[months[d],parseInt(value)];  //
                                    d++;
                                }
                                datalines.push({"name":year,"data":datapoints});
                                table=table+"</tbody></table>";
                                tables[c]=table;
                                c++;
                        }
                        pagination=pagination+"</ul></nav></div>";
                        document.getElementById("readingstab").classList.remove("disabled");
                        if(document.getElementById("statisticstab").classList.contains("disabled")){
                             document.getElementById("statisticstab").classList.remove("disabled");
                        }
                        $("#readings").html(pagination);
                        //creating the chart
                       
                Highcharts.chart('myChart', {
                    title: {
                    text: 'Monthly Readings',
                    style:{ "color": "#333333", "fontSize": "20px" }
                    },
                    yAxis: {
                    title: {
                        text: 'Total Yield   ['+unit+']',
                        style:{ "color": "#333333", "fontSize": "15px" }
                    }
                    },
                    xAxis: {
                        title: {
                            text: 'Months',
                            style:{ "color": "#333333", "fontSize": "15px" }
                        },
                        type: "category",
                      },
                    legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                    },
                    series:datalines,
                    plotOptions:{
                        series:{
                            label: {
                                enabled: false,
                            }
                       },line:{
                           marker:{
                               symbol: "circle",
                               radius: 3
                           }
                       }
                    },
                    tooltip: {
                        formatter: function() {
                          return "<strong>Month: </strong>"+(months[this.x])+" "+(this.series.name) +" <strong>Yield: </strong>"+this.y;
                        },
                        borderWidth: 3
                      }
                });
                    }else{
                        document.getElementById("readingstab").classList.add("disabled");
                        document.getElementById("statisticstab").classList.add("disabled");
                    }
                    str1=str1+"</table>";
                    $("#details").html(str1);                 
        },
        error: function(){
            document.getElementById("readingstab").classList.add("disabled");
            document.getElementById("detailstab").classList.add("disabled");
            document.getElementById("statisticstab").classList.add("disabled");
        }
    });
    $("#details").html(str1);
    $('#profmodal').modal("show");
  
}

function getPaging(yr,size){
    var counter,currYear;
    if(yr==new Date().getFullYear()){
        $("#readings").html(pagination+tables[size-1]);
    }else{
        counter=size-1;
        currYear=new Date().getFullYear();
        for (x=currYear;x>yr;x=x-1){
            counter--;
        }
        $("#readings").html(pagination+tables[counter]);
    }
}

function allPVS(){
    $.when( $.ajax({
            type: "GET",
            crossDomain: true,
            url:"http://localhost:8000/api/pvs/country/"+country,
            dataType: "json" ,
            success: function(result) {
                getPVS(result);
            },
            error:function(){ 
                swal({title: 'Oops',
                    text:"Something went wrong!.", 
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Retry!'
                    }).then(result => {
                    if (result.value) {
                    // handle Confirm button click
                    allPVS();
                    } else {
                    // handle dismissals
                    submit();
                    }
                })
                    }
                }));            
}

$(document).ready(function () {
   startProgram();
});
