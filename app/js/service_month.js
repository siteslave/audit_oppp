
var _ = require('underscore'),
    jf = require('jsonfile'),
    moment = require('moment');

var config = jf.readFileSync(configFile);

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  }
});

App.controller('ServiceMonthCtrl', function ($scope, $rootScope, $activityIndicator, ServiceFactory) {

  $activityIndicator.startAnimating();
  $rootScope.showLoading = false;
  $scope.isSuccess = false;

  $scope.month = [
    {
      code: 1,
      shortName: 'ม.ค',
      fullName: 'มกราคม'
    },
    {
      code: 2,
      shortName: 'ก.พ',
      fullName: 'กุมภาพันธ์'
    },
    {
      code: 3,
      shortName: 'มี.ค.',
      fullName: 'มีนาคม'
    },
    {
      code: 4,
      shortName: 'เม.ย.',
      fullName: 'เมษายน'
    },
    {
      code: 5,
      shortName: 'พ.ค.',
      fullName: 'พฤษภาคม'
    },
    {
      code: 6,
      shortName: 'มิ.ย.',
      fullName: 'มิถุนายน'
    },
    {
      code: 7,
      shortName: 'ก.ค.',
      fullName: 'กรกฎาคม'
    },
    {
      code: 8,
      shortName: 'ส.ค.',
      fullName: 'สิงหาคม'
    },
    {
      code: 9,
      shortName: 'ก.ย.',
      fullName: 'กันยายน'
    },
    {
      code: 10,
      shortName: 'ต.ค.',
      fullName: 'ตุลาคม'
    },
    {
      code: 11,
      shortName: 'พ.ย.',
      fullName: 'พฤศจิกายน'
    },
    {
      code: 12,
      shortName: 'ธ.ค.',
      fullName: 'ธันวาคม'
    }
  ];

  var promise = ServiceFactory.getDistinctHospitals();
  promise
    .then(function (data) {
      return ServiceFactory.getHospitalList(data);
    })
    .then(function (data) {
      $scope.hospitals = data;
    }, function (err) {
      console.log(err);
    });


  $scope.chartConfig = {
    //This is not a highcharts object. It just looks a little like one!
    options: {
      //This is the Main Highcharts chart config. Any Highchart options are valid here.
      //will be ovverriden by values specified below.
      chart: {
        type: 'column'
      },
      tooltip: {
        style: {
          padding: 10,
          fontWeight: 'bold'
        }
      }
    },

    //The below properties are watched separately for changes.

    //Series object (optional) - a list of series using normal highcharts series options.
    series: [
      {
        data: [],
        name: 'คน'
      },
        {
        data: [],
        name: 'ครั้ง'
      }
    ],
    //Title configuration (optional)
    title: {
      text: 'สถิติรายเดือน​(OP Visit)'
    },
    //Boolean to control showng loading status on chart (optional)
    loading: false,
    //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
    //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
    xAxis: {
      title: {text: 'เดือน'},
      //categories: ['ม.ค', 'ก.พ', 'มี.ค', 'เม.ย', 'พ.ค']
      categories: []
    },
    yAxis: {
      title: {
        text: 'คน/ครั้ง'
      }
    },
    //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
    useHighStocks: false,
    //size (optional) if left out the chart will default to size of the div or something sensible.
    size: {
      //width: 400,
      //height: 300
    },
    //function (optional)
    func: function (chart) {
      //setup some logic for the chart
    }

  };

  // do filter
  $scope.doFilter = function () {
    var hospital = $scope.hospital,
        startDate = moment($scope.startDate).format('YYYY-MM-DD'),
        endDate = moment($scope.endDate).format('YYYY-MM-DD');

    $rootScope.showLoading = true;

    // clear old data
    $scope.chartConfig.series[0].data = [];
    $scope.chartConfig.series[1].data = [];

    $scope.result = [];
    $scope.chartConfig.xAxis.categories = [];

    // hide result and graph
    $scope.isSuccess = false;

    // get result
    ServiceFactory.getResult(startDate, endDate, hospital)
      .then(function (data) {
        $scope.result = [];

        //$scope.chartConfig.series[0].name = 'คน';
        //$scope.chartConfig.series[1].name = 'ครั้ง';

//        _.each(data, function (v) {
//          var obj = {};
//          obj.month = _.findWhere($scope.month, {code: v.m});
//          $scope.chartConfig.xAxis.categories.push(obj.month.shortName);
//        });

        _.each(data, function (v) {
          var obj = {};
          obj.month = _.findWhere($scope.month, {code: v.m});
          obj.year = parseInt(v.y) + 543;
          obj.total_t = v.t;
          obj.total_p = v.p;

          $scope.result.push(obj);
          $scope.chartConfig.series[0].data.push(v.p);
          $scope.chartConfig.series[1].data.push(v.t);

          $scope.chartConfig.xAxis.categories.push(obj.month.shortName);

        });


        $rootScope.showLoading = false;
        $scope.isSuccess = true;
      }, function (err) {
        console.log(err);
        $rootScope.showLoading = false;
      })
  };

});

App.factory('ServiceFactory', function ($q) {

  var serviceFactory = {};

  serviceFactory.getHospitalList = function (h) {

    var q = $q.defer();

    knex
      .select('hospcode', 'hospname')
      .from('chospcode')
      .whereIn('hospcode', h)
      .exec(function (err, data) {
        if (err) q.reject(err);
        else q.resolve(data);
      });

    return q.promise;
  };

  serviceFactory.getDistinctHospitals = function () {

    var q = $q.defer();

    var hospcode = knex('person')
      .distinct('hospcode')
      .select('hospcode')
      .exec(function (err, data) {
        if (err) q.reject(err);
        else {
          var hosp = [];
          _.each(data, function (v) {
            hosp.push(v.hospcode);
          });
          q.resolve(hosp);
        }
      });

    return q.promise;
  };

  serviceFactory.getResult = function (startDate, endDate, hospcode) {

    var q = $q.defer();
    /*
     select month(s.date_serv) as m, year(s.date_serv) as y, count(DISTINCT s.seq) as t
     from service as s
     inner join diagnosis_opd as d on d.seq=s.seq

     where d.diagcode not in (select code from ref_icd10_pp)
     and d.diagtype='1' and s.hospcode='04918'
     group by month(s.date_serv), year(s.date_serv)
     order by m, y
     */

    var ppCode = knex('ref_icd10_pp')
      .select('code');

    knex
      .select(knex.raw('MONTH(s.DATE_SERV) as m'), knex.raw('YEAR(s.DATE_SERV) as y'),
        knex.raw('COUNT(DISTINCT s.SEQ) as t'), knex.raw('COUNT(DISTINCT s.PID) as p')
      )
      .from('service as s')
      .innerJoin('diagnosis_opd as d', 'd.SEQ', 's.SEQ')
      .whereNotIn('d.DIAGCODE', ppCode)
      .where('d.DIAGTYPE', '1')
      .where('s.HOSPCODE', hospcode)
      .whereBetween('s.DATE_SERV', [startDate, endDate])
      .groupByRaw('MONTH(s.DATE_SERV)')
      .groupByRaw('YEAR(s.DATE_SERV)')
      .orderBy('m')
      .orderBy('y')
      .exec(function (err, docs) {
        if (err) q.reject(err);
        else q.resolve(docs);
      });

    return q.promise;
  };

  return serviceFactory;

});