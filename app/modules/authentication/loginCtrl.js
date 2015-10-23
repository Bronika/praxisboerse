/**
 * Created by Bronika on 17.04.2015.
 */
'use strict';

var appAuthentication = angular.module('Authentication', ['ngCookies']);

/* appAuthentication.controller('TestConnection', function ($http, $scope) {
 $scope.testConnection = function () {
 $http.get('https://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/credential/check/pobr1012/Sexicola9').then(function (response) {
 var data = response.data;
 $scope.temp = data;
 console.log(data);

 });
 };
 });
 */

/*The Login Controller contains a login() method which uses the Authentication Service
 *to validate the username and password entered into the login view
 */
appAuthentication.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
        function ($scope, $rootScope, $location, AuthenticationService) {
            // reset login status
            AuthenticationService.ClearCredentials();
            console.log("Credentials cleared!");

            $scope.login = function () {
                console.log("Login function started");
                $scope.dataLoading = true;
                AuthenticationService.Login($scope.username, $scope.password, function (response) {
                    console.log("response status in login function: " + response);
                    console.log("response status code in login function: " + response.status);
                    if (response == 200) {
                        AuthenticationService.SetCredentials($scope.username, $scope.password);
                        console.log("Credentials set" + $scope.username);
                        $location.path('/home');
                        console.log("Authentication passed");
                    } else {
                        $scope.error = response.message;
                        console.log("error message due to failed login:" + $scope.error);
                        $scope.dataLoading = false;
                        console.log("Authentication failed");
                    }
                });
            };
        }]);


