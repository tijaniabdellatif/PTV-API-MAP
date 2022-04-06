(function ($) {

     let defaults = {

          xtok:'xtok',
          token:"ECA9FBA9-47E5-4749-BDB0-22E0184AA44C",
          isInit:false
     }


     let methods = {

        init:function(){

            if(defaults.isInit) return

            defaults.xmapClient = new XMapClient('https://xserver2.cloud.ptvgroup.com/services/rs/XMap/experimental/');
            defaults.xmapClient.setCredentials(defaults.xtok, defaults.token);
            defaults.xrouteClientExperimental = new XRouteClient("https://xserver2.cloud.ptvgroup.com/services/rs/XRoute/experimental/"); // "https://xroute-eu-n.cloud.ptvgroup.com/xroute/"); // "https://xroute-eu-n.cloud.ptvgroup.com/xroute/"
            defaults.xrouteClientExperimental.setCredentials(defaults.xtok, defaults.token);
            defaults.locateClient = new XLocateClient('https://xserver2.cloud.ptvgroup.com/services/rs/XLocate/experimental/')
            defaults.locateClient.setCredentials(defaults.xtok, defaults.token);
            console.log(defaults.xmapClient);
            console.log(defaults.xrouteClientExperimental)
            defaults.isInit = true
        },

         getData(key){
            return defaults[key]
          },
          setData(key, value){
             defaults[key] = value
          },


          renderMapXY : function(latlng) {

                  const options = {

                    "mapSection": {
                        "$type": "MapSectionByCenter",
                        "centerCoordinate": {
                          "x": latlng.lat,
                          "y": latlng.lng
                        },
                        "zoom": 10
                      },
                      "imageOptions": {
                        "width": 800,
                        "height": 600
                      }   
                  };

                  return new Promise((resolve,reject) => {

                       defaults.xmapClient.renderMap(options,(res,err)=> {

                           if(!err){

                               return resolve(res);
                           }

                           reject(err);

                       },100000)
                  })
                
          },

          SearchByPoints : function(latlng){

            const options = {

            "$type": "SearchByPositionRequest",
            "coordinate": {
                "x": latlng.lat,
                "y": latlng.lng
                 }
              }

              return new Promise((resolve,reject) => {

                   defaults.locateClient.searchLocations(options,(res,err)=> {

                         if(!err){

                          console.log('this is the search by point : ',res);

                            const{results:[{location}]} = res;
                            const {address,referenceCoordinate:exactPoints,formattedAddress}=location;
                            resolve({address,exactPoints,formattedAddress});
                         }
                         reject(err);
                   },10000)
              })

          },

          FindByText : function(text = ''){

            const options = {

              "$type": "SearchByTextRequest",
              "text": text
            }

            return new Promise((resolve,reject) => {

                 defaults.locateClient.searchLocations(options,(res,err)=>{
                
                    if(!err){

                          resolve(res);
                    }

                    reject(err);
                
                },100000);
            })

          },

          searchByLocations : function(search = ''){

             
             const options = {
              
                "$type": "SearchByTextRequest",
                "text": search,
                "requestProfile": {
                  "mapLanguage": "fr"
                }
              
             };

             return new Promise((resolve,reject) => {

                   defaults.locateClient.searchLocations(options,(res,err)=>{

                        if(!err){

                          console.log('the result is : ',res);

                         const {results} = res;
                          const result = results.map(item => {
                                return {
                                     loc:[item.location.referenceCoordinate.y,item.location.referenceCoordinate.x],
                                     title:item.location.formattedAddress,
                                     term:search,
                                     exact:item.location.formattedAddress + ' ' +item.location.address.country,
                                     score:item.matchQuality.totalScore,
                                     type:item.type
                                }
                          })
                          resolve(result);
                        }

                        reject(err)
                   } ,100000)
             })
          },

          calculateRouteCost: function(latlngs){

             let waypoints = [];
             for(let latlng of latlngs){

              waypoints.push(
                {
                  "$type": "OffRoadWaypoint",
                  "location": {
                    "offRoadCoordinate": {
                      "x": latlng.lng,
                      "y": latlng.lat
                    }
                  }
                }
              )
             }

             const resultFields = {

                  "monetaryCostsReport": true,
                  "polyline":true
             }

              const routeOptions = {
              "timeConsideration": {
                "$type": "ExactTimeConsiderationAtStart",
                "referenceTime": "2022-04-04T16:29:10+01:00"
                 },
                 "calculationCriteria": "MONETARY_COSTS",
                  "monetaryCostOptions": {
                    "costPerKilometer": 0.65,
                    "workingCostPerHour": 10,
                    "costPerEnergyUnit": 1
                    },
                    "currency": "EUR"
              }

              const requestProfile ={

                    "routingProfile": {
                      "searchSpace": {
                        "heuristicAggressiveness": 0
                      }
                    },
                     "featureLayerProfile": {
                                "themes": [{
                                    "id": "PTV_SpeedPatterns",
                                    "enabled": true
                                }, {
                                    "id": "PTV_TrafficIncidents",
                                    "enabled": true
                                },
                                {
                                    "id": "PTV_TruckAttributes",
                                    "enabled": true
                                }]
                            },
                      "vehicleProfile": {
                      "engine": {
                        "fuelConsumption": 35,
                        "consumptionFactorsPerSpeed": [
                          {
                            "speed": 10,
                            "factor": 1.7
                          },
                          {
                            "speed": 30,
                            "factor": 1.5
                          },
                          {
                            "speed": 50,
                            "factor": 1
                          },
                          {
                            "speed": 70,
                            "factor": 0.8
                          },
                          {
                            "speed": 80,
                            "factor": 0.8
                          },
                          {
                            "speed": 90,
                            "factor": 1
                          },
                          {
                            "speed": 100,
                            "factor": 1.7
                          }
                        ]
                      }
                    }
              }
          

              return new Promise((resolve,reject) => {

                defaults.xrouteClientExperimental.calculateRoute({waypoints,resultFields,routeOptions,requestProfile},(res,err)=>{


                         if(!err){

                            resolve(res);
                         }

                         reject(err);
                     },10000)
              })

          }
     }

     $.fn.PTV = function( options ) {  
        var t = [];
        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || ! options) {
            return methods.init.apply(this, arguments);
        }
      };

}( jQuery ));