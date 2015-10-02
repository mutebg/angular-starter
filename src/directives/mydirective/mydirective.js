function mydirective() {
	return {
		restrict: 'E',
		scope: {
			device: '='
		},
		templateUrl: 'directives/mydirective/mydirective.tpl.html',
		link: function(scope) {
		}
	}
}
angular.module('app.directives').directive('mydirective', mydirective)
