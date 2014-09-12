var App = angular.module('App', ['ngLocale', 'ngRoute', 'ngActivityIndicator', 'toaster', 'mgcrea.ngStrap', 'highcharts-ng']);

App.config(function($routeProvider, $datepickerProvider, $activityIndicatorProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'partials/service.html',
      controller: 'ServiceCtrl'
    })
    .when('/import', {
      templateUrl: 'partials/import.html',
      controller: 'ImportCtrl'
    })
    .when('/setting', {
      templateUrl: 'partials/setting.html',
      controller: 'SettingCtrl'
    })
    .when('/service/month', {
      templateUrl: 'partials/service_month.html',
      controller: 'ServiceMonthCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });

  $activityIndicatorProvider.setActivityIndicatorStyle('DottedWhite');
  angular.extend($datepickerProvider.defaults, {
    dateFormat: 'dd/MM/yyyy',
    startWeek: 1,
    animation: 'am-fade',
    autoclose: true,
    iconRight: 'fa fa-angle-right',
    iconLeft: 'fa fa-angle-left'
  });
});