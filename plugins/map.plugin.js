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
             
                const attribution = '&copy; <a class="attribution" href="https://www.omniyat.com/">Omniyat</a>'
                defaults.defaultLayer = new L.TileLayer("https://xserver2.cloud.ptvgroup.com/services/rest/XMap/tile/{z}/{x}/{y}", { minZoom: 1, maxZoom: 30,attribution});

                console.log('default layer : ',defaults.defaultLayer);
            
                let _zoom = (type =='')? 10 : defaults.currentZoom; 
                defaults.map = L.map('dv_map', {
                    center:  defaults.defaultPoint,
                    zoom: _zoom, 
                    layers: [defaults.defaultLayer],
                    crs: L.CRS.PTVMercator,
                    maxZoom: 17,
                    closePopupOnClick:true
                });




              defaults.marker = new L.marker([0, 0],{
                icon:setIcon('../icons/map-pin.svg'),
                draggable:true
              }).addTo(defaults.map);

             
                

                defaults.map.on('click',async e => {

                    const {lat,lng} = e.latlng
                    defaults.marker.setLatLng([lat,lng]);
                    const location = await $().PTV('SearchByPoints',{lat:lng,lng:lat});
                    console.log('this is the location :',location);
                })
             
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