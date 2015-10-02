angular
	.module('app.router', [])
    .config(function($stateProvider, $urlRouterProvider) {

		//routing
    $urlRouterProvider.otherwise("/home");
    $stateProvider
    	.state('home', {
      	url: '/home',
      	templateUrl: 'modules/home/views/home.tpl.html',
				controller: 'HomeCtrl',
			})
	});
