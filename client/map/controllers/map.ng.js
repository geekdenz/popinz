angular.module("socially").controller("MapCtrl", function ($scope, $meteor) {
	/*$scope.parties = $meteor.collection(Parties);
	 
	 $scope.remove = function (party) {
	 $scope.parties.splice($scope.parties.indexOf(party), 1);
	 };
	 
	 $scope.removeAll = function () {
	 $scope.parties.remove();
	 };
	 */
	var parser = new ol.format.WMTSCapabilities();
	var map;
	$.ajax('WMTSCapabilities.xml').then(function (response) {
		var result = parser.read(response);
		var options = ol.source.WMTS.optionsFromCapabilities(result,
				{layer: 'set-2', matrixSet: 'EPSG:3857'});
		var source = new ol.source.Vector({
			//url: 'data/nz_simplified_3857.json',
			url: 'data/endemism-3857.json',
			format: new ol.format.GeoJSON()
		});
		var heatmapLayer = new ol.layer.Heatmap({
			source: source,
			opacity: 0.6,
			blur: 5,
			radius: 15,
			name: 'Endemicity (Heatmap)',
			visible: false
		});
		source.on('addfeature', function (event) {
			var density = event.feature.get('cwe');
			//var magnitude = parseFloat(name.substr(2));
			//console.log(density);
			event.feature.set('weight', density * 10);
		});
		heatmapLayer.setRadius(5);
		heatmapLayer.setBlur(15);
		/*
		var vector = new ol.layer.Heatmap({
			source: new ol.source.Vector({
				url: 'data/kml/2012_Earthquakes_Mag5.kml',
				format: new ol.format.KML({
					extractStyles: false
				})
			}),
			blur: 5,
			radius: 15,
			visible: false
		});
		*/
		var popSource = new ol.source.Vector({
			//url: 'data/nz_simplified_3857.json',
			url: 'data/population_density_meshblock-3857.geojson',
			format: new ol.format.GeoJSON()
		});
		var popVector = new ol.layer.Vector({
			source: popSource,
			name: 'Population (Choropleth)'
		});
		var min=0,max=3;
		popSource.on('addfeature', function (event) {
			var feature = event.feature;
			var popDensity = feature.get('pop_density');
			var weight = popDensity / max;
			var value = Math.round(weight * 20);
			var hsl = 'hsla(15, '+ value +'%, 47%, 1)';
			var style = new ol.style.Style({
				fill: new ol.style.Fill({
					color: hsl
				})
			});
			feature.setStyle(style);
		});

/*
		vector.getSource().on('addfeature', function (event) {
			// 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
			// standards-violating <magnitude> tag in each Placemark.  We extract it from
			// the Placemark's name instead.
			var name = event.feature.get('name');
			var magnitude = parseFloat(name.substr(2));
			//console.log('magnitude', magnitude);
			event.feature.set('weight', magnitude - 5);
		});
		*/
		var layers = [
			new ol.layer.Tile({
				source: new ol.source.OSM(),
				opacity: 0.7,
				name: 'OSM'
			}),
			popVector,
			/*
			 new ol.layer.Tile({
			 opacity: 1,
			 source: new ol.source.WMTS(options)
			 }),
			 */
			heatmapLayer
					//vector
		];
		$scope.layers = layers;
		$scope.toggleVisible = function(layer) {
			layer.setVisible(!layer.getVisible());
		};
		map = new ol.Map({
			layers: layers,
					target: 'map',
			view: new ol.View({
				center: [19412406.33, -5050500.21],
				zoom: 5
			})
		});
		$scope.map = map;
		// getFeaturesAtCoordinate
		map.on('singleclick', function (evt) {
			var feature = map.forEachFeatureAtPixel(evt.pixel,
					function (feature, layer) {
						// do stuff here with feature
						return feature; //[feature, layer];
					});
			var popDensity = feature.get('pop_density');
			var resPop = feature.get('res_pop');
			console.log('feature', popDensity, resPop);
		});
	});
});