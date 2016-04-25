var app = angular.module('trand');
app.controller('searchController', search);
app.$inject = ['$http', '$scope', '$location', 'listService', '$sce'];
function search($http, $scope, $location, listService, $sce) {
  var vm = this;
  var found = 0;
  vm.results =[];
  vm.busy = false;
  vm.search = function () {
    found = 0;
    vm.results =[];
    var offset = found;
    var limit = 36;
    var search = $http.get(
      '/api/search?fts=' + $scope.content + '&cat=' + $scope.category +'&offset=' + offset + '&limit=' + limit
    );
    search.then(function (res) {
      console.log(res.data[0]);
      for (var i = 0; i < res.data.length; i++) {
        vm.results.push(res.data[i]);
      }
      found = found + parseInt(res.data.length);
    })
  }
  vm.nextPage = function () {
    if (this.busy) return;
    this.busy = true;

    var limit = 12;
    var search = $http.get(
      '/api/search?fts=' + $scope.content + '&offset=' + found + '&limit=' + limit
    );
    search.then(function (res) {
      found = found + res.data.length;
      for (var i = 0; i < res.data.length; i++) {
        vm.results.push(res.data[i]);
      }
      vm.busy=false
    })
  }
  vm.productDetail = function (itemId) {
    $('#'+itemId).modal('show');
  }

  function getCategory() {
    var categories =$http.get('/api/category');
    categories.then(function (res) {
      vm.categories = res.data;
    })
  }
  function activate() {
    getCategory();
  }
  activate();
}
