
(function ($){


    let defaults = {

          map:undefined,
          defaultPoint : new L.latLng(46.5657555, 6.6369062),
          currentCenter : new L.LatLng(46.5657555, 6.6369062),
          zoom:18,
          marker : undefined,
          waypoints:[],
          profiles : [],
          layers : null,
          overlays : null,
          profiles : [
              {id:0,profil:"silkysand"},
              {id:1,profil:"classic"},
              {id:2,profil:'amber'},
              {id:3,profil:'blackmarble'}

          ]

    };


    var methods = {

           init:function(){

               $().PTV('init');
               methods.initMap();
           },

         


        getData: function(key){
            return defaults[key]
        },
        setData: function(key,value){
             defaults[key] = value
        },

        initMap: async function(type){

             /* Setiing custom icon */
             function setIcon(path){

                let myIcon = L.icon({

                   iconUrl: path,
                   iconSize: [50, 50],
                   iconAnchor:[25,25]
                })

                return myIcon;
             }

             /**function time**/
             function secondsToHms(d) {
                d = Number(d);
                var h = Math.floor(d / 3600);
                var m = Math.floor(d % 3600 / 60);
                var s = Math.floor(d % 3600 % 60);
            
                var hDisplay = h > 0 ? h + (h == 1 ? "H:" : "H:") : "";
                var mDisplay = m > 0 ? m + (m == 1 ? "m:" : "m:") : "";
                var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s") : "";
                return hDisplay + mDisplay + sDisplay; 
            }

            
             type=(type != undefined)? type:"";

             if(defaults.oldType != type) defaults.map = undefined;

             if (defaults.map == undefined) {

                $('#virtual_map').html('');
                $('#virtual_map_all').html('');
                let mapElem = 'virtual_map' //+ type;
                $('#'+mapElem).html('<div id="dv_map" style="width:100%;height:100%;background:#eaecef"></div>');
             
                const attribution = '&copy; <a class="attribution" href="https://www.omniyat.com/">Omniyat</a>';
           

                defaults.defaultLayer = new L.TileLayer("https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}", { minZoom: 1, maxZoom: 30,attribution});
                defaults.PTV_TRUCKATTRIBUTES = new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=silkysand&layers=transport,labels,PTV_TruckAttributes,background`, {minZoom: 1, maxZoom: 30,noWrap: true})
                let _zoom = (type =='')? 10 : defaults.currentZoom; 
                defaults.map = L.map('dv_map', {
                    center:  defaults.defaultPoint,
                    zoom: _zoom, 
                    layers: [defaults.defaultLayer],
                    crs: L.CRS.PTVMercator,
                    maxZoom: 18,
                
                });
                defaults.routeMarkers = L.layerGroup() //.addTo(defaults.map);
                defaults.virtualPropMarker = L.layerGroup() //.addTo(defaults.map);
                defaults.propMarkers = L.layerGroup() //.addTo(defaults.map);
                defaults.map.attributionControl.setPosition('bottomright');
                defaults.map.attributionControl.setPrefix('&copy; Omniyat');
                defaults.map.zoomControl.setPosition('topleft');

             


                // defaults.layers = {

                //       "default":defaults.defaultLayer,
                //       "Labels Transport with Attributes":defaults.PTV_TRUCKATTRIBUTES
                // }


                // L.control.layers(
                //     defaults.layers,
                //     defaults.overlays,
                //     {collapsed:true}
                // ).addTo(defaults.map);
      
              
                $('.costs').addClass('hide');
                    
            
                
                $.each(defaults.profiles,function(index,item){
                             let html = `
                                <option value="${item.profil}">${item.profil}</option>
                            `
                            $('#profil').append(Mustache.render(html,item));
    
                 });
                
                $('select').change(function(e){
                    
                      const value = e.target.value;
                      defaults.PTV = new L.TileLayer("https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile="+value+'&layers=transport,labels,PTV_TruckAttributes,background', { minZoom: 1, maxZoom: 18,attribution}).addTo(defaults.map);

                      switch(value){

                                    case 'amber': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${value}&layers=transport,labels,PTV_TruckAttributes,background`,{ pane: "tilePane", maxZoom: 18 }).addTo(defaults.map);
                                    break;
                                    case 'classic': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${value}&layers=transport,labels,PTV_TruckAttributes,background`,{ pane: "tilePane", maxZoom: 18 }).addTo(defaults.map);
                                    break;
                                    case 'blackmarble': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${value}&layers=transport,labels,PTV_TruckAttributes,background`,{ pane: "tilePane", maxZoom: 18 }).addTo(defaults.map);
                                    break;
                                    default:defaults.PTV.addTo(defaults.map);
                                    break;
                      }
                });


                $("#site-search").on('keydown',function(e){

                    $('#result').html('');
                })

                $( "#site-search" ).on('keyup',async function(e){

                      const dInput = e.target.value;
                      const data = await $().PTV('searchByLocations',dInput);
                      console.log('data formated',data);


                      
                      $.each(data,function(index,value){
                           
                        if(value.score >= 90){

                            let html =  `

                            <div class="result">
                            
                            <i class="fa-solid fa-map-pin" id="choose"></i>
                            <span class="add">&rarr; ${value.type}</span>
                            <p>${value.exact}</p>
                            </div>
                         `

                           switch(value.type){

                                case 'LOCALITY': $(".add").addClass('color2');
                                break;

                                case 'STREET': $('.add').addClass('color3');
                                break;

                                case 'EXACT ADDRESS': $('.add').addClass('color4');
                                break;

                                case 'POSTAL CODE': $('.add').addClass('color5');
                                break;

                                default: $('.add').addClass('color1');
                                break;
                           }
                         $('#result').append(Mustache.render(html,value));

                       
                        }
                        else {

                            return false;
                        }
                              
                      });

                      const element = document.querySelectorAll('#choose');

                      element.forEach(item => {
      
                           item.addEventListener('click',function(e){
 
                            const title = e.target.parentElement.lastElementChild.innerText
                               
                              data.forEach(async element => {

                                 defaults.waypoints.push()
                                  if(element.score >= 90){
                                    let icon = L.icon({
                                          iconUrl:'../icons/placeholder.png',
                                          iconSize:[38,64],
                                          iconAnchor:[22,66],
                                          popupAnchor:[-3,-20]
                                    })
                                
                                   let  marker = L.marker([element.loc[0],element.loc[1]],{
                                      icon:icon
                                   })
                                    defaults.map.addLayer(marker);
                                    marker.bindPopup(`
                                        <div class="location">
                                           <p>${element.exact}</p>
                                           <p> latitude is : ${element.loc[0]}</p>
                                           <p> longitude is : ${element.loc[1]}</p> 
                                        </div>
                                    
                                    `).openPopup();

                                    const latlng = marker.getLatLng();

                                    defaults.waypoints.push(latlng);

                                    const newData = await $().PTV('calculateRouteCost',defaults.waypoints);
                                    const {distance,travelTime,polyline:{plain:{polyline}},monetaryCostsReport} = newData;
                                  
                                    let Poly = new L.polyline(polyline,{
                              
                                     color:'#43919B',
                                     weight:5,
                                     smoothFactor:2,
                                     stroke:true,
                                     fillOpacity:0.2
                        
                                    }).addTo(defaults.map);


                    
                                    let newHtml = `
                                    <h5>Monetary route Costs</h5>

                                    <div class="total">
                                        <p>total coast</p>
                                        <p>${monetaryCostsReport.totalCost}</p>
                                    </div>
                                    <div class="analyse">
                                        <p>Distance Cost</p>
                                        <p>${distance / 1000} Km</p>
                                        <p>24.5</p>
                                    </div>
                                    <div class="analyse">
                                        <p>Travel time</p>
                                        <p>${travelTime}</p>
                                        <p>24.5</p>
                                    </div>
                                    `;




                                    $('.costs').removeClass('hide');
                                    $('.costs').empty().html(newHtml);
                                    $('#result').html('');
                                    $('#site-search').val('');
                                  }

                                    
                                    
                              })
    
                               
                           })
                      })
                })


              

               
               
                    
                //     $('#geocodingInput').on('keydown', async function(e){

                //         var dInput = this.value;
                //         console.log(dInput);   
                //        const data = await $().PTV('searchByLocations',dInput);
                //        const {results}= data;
                //        console.log(results);
                //        results.slice(0,4).forEach(item => {
                        
                //         const addMarker = (lat,lng) => {

                //         const marker = new L.marker([lat,lng],{
                                
                //             icon:setIcon('../icons/map-pin.svg')
                //           }).addTo(defaults.map);
  
                //           const latlng = marker.getLatLng();
                //           defaults.map.addLayer(marker);
                //           return latlng;
                         
                //          }

                //         let html = `

                //         <ul class="list">
                //           <li>
                //           <p>${item.location.address.city} / ${item.location.formattedAddress}</p>
                //           <p>${item.location.address.country} / ${item.location.address.province}</p>
                //           </li>
                //         </ul>
                      
                //     `;

                //     $('#result').append(Mustache.render(html,item));


                //     $('.list').on('click',async function(){

                //           const latlng = addMarker(item.location.referenceCoordinate.y,item.location.referenceCoordinate.x);
                //           defaults.waypoints.push(latlng);
        
                //          const data = await $().PTV('calculateRoute',defaults.waypoints);
                //          console.log('this is the data : ',data);
                //          const {polyline:{plain:{polyline}},toll} = data;
                //          console.log('this is data from map plugin',polyline);
        
                //           let Poly = new L.polyline(polyline,{
                              
                //             color:'#180A0A',
                //             weight:10
                        
                //         }).addTo(defaults.map);

                //         let html = `
                //         <div class="total">
                //           <p>Total Cost</p>
                //           <p>${data.monetaryCostsReport.totalCost}</p>
                //       </div>
        
                //       <div class="total">
                //        <p>Distance cost</p>
                //        <p>${data.monetaryCostsReport.distanceCost} Km</p>
                      
                //       </div>

                //       <div class="total">
                //       <p>Toll cost cost</p>
                //       <p>${toll.summary ? toll.summary.costs[0].amount : 'no data'}  ${toll.summary.costs[0].currency}</p>
                //      </div>
        
                //      <div class="total">
                //      <p>working time cost</p>
                //      <p>${ secondsToHms(data.travelTime) }</p>
                //      </div>
                    
                //           `;

                          
        
                //           $(".information").empty().html(html);
                //     })
                
                // })
                     

                          
                    
                     
                //     })
                
        
                // var markersLayer = new L.LayerGroup();	//layer contain searched elements
                // defaults.map.addLayer(markersLayer);
            
                // var controlSearch = new L.Control.Search({layer: markersLayer, initial: false, position:'topright'});
                // defaults.map.addControl( controlSearch );
            
            
                // $('#textsearch').on('keyup', async function(e) {
            
                //     controlSearch.searchText( e.target.value );
                //     var data = await $().PTV('searchByLocations', e.target.value);
                //     console.log(data);

                //     for(i in data) {

                //         let title = data[i].title;	//value searched
                //         let loc = data[i].loc
                //         console.log(loc);
                      
                       
                           
                //         $('.search-tip').on('click',function(e){

                //             marker = new L.Marker(new L.latLng(loc),  {title: title});//se property searched
                //             marker.bindPopup('title: '+ title );
                          
                //         })

                //         markersLayer.addLayer(marker);

                        
                //     }
                   
            
                // })



    //searchLayer is a L.LayerGroup contains searched markers
                

                //     $.each(defaults.profiles,function(index,item){
                //         let html = `
                //             <option value="${item.profile}">${item.profile}</option>
                //         `
                //         $('#profil').append(Mustache.render(html,item));

                //     });


                //     $.each(defaults.layers,function(index,item){

                //           let html =  `
                //           <label class="toggle" for="${item.layer}">
                //             <input type="checkbox" name="attributes" class="toggle__input" id="${item.layer}" value="${item.layer}" />
                //             <span class="toggle-track">
                //                 <span class="toggle-indicator">
                //                     <span class="checkMark">
                //                         <svg viewBox="0 0 24 24" id="ghq-svg-check" role="presentation" aria-hidden="true">
                //                             <path d="M9.86 18a1 1 0 01-.73-.32l-4.86-5.17a1.001 1.001 0 011.46-1.37l4.12 4.39 8.41-9.2a1 1 0 111.48 1.34l-9.14 10a1 1 0 01-.73.33h-.01z"></path>
                //                         </svg>
                //                     </span>
                //                 </span>
                //             </span>
                //            ${item.layer}
                //         </label>
                //           `;

                //           $('.attributes').addClass('hidden');
                //           $('#layers').append(Mustache.render(html,item));

                //      defaults.map.on('click',async (e) => {

                //             const {lat,lng} = e.latlng;
                //             let marker = new L.marker([lat,lng],{
                //             icon:setIcon('../icons/drinking_water.png'),
                //             iconSize:[22,22],
                //           })
        
                //           const latlng = marker.getLatLng();
                //           defaults.map.addLayer(marker);
                //            marker.bindPopup(`
                            
                //              <div class="info">
                //              <p>city is </p>
                //               <p>lat : ${lat}</p>
                //               <p>lng : ${lng}</p>
                //              </div>
                         
                //          `).openPopup();
        
                //         defaults.waypoints.push(latlng);
        
                //          const data = await $().PTV('calculateRoute',defaults.waypoints);
                //          console.log('this is the data : ',data);
                //          const {polyline:{plain:{polyline}},toll} = data;
                //          console.log('this is data from map plugin',polyline);
        
                //           let Poly = new L.polyline(polyline,{
                              
                //             color:'#180A0A',
                //             weight:10
                        
                //         }).addTo(defaults.map);
                //         //   defaults.map.fitBounds(Poly.getBounds());
        
                //           let html = `
                //         <div class="total">
                //           <p>Total Cost</p>
                //           <p>${data.monetaryCostsReport.totalCost}</p>
                //       </div>
        
                //       <div class="total">
                //        <p>Distance cost</p>
                //        <p>${data.monetaryCostsReport.distanceCost} Km</p>
                      
                //       </div>

                //       <div class="total">
                //       <p>Toll cost cost</p>
                //       <p>${toll.summary ? toll.summary.costs[0].amount : 'no data'}  ${toll.summary.costs[0].currency}</p>
                //      </div>
        
                //      <div class="total">
                //      <p>working time cost</p>
                //      <p>${ secondsToHms(data.travelTime) }</p>
                //      </div>
                    
                //           `;

                          
        
                //           $(".information").empty().html(html);
        
        
                //      })
                 
                         

                //     });

                    // $('#profil').on('change', function() {

                    //      let profil = this.value;
                    //      $('.attributes').removeClass('hidden');
                    //      defaults.PTV = new L.TileLayer("https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile="+profil, { minZoom: 1, maxZoom: 30,attribution}).addTo(defaults.map);
                    //      switch(profil){
                    //             case 'amber': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`,{ pane: "overlayPane", maxZoom: 20 }).addTo(defaults.map);
                    //             break;
                    //             case 'classic': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`,{ pane: "overlayPane", maxZoom: 20 }).addTo(defaults.map);
                    //             break;
                    //             case 'silkysand': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`,{ pane: "overlayPane", maxZoom: 20 }).addTo(defaults.map);
                    //             break;
                    //             case 'blackmarble': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`,{ pane: "overlayPane", maxZoom: 20 }).addTo(defaults.map);
                    //             break;
                    //             default:defaults.PTV.addTo(defaults.map);
                    //             break;
                    //      }

                    //      $('input[type="checkbox"]').change(function(){
                    //         const PTV = $(this).val();
                    //         if($(this).prop("checked") == true){
                              
                    //             switch(PTV){

                    //                  case 'PTV_TruckAttributes':  new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}&layers=${PTV}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                    //                  break;

                    //                  case 'PTV_PreferredRoutes':  new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}&layers=${PTV}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                    //                  break;

                    //                  case 'PTV_TrafficIncidents' :  new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}&layers=${PTV}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                    //                   break;

                    //                   case 'PTV_SpeedPatterns' : new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}&layers=${PTV}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                    //                   break;

                    //                  default:new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                    //                  break;
                    //             }
                    //        }
                    //        else if($(this).prop("checked") == false){
                    //         return new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                    //        }
                    //         });
                        
                    // });

                  

               
                
                 
             defaults.map.invalidateSize();
            }
            defaults.oldType = type;
             $().PTV('init') 

        }   
    }

     $.fn.Map = function( options ) {  
		if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || ! options) {
            return methods.init.apply(this, arguments);
        }
    };


}( jQuery ));