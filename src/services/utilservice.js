function UtilService() {

  return {
    getData: getData,
  }

  function getData() {
    return false;
  }

}

angular.module('app.services')
	.service('UtilService', UtilService);
