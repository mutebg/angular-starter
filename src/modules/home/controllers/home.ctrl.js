function HomeCtrl($scope) {
	$scope.message = 'helloooooy';
}

angular
	.module('app.home')
	.controller('HomeCtrl', HomeCtrl);
