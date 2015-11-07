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

		map = new ol.Map({
			layers: [
				new ol.layer.Tile({
					source: new ol.source.OSM(),
					opacity: 0.7
				}),
				new ol.layer.Tile({
					opacity: 1,
					source: new ol.source.WMTS(options)
				})
			],
			target: 'map',
			view: new ol.View({
				center: [19412406.33, -5050500.21],
				zoom: 5
			})
		});
	});
});