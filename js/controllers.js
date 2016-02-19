angular.module('starter.controllers', [])

  .controller('BasicCtrl', function($scope) {


  })

  .controller('EditableCtrl', function($scope) {
    $scope.data = {
      minValue: 0,
      maxValue: 10,
      step: 1,
      tip: true
    };

  })
  .controller('AdvancedCtrl', function($scope) {


  });
