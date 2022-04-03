(function ($){


    let defaults = {

          map:undefined,
          defaultPoint : new L.latLng(46.5657555, 6.6369062),
          currentCenter : new L.LatLng(46.5657555, 6.6369062),
          zoom:18,
          marker : undefined,
          waypoints:[]
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

            

             type=(type != undefined)? type:"";

             if(defaults.oldType != type) defaults.map = undefined;

             if (defaults.map == undefined) {

                $('#virtual_map').html('');
                $('#virtual_map_all').html('');
                let mapElem = 'virtual_map' //+ type;
                $('#'+mapElem).html('<div id="dv_map" style="width:100%;height:100%;background:#eaecef"></div>');
             
                const attribution = '&copy; <a class="attribution" href="https://www.omniyat.com/">Omniyat</a>';
           

                defaults.defaultLayer = new L.TileLayer("https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}", { minZoom: 1, maxZoom: 30,attribution});
                
                defaults.PTV_TRUCK = new L.TileLayer('https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=silkysand&layers=PTV_TruckAttributes,background,transport,labels',{pane: 'tilePane', minZoom: 3, maxZoom: 18, noWrap: true});
                defaults.Transport = new L.TileLayer('https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=silkysand&layers=transport');
                defaults.Labels = new L.TileLayer('https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}?storedProfile=silkysand&layers=labels');
                
                
                let _zoom = (type =='')? 10 : defaults.currentZoom; 
                defaults.map = L.map('dv_map', {
                    center:  defaults.defaultPoint,
                    zoom: _zoom, 
                    layers: [defaults.defaultLayer],
                    crs: L.CRS.PTVMercator,
                    maxZoom: 17,
                
                });

                var overlays = {
                    'PTV Truck Attributes': defaults.PTV_TRUCK,
                    
                  };
                  
                  L.control.layers(null, overlays, { collapsed: false }).addTo(defaults.map);

                // defaults.map.on('click',async e => {
                //     const {lat,lng} = e.latlng
                //     defaults.marker = new L.marker([0, 0],{
                //         icon:setIcon('../icons/map-pin.svg'),
                //       }).addTo(defaults.map);
        
                //     defaults.marker.setLatLng([lat,lng]);
                //     const location = await $().PTV('SearchByPoints',{lat:lng,lng:lat});
                //     console.log('location is : ',location);
                //     const {address:{city,country,province,state,postalCode}}=location
                //     defaults.marker.bindPopup(`<p>
                      
                //        <span>Latitude ${lat}</span>
                //        <span>Longitude ${lng}</span>
                //        <span>${city} ${country} ${province}</span>
                    
                //     </p>`)
                // })

                defaults.map.on('click', async function(e) {
                
                    const {lat,lng} = e.latlng;

                    defaults.marker = new L.marker([lat,lng],{
                        icon:setIcon('../icons/map-pin.svg')
                    }).addTo(defaults.map)
               
                    const location = await $().PTV('SearchByPoints',{lat:lng,lng:lat});
                    console.log('location is : ',location);
                    const {address:{city,country,province,state,postalCode}}=location
                    defaults.marker.bindPopup(`<p>
                      
                       <span>Latitude ${lat}</span>
                       <span>Longitude ${lng}</span>
                       <span>${city} ${country} ${province}</span>
                    
                    </p>`)

                });
                defaults.map.invalidateSize();
            }
            defaults.oldType = type;
             $().PTV('init') 

        }   
    }

     $.fn.Map = function( options ) {  
		var t = [];
		if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || ! options) {
            return methods.init.apply(this, arguments);
        }
    };


}( jQuery ));