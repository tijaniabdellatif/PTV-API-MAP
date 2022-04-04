
(function ($){


    let defaults = {

          map:undefined,
          defaultPoint : new L.latLng(46.5657555, 6.6369062),
          currentCenter : new L.LatLng(46.5657555, 6.6369062),
          zoom:18,
          marker : undefined,
          waypoints:[],
          profiles : [

             {profile:'amber'},
             {profile:"classic"},
             {profile:"silkysand"},
             {profile:"blackmarble"},
             {profile:"sandbox"}

          ],

          layers : [
            
              {
                  id:1,
                  layer:'PTV_TruckAttributes'
              },
              {
                  id:2,
                  layer:'PTV_PreferredRoutes'
              },
             
          ],

         overlays : null,

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
               
            
                let _zoom = (type =='')? 10 : defaults.currentZoom; 
                defaults.map = L.map('dv_map', {
                    center:  defaults.defaultPoint,
                    zoom: _zoom, 
                    layers: [defaults.defaultLayer],
                    crs: L.CRS.PTVMercator,
                    maxZoom: 17,
                
                });

                    $.each(defaults.profiles,function(index,item){
                        let html = `
                            <option value="${item.profile}">${item.profile}</option>
                        `
                        $('#profil').append(Mustache.render(html,item));

                    });


                    $.each(defaults.layers,function(index,item){

                          let html =  `
                          <label class="toggle" for="${item.layer}">
                            <input type="checkbox" name="attributes" class="toggle__input" id="${item.layer}" value="${item.layer}" />
                            <span class="toggle-track">
                                <span class="toggle-indicator">
                                    <span class="checkMark">
                                        <svg viewBox="0 0 24 24" id="ghq-svg-check" role="presentation" aria-hidden="true">
                                            <path d="M9.86 18a1 1 0 01-.73-.32l-4.86-5.17a1.001 1.001 0 011.46-1.37l4.12 4.39 8.41-9.2a1 1 0 111.48 1.34l-9.14 10a1 1 0 01-.73.33h-.01z"></path>
                                        </svg>
                                    </span>
                                </span>
                            </span>
                           ${item.layer}
                        </label>
                          `;

                          $('.attributes').addClass('hidden');
                          $('#layers').append(Mustache.render(html,item));

                     defaults.map.on('click',async (e) => {

                            const {lat,lng} = e.latlng;
                            let marker = new L.marker([lat,lng],{
                            icon:setIcon('../icons/map-pin.svg'),
                          })
        
                          const latlng = marker.getLatLng();
                          defaults.map.addLayer(marker);
                           marker.bindPopup(`
                            
                             <div class="info">
                             <p>city is </p>
                              <p>lat : ${lat}</p>
                              <p>lng : ${lng}</p>
                             </div>
                         
                         `).openPopup();
        
                        defaults.waypoints.push(latlng);
        
                         const data = await $().PTV('calculateRoute',defaults.waypoints);
                         console.log('this is the data : ',data);
                         const {polyline:{plain:{polyline}},toll} = data;
                         console.log('this is data from map plugin',polyline);
        
                          let Poly = new L.polyline(polyline,{
                              
                            color:'#180A0A',
                            weight:10
                        
                        }).addTo(defaults.map);
                        //   defaults.map.fitBounds(Poly.getBounds());
        
                          let html = `
                        <div class="total">
                          <p>Total Cost</p>
                          <p>${data.monetaryCostsReport.totalCost}</p>
                      </div>
        
                      <div class="total">
                       <p>Distance cost</p>
                       <p>${data.monetaryCostsReport.distanceCost} Km</p>
                      
                      </div>

                      <div class="total">
                      <p>Toll cost cost</p>
                      <p>${toll.summary ? toll.summary.costs[0].amount : 'no data'}  ${toll.summary.costs[0].currency}</p>
                     </div>
        
                     <div class="total">
                     <p>working time cost</p>
                     <p>${ secondsToHms(data.travelTime) }</p>
                     </div>
                    
                          `;

                          
        
                          $(".information").empty().html(html);
        
        
                     })
                 
                         

                    });

                    $('#profil').on('change', function() {

                         let profil = this.value;
                         $('.attributes').removeClass('hidden');
                         defaults.PTV = new L.TileLayer("https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile="+profil, { minZoom: 1, maxZoom: 30,attribution}).addTo(defaults.map);
                         switch(profil){
                                case 'amber': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`,{ pane: "overlayPane", maxZoom: 20 }).addTo(defaults.map);
                                break;
                                case 'classic': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`,{ pane: "overlayPane", maxZoom: 20 }).addTo(defaults.map);
                                break;
                                case 'silkysand': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`,{ pane: "overlayPane", maxZoom: 20 }).addTo(defaults.map);
                                break;
                                case 'blackmarble': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`,{ pane: "overlayPane", maxZoom: 20 }).addTo(defaults.map);
                                break;
                                default:defaults.PTV.addTo(defaults.map);
                                break;
                         }

                         $('input[type="checkbox"]').change(function(){
                            const PTV = $(this).val();
                            if($(this).prop("checked") == true){
                              
                                switch(PTV){

                                     case 'PTV_TruckAttributes': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}&layers=${PTV}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                                     break;

                                     case 'PTV_PreferredRoutes': new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}&layers=${PTV}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                                     break;

                                     default:new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                                     break;
                                }
                           }
                           else if($(this).prop("checked") == false){
                            return new L.TileLayer(`https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=${profil}`, {minZoom: 1, maxZoom: 30,noWrap: true}).addTo(defaults.map);
                           }
                            });
                        
                    });

                  

                    
                    $('#geocodingInput').on('keydown', async function(e){

                        var dInput = this.value;
                        console.log(dInput);   
                       const data = await $().PTV('searchByLocations',dInput);
                       const {results}= data;
                       console.log(results);
                       results.slice(0,4).forEach(item => {
                        
                        const addMarker = (lat,lng) => {

                        const marker = new L.marker([lat,lng],{
                                
                            icon:setIcon('../icons/map-pin.svg')
                          }).addTo(defaults.map);
  
                          const latlng = marker.getLatLng();
                          defaults.map.addLayer(marker);
                          return latlng;
                         
                         }

                        let html = `

                        <ul class="list">
                          <li>
                          <p>${item.location.address.city} / ${item.location.formattedAddress}</p>
                          <p>${item.location.address.country} / ${item.location.address.province}</p>
                          </li>
                        </ul>
                      
                    `;

                    $('#result').empty().html(html);
                    $('.list').on('click',async function(){

                          const latlng = addMarker(item.location.referenceCoordinate.y,item.location.referenceCoordinate.x);
                          defaults.waypoints.push(latlng);
        
                         const data = await $().PTV('calculateRoute',defaults.waypoints);
                         console.log('this is the data : ',data);
                         const {polyline:{plain:{polyline}},toll} = data;
                         console.log('this is data from map plugin',polyline);
        
                          let Poly = new L.polyline(polyline,{
                              
                            color:'#180A0A',
                            weight:10
                        
                        }).addTo(defaults.map);

                        let html = `
                        <div class="total">
                          <p>Total Cost</p>
                          <p>${data.monetaryCostsReport.totalCost}</p>
                      </div>
        
                      <div class="total">
                       <p>Distance cost</p>
                       <p>${data.monetaryCostsReport.distanceCost} Km</p>
                      
                      </div>

                      <div class="total">
                      <p>Toll cost cost</p>
                      <p>${toll.summary ? toll.summary.costs[0].amount : 'no data'}  ${toll.summary.costs[0].currency}</p>
                     </div>
        
                     <div class="total">
                     <p>working time cost</p>
                     <p>${ secondsToHms(data.travelTime) }</p>
                     </div>
                    
                          `;

                          
        
                          $(".information").empty().html(html);
                    })
                
                })
                     

                          
                    
                     
                    })
                
                 
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