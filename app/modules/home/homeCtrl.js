/**
 * Created by Bronika on 18.04.2015.
 */
'use strict';
angular.module('Home', ['Authentication', 'ui.bootstrap'])

    .controller('HomeController',
    ['$scope', '$http', '$rootScope', '$filter', '$modal', '$log', 'AuthenticationService', '$location',
        function ($scope, $http, $rootScope, $filter, $modal, $log, AuthenticationService, $location) {
            console.log('before ' + $rootScope.globals.currentUser.authdata);
            //works fine
            /*var reqOffers ={
             method:'GET',
             url: 'https://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/joboffer/offers/joboffer' + '/' + 0 + '/' + -1 ,withCredentials:true,
             headers:{
             'x-requested-with': 'XMLHttpRequest',
             'Authorization': 'Basic '+ $rootScope.globals.currentUser.authdata
             }};

             $http(reqOffers).success(function(data,response){
             console.log("data reqOffers: "+data);
             console.log("response status: "+response);
             callback(response);
             });*/
            $scope.logout = function () {
                AuthenticationService.ClearCredentials();
                $location.path('/login');
            };

            $scope.updateNotices = function (item) {

                if (item.onNotepad) {
                    var reqNotices = {
                        method: 'POST',
                        url: 'https://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/joboffer/notepad/offer',
                        data: item.id,
                        withCredentials: true,
                        headers: {
                            'x-requested-with': 'XMLHttpRequest',
                            'Authorization': 'Basic ' + $rootScope.globals.currentUser.authdata
                        }
                    };

                } else {
                    var reqNotices = {
                        method: 'DELETE',
                        url: 'https://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/joboffer/notepad/offer/' + item.id,
                        withCredentials: true,
                        headers: {
                            'x-requested-with': 'XMLHttpRequest',
                            'Authorization': 'Basic ' + $rootScope.globals.currentUser.authdata
                        }
                    };
                }

                $http(reqNotices);
            };


            $scope.getData = function (offerType) {

                $scope.currentOfferType = offerType;
                var editedQuery = "";
                if (angular.isDefined($scope.query)) {
                    editedQuery = $scope.query.replace(" ", ",");
                }


                var reqOffers = {
                    method: 'GET',
                    url: 'https://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/joboffer/offers/' + offerType + '/' + editedQuery + '/' + 0 + '/' + -1,
                    withCredentials: true,
                    headers: {
                        'x-requested-with': 'XMLHttpRequest',
                        'Authorization': 'Basic ' + $rootScope.globals.currentUser.authdata
                    }
                };
                $log.info(reqOffers.url);

                $http(reqOffers).success(function (data, response) {
                    console.log("data reqOffers: " + data);
                    console.log("response status: " + response);
                    // alert(JSON.stringify(data.offers));
                    $scope.offers = loadOffers(data);
                    $scope.companies = data.companies;
                    //alert(JSON.stringify(data.companies));

                    //alert(JSON.stringify($scope.companies));

                    $scope.ctrlRead();

                }).error(function (data, status) {
                    $scope.offers = {};
                    //callback(response);
                });
            };

            var loadOffers = function (data) {
                angular.forEach(data.offers, function (item) {
                    item.country = data.countries[item.countryId];
                    item.company = data.companies[item.companyId];
                    $log.info(item.country);
                });
                return data.offers;
            };


            var reqOffersTyp = {
                method: 'GET',
                url: 'https://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/joboffer/offertypes/all',
                withCredentials: true,
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                    'Authorization': 'Basic ' + $rootScope.globals.currentUser.authdata
                }
            };
            $log.info(reqOffersTyp.url);

            $http(reqOffersTyp).success(function (data, response) {
                console.log("data reqOffers: " + data);
                console.log("response status: " + response);
                // alert(JSON.stringify(data.offers));
                $scope.offerType = data;

                $scope.getData($scope.offerType[0].shortname);
                //alert(JSON.stringify($scope.companies));

            }).error(function (data, status) {
                $scope.offerType = [];
                //callback(response);
            });


            //pagination
            $scope.ctrlRead = function () {
                // init

                //  $scope.reverse = false;
                $scope.items = $scope.offers;
                $scope.filteredItems = [];
                $scope.groupedItems = [];
                $scope.itemsPerPage = 10;
                $scope.pagedItems = [];
                $scope.currentPage = 0;


                var searchMatch = function (haystack, needle) {
                    if (!needle) {
                        return true;
                    }
                    if (Boolean(haystack)) {
                        return haystack.toString().toLowerCase().indexOf(needle.toLowerCase()) !== -1;
                    }
                };

                // init the filtered items
                $scope.search = function () {
                    $log.info("search");
                    $scope.getData($scope.currentOfferType);
                };

                // calculate page in place
                $scope.groupToPages = function () {
                    $scope.pagedItems = [];

                    for (var i = 0; i < $scope.filteredItems.length; i++) {
                        if (i % $scope.itemsPerPage === 0) {
                            $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [$scope.filteredItems[i]];
                        } else {
                            $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
                        }
                    }
                };

                $scope.range = function (start, end) {
                    var ret = [];
                    if (!end) {
                        end = start;
                        start = 0;
                    }
                    for (var i = start; i < end; i++) {
                        ret.push(i);
                    }
                    return ret;
                };

                $scope.prevPage = function () {
                    if ($scope.currentPage > 0) {
                        $scope.currentPage--;
                    }
                };

                $scope.nextPage = function () {
                    if ($scope.currentPage < $scope.pagedItems.length - 1) {
                        $scope.currentPage++;
                    }
                };

                $scope.setPage = function () {
                    $scope.currentPage = this.n;
                };

                // functions have been describe process the data for display


                $scope.filteredItems = $filter('filter')($scope.items, function (item) {
                    for (var attr in item) {
                        if (searchMatch(item[attr], $scope.query))
                            return true;
                    }
                    return false;
                });
                // take care of the sorting order
                /*  if ($scope.sortingOrder !== '') {
                 $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, $scope.reverse);
                 }*/
                $scope.currentPage = 0;
                // now group by pages
                $scope.groupToPages();
            };

            //get companyName from the hashtable companies by id
            $scope.getCompany = function (companyId) {
                return $scope.companies[companyId];
            };

            $scope.showCompany = function (company) {
                //view in a partialView home.html, no ng-controller necessary
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'myModalContent.html',
                    controller: 'ModalInstanceCtrl',
                    //size: size,
                    resolve: {
                        company: function () {

                            return company;
                        }
                    }
                });
            };

            $scope.toggleAnimation = function () {
                $scope.animationsEnabled = !$scope.animationsEnabled;
            };

            $scope.showNotices = function () {
                //view in a partialView home.html, no ng-controller necessary
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'notices.html',
                    controller: 'NotepadlistCtrl',
                    //size: size,
                    resolve: {}
                });

                modalInstance.result.then(function () {
                }, function () {

                    $scope.getData($scope.currentOfferType);
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

        }])

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, $log, company) {
        $log.info("COMPANY_ID" + company);
        $scope.company = company;
        /*  $scope.ok = function () {
         $modalInstance.close($scope.selected.item);
         };*/

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };


    })

    .controller('NotepadlistCtrl', function ($scope, $modalInstance, $http, $rootScope, $log) {
        $scope.getNotices = function () {
            var reqNotices = {
                method: 'GET',
                url: 'https://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/joboffer/notepad/' + 0 + '/' + -1,
                withCredentials: true,
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                    'Authorization': 'Basic ' + $rootScope.globals.currentUser.authdata
                }
            };
            $log.info(reqNotices.url);

            $http(reqNotices).success(function (data, response) {
                $scope.notepad = data;
                //alert(JSON.stringify(data));

            }).error(function (data, status) {
                $scope.notepad = {};
                //callback(response);
            });
        };

        $scope.updateNotices = function (item) {

            if (item.onNotepad) {
                var reqNotices = {
                    method: 'POST',
                    url: 'https://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/joboffer/notepad/offer',
                    data: item.id,
                    withCredentials: true,
                    headers: {
                        'x-requested-with': 'XMLHttpRequest',
                        'Authorization': 'Basic ' + $rootScope.globals.currentUser.authdata
                    }
                };

            } else {
                var reqNotices = {
                    method: 'DELETE',
                    url: 'https://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/joboffer/notepad/offer/' + item.id,
                    withCredentials: true,
                    headers: {
                        'x-requested-with': 'XMLHttpRequest',
                        'Authorization': 'Basic ' + $rootScope.globals.currentUser.authdata
                    }
                };
            }

            $http(reqNotices);
        };

        $scope.getNotices();
        $scope.cancel = function () {

            $modalInstance.dismiss('cancel');
        };


    })
    .filter('filterCountry', function ($filter) {
        return function (offers, queryCountry) {
            var countryMatch = new RegExp(queryCountry, 'i');
            return $filter('filter')(offers, function (value) {
                return (countryMatch.test(value.country.name));
            });
        };
    });

