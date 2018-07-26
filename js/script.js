
var country;
var systemnames=[];
var coordinates=[];
var start=true;
var lat="37.688",lng="35.438";
var map;
var initialised=false;
var submitB=false;
var markers =  L.markerClusterGroup(
    {
        spderfyOnMaxZoom:true
    }
);
var marker;
var name="";
var tables=[];
var pagination;
var str;

function getCoordinates(c) {
    if(c!="ALL"){
        $.ajax({
            type: "GET" ,
            url: "http://api.geonames.org/search?q=" + c + "&username=patriciam97" ,
            dataType: "xml" ,
            success: function(xml) {
                lat = $(xml).find('lat').first().text(); 
                lng = $(xml).find('lng').first().text();
                    if(initialised==false){
                        myMap(lat,lng,8); 
                        initialised=true;
                    }else{
                        moveMap(lat,lng);
                        initialised=true;
                    }               
                }
            });       
        }else{
        if(initialised==false){
            myMap(37.688,35.438,3); 
        }else{
           moveMap(37.688,35.438,3);
        }
    }
}

function myMap(lat,lng,zoomfactor) {
   map = L.map('mapid',{
    minZoom: 0,
    maxZoom: 10
   }).setView([lat,lng], zoomfactor);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(map);
    allPVS();
}

function moveMap(lat,lng,zoomfactor){
    map.panTo([lat,lng],zoomfactor);
    if(submitB==false){
        allPVS();
    }else{
        findPVSystem(name);
    }
}

function submit(){
     $('#Searching_Modal').modal("show");
    markers.clearLayers();
    name=document.getElementById("pvname").value;
    if(name!=""){
        submitB=true;
    }
    getCountry();
}
function getCountry(){
    var countries= document.getElementById("countries");
    country= countries.options[countries.selectedIndex].value;
    console.log(country);
    getCoordinates(country);
}

function startProgram(){
    $('#Searching_Modal').modal("show");
   // deleteMarkers();
    getCountry();
}

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
        }
    });
}

function getPVS(result){
    var totalsystempower=0;
    $.each(result, function(index,pv){          
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
        //marker      
        marker =L.marker( [lat,lng]).on('click', function(){
            getProfile(pv._id,pv.System,"<table><tr> <td class=\"mylabel\">City: </td> <td> "+pv.City+"</td></tr> <tr> <td class=\"mylabel\">Zip Code: </td> <td> "+pv.ZipCode+"</td></tr> <tr> <td class=\"mylabel\">System Power: </td> <td> "+pv.SystemPower+"kmh</td></tr>");
        }); 
        markers.addLayer(marker);
        });
        totalsystempower=(parseFloat(totalsystempower).toFixed(4))+" kWp";
        map.addLayer(markers);
        $(".about-title").html(country);
        $("#about").html("<table><tr> <td class=\"mylabel\">Total PV Systems:  </td><td>"+(result.length)+"</td></tr> <tr> <td class=\"mylabel\">Total System Power:  </td><td>"+totalsystempower+"</td></tr></table>");
        $('#Searching_Modal').modal("hide");

}

// function getProfile(id){

//     var str="";
//     $.ajax({
//         type: "GET",
//         crossDomain: true,
//         url:"http://localhost:8000/api/pvs/id/"+id,
//         dataType: "json" ,
//         success: function(pv) {
//                     if(pv.Image!=null){
//                         //  if(pv.Image.toString().contains("blank")==false){
//                         var link="https://www.sunnyportal.com"+pv.Image+".jpg";
//                         //str="<img  src=\""+link+"\" alt=\"Photo\" align=\"middle\" class=\"imagelink\">";"
//                       //  document.getElementsByClassName("imagelink")[0].attr("src",link);
//                         $(".imagelink").attr("src",link);
//                         // $("#details").html(str);  
//                         //  }
//                     }
//                     if(pv.Operator!=null){
//                         str="<tr> <td class=\"mylabel\">Operator: </td> <td>"+pv.Operator+"</td></tr>";
//                     }
//                     if(pv.StartDate!=null){         
//                         str=str+"<tr> <td class=\"mylabel\">Start Date: </td> <td>"+pv.StartDate+"</td></tr>";
//                     }
//                     if(pv.SystemAnnualProduction!=null){
//                         str=str+"<tr> <td class=\"mylabel\">Annual Production: </td> <td> "+pv.SystemAnnualProduction+"</td></tr>";
//                     }
//                     if(pv.CO2!=null){
//                         str=str+"<tr> <td class=\"mylabel\">CO2: </td> <td> "+pv.CO2+"</td></tr>";
//                     }
//                     if(pv.Azimuth!=null){
//                         str=str+"<tr> <td class=\"mylabel\">Azimuth: </td> <td> "+pv.Azimuth+"</td></tr>";
//                     }
//                     if(pv.Inclination!=null){
//                         str=str+"<tr> <td class=\"mylabel\">Inclination: </td> <td> "+pv.Inclination+"</td></tr>";
//                     }
//                     if(pv.Modules!=null){
//                         str=str+"<tr> <td class=\"mylabel\">Modules: </td> <td> "+pv.Modules+"</td></tr>";
//                     }
//                     if(pv.Inverter!=null){
//                         str=str+"<tr> <td class=\"mylabel\">Inverter: </td> <td> "+pv.Inverter+"</td></tr>";
//                     }
//                     if(pv.Sensors!=null){
//                         str=str+"<tr> <td class=\"mylabel\">Sensors: </td> <td> "+pv.Sensors+"</td></tr>";
//                     }
//                     if(pv.descinfo!=null && pv.descinfo!="" && pv.descinfo!==undefined){
//                         str=str+"<tr> <td class=\"mylabel\">Description: </td> <td> "+pv.descinfo+"</td></tr>";
//                     }
//                     if (str==""){
//                         document.getElementById("detailstab").classList.add("disabled");
//                     }
//                     if(pv.monthlyReadings.length!=0){
//                         var readings="<table id=\"\"class=\"table\"><thead> <tr> <th scope=\"col\">Month</th> <th scope=\"col\">Value("+pv.readingsUnit+")</th></tr></thead><tbody>";
//                         for(i=0;i<pv.monthlyReadings.length;i=i++){
//                             var date = new Date(pv.monthlyReadings[i].timestamp);
//                             var value= pv.monthlyReadings[i].value;
//                             var month=date.getMonth();
//                             var year= date.getFullYear();
//                             readings=readings+"<tr><td>"+(month+1)+"</td><td> "+value+"</tr>";
//                         }
//                         readings=readings+"</tbody></table>";
//                         document.getElementById("readingstab").classList.remove("disabled");
//                         $("#readings").html(readings);
//                     }else{
//                         document.getElementById("readingstab").classList.add("disabled");
//                     }
//                     $("#details").html(str);    
//         },
//         error: function(){
//             document.getElementById("detailstab").classList.add("disabled");
//             $("img").hide();
//             document.getElementById("readingstab").classList.add("disabled");
//         }
//     });
  
// }

function getProfile(id,system,str2){
    var table;
    var yr;
    var str1=str2;
    var datapoints=[];
    var labels=[];
    $("#proflabel").html(system);
    $.ajax({
        type: "GET",
        crossDomain: true,
        url:"http://localhost:8000/api/pvs/id/"+id,
        dataType: "json" ,
        success: function(pv) {
                    if(pv.Image!=null){
                        var link;
                      if(pv.Image.toString().includes("blank")==false){ 
                          //if the image is not blank
                        link="https://www.sunnyportal.com"+pv.Image+".jpg";
                        
                      }else{
                        link="https://static.insulationsuperstore.co.uk/u/prod/l/plug-in-solar-power-metal-roof-diy-kit-250w-lifestyle-kam7yp5ktz-g.jpg";
                      }
                      $(".imagelink").attr("src",link);
                    }
                    if(pv.Operator!=null){
                        str1=str1+"<tr> <td class=\"mylabel\">Operator: </td> <td>"+pv.Operator+"</td></tr>";
                    }
                    if(pv.StartDate!=null){         
                        str1=str1+"<tr> <td class=\"mylabel\">Start Date: </td> <td>"+pv.StartDate+"</td></tr>";
                    }
                    if(pv.SystemAnnualProduction!=null){
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
                    if(pv.descinfo!=null && pv.descinfo!="" && pv.descinfo!==undefined){
                        str1=str1+"<tr> <td class=\"mylabel\">Description: </td> <td> "+pv.descinfo+"</td></tr>";
                    }

                    if(pv.monthlyReadings.length!=0){
                        pagination="<nav aria-label=\"Page navigation example\"><ul class=\"pagination\">";
                        yr=new Date().getFullYear()+1;
                        c=0;
                        d=0;
                        for(x=0;x<pv.monthlyReadings.length;x=x+12){
                                yr=yr-1;
                                pagination=pagination+" <li id=\""+yr+"\"onclick=\"getPaging("+yr+","+(pv.monthlyReadings.length/12)+")\" \"class=\"page-item\"><a class=\"page-link\" href=\"#\">"+yr+"</a></li>"
                                table="<table class=\"table table-striped\"><thead> <tr> <th scope=\"col\">Year</th><th scope=\"col\">Month</th> <th scope=\"col\">Production("+pv.readingsUnit+")</th> </tr> </thead> <tbody>";
                                for(i=x;i<x+12;i++){
                                    var date = new Date(pv.monthlyReadings[i].timestamp);
                                    var value= pv.monthlyReadings[i].value;
                                    locale = "en-us",
                                    month = date.toLocaleString(locale, { month: "long" });
                                    var year= date.getFullYear();
                                    table=table+"<tr><th scope=\"row\">"+year+"</th><td>"+(month+1)+"</td><td>"+value+"</td></tr>";
                                    datapoints[d]=value;
                                    labels[d]=month+" "+year;
                                    d++;
                                }
                                table=table+"</tbody></table>";
                                tables[c]=table;
                                c++;
                        }
                        pagination=pagination+"</ul></nav>";
                        document.getElementById("readingstab").classList.remove("disabled");
                        $("#readings").html(pagination);
                    }else{
                        document.getElementById("readingstab").classList.add("disabled");
                    }
                    str1=str1+"</table>";
                    $("#details").html(str1);
                    var ctx = document.getElementById("myChart").getContext('2d');
                    var myChart = new Chart(ctx, {
                        cubicInterpolationMode:'default',
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label:"Readings",
                                fill: false,
                                data: datapoints,
                                borderColor:'rgb(255, 99, 132)'
                            }],
                        },
                        options: {
                            title: {
                                display: true,
                                text: 'Monthly Readings'
                            },
                        }
                    });
        },
        error: function(){
            document.getElementById("readingstab").classList.add("disabled");
            document.getElementById("detailstab").classList.add("disabled");
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
            }
        }));
        $('#Searching_Modal').modal("hide");
            
}

$(document).ready(function () {
   startProgram();
});
